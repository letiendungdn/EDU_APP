import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@app/prisma";
import * as apn from "@parse/node-apn";

@Injectable()
export class PushService implements OnModuleDestroy {
  private readonly logger = new Logger(PushService.name);
  private provider: apn.Provider | null = null;
  private readonly bundleId: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const keyPath = config.get<string>("APNS_KEY_PATH", "");
    const keyId = config.get<string>("APNS_KEY_ID", "");
    const teamId = config.get<string>("APNS_TEAM_ID", "");
    this.bundleId = config.get<string>(
      "APNS_BUNDLE_ID",
      "com.edu.nihongo.ios",
    );

    if (keyPath && keyId && teamId) {
      this.provider = new apn.Provider({
        token: { key: keyPath, keyId, teamId },
        production: config.get("NODE_ENV") === "production",
      });
      this.logger.log("APNs provider initialized");
    } else {
      this.logger.warn(
        "APNs not configured — set APNS_KEY_PATH, APNS_KEY_ID, APNS_TEAM_ID to enable push",
      );
    }
  }

  async registerToken(
    userId: number,
    token: string,
    platform = "ios",
  ): Promise<void> {
    await this.prisma.pushDeviceToken.upsert({
      where: { token },
      update: { userId, platform, updatedAt: new Date() },
      create: { userId, token, platform },
    });
  }

  async unregisterToken(token: string): Promise<void> {
    await this.prisma.pushDeviceToken.deleteMany({ where: { token } });
  }

  async unregisterAllForUser(userId: number): Promise<void> {
    await this.prisma.pushDeviceToken.deleteMany({ where: { userId } });
  }

  async sendSrsReminder(userId: number, dueCount: number): Promise<void> {
    if (!this.provider) return;

    const rows = await this.prisma.pushDeviceToken.findMany({
      where: { userId, platform: "ios" },
      select: { token: true },
    });
    if (!rows.length) return;

    const note = new apn.Notification();
    note.topic = this.bundleId;
    note.alert = {
      title: "📚 Ôn tập hôm nay",
      body: `Bạn có ${dueCount} thẻ cần ôn — duy trì streak nhé!`,
    };
    note.badge = dueCount;
    note.sound = "default";
    note.payload = { screen: "srs" };
    // expire after 1 hour so stale reminders don't pile up
    note.expiry = Math.floor(Date.now() / 1000) + 3600;

    const deviceTokens = rows.map((r) => r.token);
    const result = await this.provider.send(note, deviceTokens);

    for (const failure of result.failed) {
      this.logger.warn(
        `APNs failure for device ${failure.device}: ${failure.response?.reason ?? "unknown"}`,
      );
      const reason = failure.response?.reason;
      if (reason === "BadDeviceToken" || reason === "Unregistered") {
        await this.unregisterToken(failure.device);
      }
    }
  }

  onModuleDestroy() {
    this.provider?.shutdown();
  }
}
