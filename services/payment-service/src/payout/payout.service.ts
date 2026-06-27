import { Injectable } from "@nestjs/common";
import { CoachingSession, PayoutStatus, PaymentStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { StripeService } from "../stripe/stripe.service";

type CompletedSession = CoachingSession & {
  payment: { status: PaymentStatus } | null;
  coach: {
    stripeAccountId: string | null;
    payoutEnabled: boolean;
  };
};

@Injectable()
export class PayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  async processWeeklyPayouts(): Promise<void> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.coachingSession.findMany({
      where: {
        status: "COMPLETED",
        scheduledAt: { gte: weekAgo, lt: now },
        payment: { status: PaymentStatus.SUCCEEDED },
      },
      include: { payment: true, coach: true },
    });

    const byCoach = sessions.reduce(
      (acc, session) => {
        (acc[session.coachId] ??= []).push(session);
        return acc;
      },
      {} as Record<number, CompletedSession[]>,
    );

    for (const [coachIdStr, coachSessions] of Object.entries(byCoach)) {
      const coachId = Number(coachIdStr);
      const coach = coachSessions[0].coach;
      if (!coach.stripeAccountId || !coach.payoutEnabled) continue;

      const grossCents = coachSessions.reduce(
        (sum, session) => sum + session.priceUsdCents,
        0,
      );
      const feeCents = Math.round(
        (grossCents * coachSessions[0].platformFeePercent) / 100,
      );
      const netCents = grossCents - feeCents;

      try {
        const transfer = await this.stripe.transferToCoach({
          amountCents: netCents,
          currency: "usd",
          stripeAccountId: coach.stripeAccountId,
          metadata: {
            coachId: coachIdStr,
            sessionCount: coachSessions.length.toString(),
          },
        });
        await this.prisma.payout.create({
          data: {
            coachId,
            amountCents: netCents,
            grossAmountCents: grossCents,
            feeAmountCents: feeCents,
            currency: "USD",
            status: PayoutStatus.PAID,
            stripeTransferId: transfer.id,
            periodStart: weekAgo,
            periodEnd: now,
            sessionCount: coachSessions.length,
            processedAt: new Date(),
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.prisma.payout.create({
          data: {
            coachId,
            amountCents: netCents,
            grossAmountCents: grossCents,
            feeAmountCents: feeCents,
            currency: "USD",
            status: PayoutStatus.FAILED,
            periodStart: weekAgo,
            periodEnd: now,
            sessionCount: coachSessions.length,
            failReason: message,
          },
        });
      }
    }
  }

  async getReconciliationReport(startDate: Date, endDate: Date) {
    const [payments, payouts] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payout.groupBy({
        by: ["status"],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _sum: { amountCents: true, feeAmountCents: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = payments
      .filter((payment) => payment.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, payment) => sum + (payment._sum.amountCents ?? 0), 0);
    const totalPayouts = payouts
      .filter((payout) => payout.status === PayoutStatus.PAID)
      .reduce((sum, payout) => sum + (payout._sum.amountCents ?? 0), 0);
    const platformFees = payouts
      .filter((payout) => payout.status === PayoutStatus.PAID)
      .reduce((sum, payout) => sum + (payout._sum.feeAmountCents ?? 0), 0);

    return {
      period: { startDate, endDate },
      totalRevenueCents: totalRevenue,
      totalPayoutsCents: totalPayouts,
      platformFeesCents: platformFees,
      netPlatformCents: totalRevenue - totalPayouts,
      paymentBreakdown: payments,
      payoutBreakdown: payouts,
    };
  }
}
