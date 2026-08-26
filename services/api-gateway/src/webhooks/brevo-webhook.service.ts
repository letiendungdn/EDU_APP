import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@app/prisma";
import type { BrevoWebhookEventDto } from "./dto/brevo-event.dto";

@Injectable()
export class BrevoWebhookService {
  private readonly logger = new Logger(BrevoWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handleEvent(event: BrevoWebhookEventDto): Promise<void> {
    const email = event.email?.toLowerCase();
    if (!email) return;

    switch (event.event) {
      case "hard_bounce":
      case "complaint":
        await this.markBounced(email, event.event);
        break;

      case "unsubscribe":
        await this.handleUnsubscribe(email);
        break;

      default:
        // delivered, soft_bounce, etc. — no action needed
        break;
    }
  }

  private async markBounced(email: string, reason: string): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: { email },
      data: { emailBounced: true },
    });
    if (result.count > 0) {
      this.logger.warn({ email, reason }, "Marked email as bounced");
    }
  }

  private async handleUnsubscribe(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return;

    await this.prisma.emailPrefs.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        receiveProgress: false,
        receiveStreak: false,
      },
      update: {
        receiveProgress: false,
        receiveStreak: false,
      },
    });
    this.logger.log({ email }, "User unsubscribed from all product emails");
  }
}
