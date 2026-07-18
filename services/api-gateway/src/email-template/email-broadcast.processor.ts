import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '@app/prisma';
import { MAIL_PORT, type MailPort } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from './email-template.service';
import { TEMPLATE_SAMPLE_VARS } from './email-template.defaults';
import {
  EMAIL_BROADCAST_QUEUE,
  type ComposeJobData,
  type SendTemplateJobData,
} from './email-broadcast.types';

export { EMAIL_BROADCAST_QUEUE } from './email-broadcast.types';
export type { ComposeJobData, SendTemplateJobData } from './email-broadcast.types';

@Processor(EMAIL_BROADCAST_QUEUE)
export class EmailBroadcastProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailBroadcastProcessor.name);
  private readonly appName: string;
  private readonly appPublicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => EmailTemplateService))
    private readonly emailTemplateService: EmailTemplateService,
    @Inject(MAIL_PORT) private readonly mailPort: MailPort,
    config: ConfigService,
  ) {
    super();
    this.appName = config.get<string>('mail.appName') ?? 'Nihongo EDU';
    this.appPublicUrl = (
      config.get<string>('mail.appPublicUrl') ?? 'http://nihongo.localhost:8080'
    ).replace(/\/$/, '');
  }

  async process(job: Job<SendTemplateJobData | ComposeJobData>): Promise<void> {
    if (job.name === 'send-template') {
      await this.processSendTemplate(job as Job<SendTemplateJobData>);
    } else if (job.name === 'compose') {
      await this.processCompose(job as Job<ComposeJobData>);
    }
  }

  private async processSendTemplate(job: Job<SendTemplateJobData>): Promise<void> {
    const { broadcastId, userId, email, name, templateName, customVars } = job.data;

    try {
      // Build vars: sample base + user identity + per-template real data + admin overrides
      const baseVars = {
        ...TEMPLATE_SAMPLE_VARS[templateName] ?? {},
        appName: this.appName,
        userName: name || email.split('@')[0],
        appUrl: this.appPublicUrl,
        loginUrl: `${this.appPublicUrl}/login`,
        supportUrl: `${this.appPublicUrl}/support`,
      };

      // Fetch real SRS data for data-driven templates
      if (templateName === 'weekly_progress') {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [cardsReviewed, newMastered, totalMastered] = await Promise.all([
          this.prisma.srsCard.count({ where: { userId, lastReviewedAt: { gte: since } } }),
          this.prisma.srsCard.count({ where: { userId, mastered: true, lastReviewedAt: { gte: since } } }),
          this.prisma.srsCard.count({ where: { userId, mastered: true } }),
        ]);
        const streak = await this.calcStreak(userId);
        Object.assign(baseVars, {
          cardsReviewed,
          newMastered,
          totalMastered,
          currentStreak: streak,
          streakLabel: streak > 0 ? `🔥 ${streak} ngày` : '—',
        });
      }

      if (templateName === 'streak_milestone') {
        const streak = await this.calcStreak(userId);
        const EMOJI: Record<number, string> = { 7: '🌱', 30: '⭐', 100: '🏆' };
        const sampleMilestone = (TEMPLATE_SAMPLE_VARS['streak_milestone'] as Record<string, unknown>)?.['milestone'];
        const milestone = Number(customVars?.['milestone'] ?? sampleMilestone ?? 30);
        Object.assign(baseVars, {
          milestone,
          currentStreak: streak,
          emoji: EMOJI[milestone] ?? '🔥',
        });
      }

      const mergedVars = { ...baseVars, ...customVars };
      const { subject, html, text } = await this.emailTemplateService.preview(templateName, mergedVars);

      await this.mailPort.send({
        to: { email, name: name ?? undefined },
        subject,
        html,
        text,
        tags: [templateName, 'broadcast'],
      });

      await this.updateCount(broadcastId, 'sent');
    } catch (err) {
      this.logger.error({ err, email, templateName, broadcastId }, 'Broadcast job failed');
      await this.updateCount(broadcastId, 'failed');
    }
  }

  private async processCompose(job: Job<ComposeJobData>): Promise<void> {
    const { broadcastId, email, subject, html, text, attachments } = job.data;
    try {
      await this.mailPort.send({
        to: { email },
        subject,
        html,
        text: text ?? '',
        attachments,
        tags: ['composed', 'broadcast'],
      });
      await this.updateCount(broadcastId, 'sent');
    } catch (err) {
      this.logger.error({ err, email, broadcastId }, 'Compose broadcast job failed');
      await this.updateCount(broadcastId, 'failed');
    }
  }

  private async updateCount(
    broadcastId: string,
    field: 'sent' | 'failed',
  ): Promise<void> {
    const updated = await this.prisma.emailBroadcast.update({
      where: { id: broadcastId },
      data: {
        ...(field === 'sent'
          ? { sentCount: { increment: 1 } }
          : { failedCount: { increment: 1 } }),
      },
    });
    if (updated.sentCount + updated.failedCount >= updated.totalCount) {
      await this.prisma.emailBroadcast.update({
        where: { id: broadcastId },
        data: {
          status: updated.failedCount > 0 && updated.sentCount === 0 ? 'failed' : 'completed',
          completedAt: new Date(),
        },
      });
    }
  }

  private async calcStreak(userId: number): Promise<number> {
    const reviews = await this.prisma.srsCard.findMany({
      where: { userId, lastReviewedAt: { not: null } },
      select: { lastReviewedAt: true },
    });
    if (!reviews.length) return 0;

    const todayUtc = new Date();
    todayUtc.setUTCHours(0, 0, 0, 0);
    const DAY_MS = 86_400_000;
    const days = new Set(
      reviews.map((r) => {
        const d = new Date(r.lastReviewedAt!);
        d.setUTCHours(0, 0, 0, 0);
        return d.getTime();
      }),
    );

    let streak = 0;
    let cursor = todayUtc.getTime();
    while (days.has(cursor)) {
      streak++;
      cursor -= DAY_MS;
    }
    return streak;
  }
}
