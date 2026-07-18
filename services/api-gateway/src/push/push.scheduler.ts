import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "@app/prisma";
import { PushService } from "./push.service";

@Injectable()
export class PushScheduler {
  private readonly logger = new Logger(PushScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
  ) {}

  // 9 AM Vietnam time every day
  @Cron("0 9 * * *", { timeZone: "Asia/Ho_Chi_Minh" })
  async sendDailyReminders() {
    this.logger.log("Sending daily SRS reminders…");

    const groups = await this.prisma.srsCard.groupBy({
      by: ["userId"],
      where: {
        nextReviewAt: { lte: new Date() },
        mastered: false,
      },
      _count: { id: true },
    });

    let sent = 0;
    for (const { userId, _count } of groups) {
      await this.push.sendSrsReminder(userId, _count.id);
      sent++;
    }

    this.logger.log(`Reminder dispatched to ${sent} user(s)`);
  }
}
