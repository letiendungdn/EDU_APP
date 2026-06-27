import { Test, TestingModule } from "@nestjs/testing";
import { PaymentStatus, PayoutStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { PayoutService } from "./payout.service";
import { StripeService } from "../stripe/stripe.service";

describe("PayoutService", () => {
  let service: PayoutService;
  let prisma: {
    coachingSession: { findMany: jest.Mock };
    payout: { create: jest.Mock; groupBy: jest.Mock };
    payment: { groupBy: jest.Mock };
  };
  let stripe: { transferToCoach: jest.Mock };

  beforeEach(async () => {
    prisma = {
      coachingSession: { findMany: jest.fn().mockResolvedValue([]) },
      payout: {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      payment: { groupBy: jest.fn().mockResolvedValue([]) },
    };
    stripe = { transferToCoach: jest.fn().mockResolvedValue({ id: "tr_1" }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: StripeService, useValue: stripe },
      ],
    }).compile();

    service = module.get(PayoutService);
  });

  describe("processWeeklyPayouts", () => {
    it("skips coaches without stripe account or payout disabled", async () => {
      prisma.coachingSession.findMany.mockResolvedValue([
        {
          coachId: 1,
          priceUsdCents: 5000,
          platformFeePercent: 20,
          coach: { stripeAccountId: null, payoutEnabled: false },
        },
      ]);

      await service.processWeeklyPayouts();

      expect(stripe.transferToCoach).not.toHaveBeenCalled();
      expect(prisma.payout.create).not.toHaveBeenCalled();
    });

    it("creates PAID payout after successful Stripe transfer", async () => {
      prisma.coachingSession.findMany.mockResolvedValue([
        {
          coachId: 2,
          priceUsdCents: 10000,
          platformFeePercent: 20,
          coach: { stripeAccountId: "acct_1", payoutEnabled: true },
        },
      ]);

      await service.processWeeklyPayouts();

      expect(stripe.transferToCoach).toHaveBeenCalledWith(
        expect.objectContaining({
          amountCents: 8000,
          stripeAccountId: "acct_1",
        }),
      );
      expect(prisma.payout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PayoutStatus.PAID,
            amountCents: 8000,
          }),
        }),
      );
    });

    it("creates FAILED payout when Stripe transfer throws", async () => {
      prisma.coachingSession.findMany.mockResolvedValue([
        {
          coachId: 3,
          priceUsdCents: 5000,
          platformFeePercent: 20,
          coach: { stripeAccountId: "acct_2", payoutEnabled: true },
        },
      ]);
      stripe.transferToCoach.mockRejectedValue(new Error("transfer failed"));

      await service.processWeeklyPayouts();

      expect(prisma.payout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PayoutStatus.FAILED,
            failReason: "transfer failed",
          }),
        }),
      );
    });
  });

  describe("getReconciliationReport", () => {
    it("aggregates revenue, payouts and platform fees", async () => {
      prisma.payment.groupBy.mockResolvedValue([
        {
          status: PaymentStatus.SUCCEEDED,
          _sum: { amountCents: 10000 },
          _count: { id: 2 },
        },
      ]);
      prisma.payout.groupBy.mockResolvedValue([
        {
          status: PayoutStatus.PAID,
          _sum: { amountCents: 6000, feeAmountCents: 1500 },
          _count: { id: 1 },
        },
      ]);

      const start = new Date("2026-06-01");
      const end = new Date("2026-06-30");
      const report = await service.getReconciliationReport(start, end);

      expect(report.totalRevenueCents).toBe(10000);
      expect(report.totalPayoutsCents).toBe(6000);
      expect(report.platformFeesCents).toBe(1500);
      expect(report.netPlatformCents).toBe(4000);
    });
  });
});
