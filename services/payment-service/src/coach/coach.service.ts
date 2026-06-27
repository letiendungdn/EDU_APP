import { Injectable } from "@nestjs/common";
import { CoachAvailability, PayoutStatus, SessionStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { StripeService } from "../stripe/stripe.service";

export interface UpsertCoachProfileDto {
  bio?: string;
  languages?: string[];
  specializations?: string[];
  hourlyRateUsd: number;
  currency?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface AvailabilitySlotInput {
  dayOfWeek: number;
  startHour: number;
  startMinute?: number;
  endHour: number;
  endMinute?: number;
}

@Injectable()
export class CoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async upsertProfile(userId: number, dto: UpsertCoachProfileDto) {
    return this.prisma.coachProfile.upsert({
      where: { userId },
      create: {
        userId,
        bio: dto.bio,
        languages: dto.languages ?? [],
        specializations: dto.specializations ?? [],
        hourlyRateUsd: dto.hourlyRateUsd,
        currency: dto.currency ?? "USD",
        timezone: dto.timezone ?? "Asia/Ho_Chi_Minh",
        isActive: dto.isActive ?? false,
      },
      update: {
        bio: dto.bio,
        languages: dto.languages,
        specializations: dto.specializations,
        hourlyRateUsd: dto.hourlyRateUsd,
        currency: dto.currency,
        timezone: dto.timezone,
        isActive: dto.isActive,
      },
    });
  }

  async setAvailability(
    userId: number,
    slots: AvailabilitySlotInput[],
  ): Promise<CoachAvailability[]> {
    const profile = await this.prisma.coachProfile.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.coachAvailability.deleteMany({ where: { coachId: profile.id } });

      if (slots.length > 0) {
        await tx.coachAvailability.createMany({
          data: slots.map((slot) => ({
            coachId: profile.id,
            dayOfWeek: slot.dayOfWeek,
            startHour: slot.startHour,
            startMinute: slot.startMinute ?? 0,
            endHour: slot.endHour,
            endMinute: slot.endMinute ?? 0,
          })),
        });
      }

      return tx.coachAvailability.findMany({
        where: { coachId: profile.id },
        orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
      });
    });
  }

  async getSessions(userId: number, status?: SessionStatus) {
    const profile = await this.prisma.coachProfile.findUniqueOrThrow({
      where: { userId },
    });

    return this.prisma.coachingSession.findMany({
      where: {
        coachId: profile.id,
        ...(status ? { status } : {}),
      },
      orderBy: { scheduledAt: "desc" },
      include: {
        learner: { select: { id: true, name: true, email: true } },
        payment: true,
        review: true,
      },
    });
  }

  async getEarnings(userId: number, startDate: Date, endDate: Date) {
    const profile = await this.prisma.coachProfile.findUniqueOrThrow({
      where: { userId },
    });

    const [sessions, payouts] = await Promise.all([
      this.prisma.coachingSession.findMany({
        where: {
          coachId: profile.id,
          status: SessionStatus.COMPLETED,
          scheduledAt: { gte: startDate, lte: endDate },
        },
        include: { payment: true },
      }),
      this.prisma.payout.findMany({
        where: {
          coachId: profile.id,
          periodStart: { gte: startDate },
          periodEnd: { lte: endDate },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const grossCents = sessions.reduce(
      (sum, session) => sum + session.priceUsdCents,
      0,
    );
    const platformFeeCents = sessions.reduce(
      (sum, session) =>
        sum +
        Math.round((session.priceUsdCents * session.platformFeePercent) / 100),
      0,
    );
    const netCents = grossCents - platformFeeCents;
    const paidOutCents = payouts
      .filter((payout) => payout.status === PayoutStatus.PAID)
      .reduce((sum, payout) => sum + payout.amountCents, 0);

    return {
      period: { startDate, endDate },
      sessionCount: sessions.length,
      grossCents,
      platformFeeCents,
      netCents,
      paidOutCents,
      pendingCents: netCents - paidOutCents,
      sessions,
      payouts,
    };
  }

  async startStripeOnboarding(
    userId: number,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<{ url: string; stripeAccountId: string }> {
    const profile = await this.prisma.coachProfile.findUniqueOrThrow({
      where: { userId },
      include: { user: true },
    });

    let stripeAccountId = profile.stripeAccountId;
    if (!stripeAccountId) {
      const account = await this.stripe.createConnectAccount(
        profile.user.email,
      );
      stripeAccountId = account.id;
      await this.prisma.coachProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId },
      });
    }

    const link = await this.stripe.createAccountLink(
      stripeAccountId,
      refreshUrl,
      returnUrl,
    );
    return { url: link.url, stripeAccountId };
  }
}
