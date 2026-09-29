import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { KafkaProducerService } from "./kafka.producer";

type OutboxRow = {
  id: number;
  topic: string;
  key: string | null;
  payload: Prisma.JsonValue;
};

/** Sau số lần này event không tự thử nữa — cần người xem `lastError` (không vòng lặp vô hạn). */
export const OUTBOX_MAX_ATTEMPTS = 20;
const BATCH_SIZE = 100;
const INTERVAL_MS = 1000;

/**
 * Đẩy OutboxEvent chưa gửi lên Kafka.
 * - `FOR UPDATE SKIP LOCKED` trong transaction: nhiều pod exam-service chạy song song không gửi trùng dòng.
 * - Gửi thành công → publishedAt; thất bại → attempts++ và lastError, lượt sau thử lại.
 * - Có thể gửi trùng (gửi xong nhưng chết trước khi commit) → consumer phải idempotent theo payload.eventId.
 */
@Injectable()
export class OutboxRelayService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaProducerService,
  ) {}

  onApplicationBootstrap() {
    if (process.env.OUTBOX_RELAY_DISABLED === "true") return;
    this.timer = setInterval(() => void this.tick(), INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Một lượt relay; trả về số event đã gửi. Không chạy chồng lượt. */
  async tick(): Promise<number> {
    if (this.running) return 0;
    this.running = true;
    try {
      return await this.relayBatch();
    } catch (error) {
      this.logger.error(`Outbox relay lỗi: ${String(error)}`);
      return 0;
    } finally {
      this.running = false;
    }
  }

  private relayBatch(): Promise<number> {
    return this.prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<OutboxRow[]>`
          SELECT id, topic, key, payload
          FROM "OutboxEvent"
          WHERE "publishedAt" IS NULL AND attempts < ${OUTBOX_MAX_ATTEMPTS}
          ORDER BY id
          LIMIT ${BATCH_SIZE}
          FOR UPDATE SKIP LOCKED`;
        if (rows.length === 0) return 0;

        let published = 0;
        for (const [topic, group] of groupByTopic(rows)) {
          const ids = group.map((r) => r.id);
          try {
            await this.kafka.send(
              topic,
              group.map((r) => ({ key: r.key, value: JSON.stringify(r.payload) })),
            );
            await tx.outboxEvent.updateMany({
              where: { id: { in: ids } },
              data: { publishedAt: new Date() },
            });
            published += group.length;
          } catch (error) {
            await tx.outboxEvent.updateMany({
              where: { id: { in: ids } },
              data: { attempts: { increment: 1 }, lastError: String(error).slice(0, 1000) },
            });
            this.logger.warn(`Gửi ${group.length} event "${topic}" thất bại, sẽ thử lại: ${String(error)}`);
          }
        }
        return published;
      },
      { timeout: 30_000 },
    );
  }
}

export function groupByTopic(rows: OutboxRow[]): Map<string, OutboxRow[]> {
  const groups = new Map<string, OutboxRow[]>();
  for (const row of rows) {
    const list = groups.get(row.topic) ?? [];
    list.push(row);
    groups.set(row.topic, list);
  }
  return groups;
}
