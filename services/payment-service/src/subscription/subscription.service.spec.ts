import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { StripeService } from "../stripe/stripe.service";
import { SubscriptionService } from "./subscription.service";

describe("SubscriptionService", () => {
  let service: SubscriptionService;
  let prisma: {
    user: { findUniqueOrThrow: jest.Mock };
    subscriptionPlanConfig: { findUnique: jest.Mock };
    subscription: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      upsert: jest.Mock;
      update: jest.Mock;
    };
  };
  let stripe: {
    createCustomer: jest.Mock;
    createSubscription: jest.Mock;
    cancelSubscription: jest.Mock;
  };

  const userId = 1;
  const mockUser = { id: userId, email: "user@test.com", name: "Test User" };

  beforeEach(async () => {
    prisma = {
      user: { findUniqueOrThrow: jest.fn() },
      subscriptionPlanConfig: { findUnique: jest.fn() },
      subscription: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
    };
    stripe = {
      createCustomer: jest.fn(),
      createSubscription: jest.fn(),
      cancelSubscription: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: prisma },
        { provide: StripeService, useValue: stripe },
      ],
    }).compile();

    service = module.get(SubscriptionService);
    jest.clearAllMocks();
  });

  describe("createOrUpgrade", () => {
    it("throws BadRequestException when plan has no stripePriceId", async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.subscriptionPlanConfig.findUnique.mockResolvedValue({
        plan: SubscriptionPlan.PRO,
        stripePriceId: null,
      });

      await expect(
        service.createOrUpgrade(userId, SubscriptionPlan.PRO),
      ).rejects.toThrow(BadRequestException);
    });

    it("creates new Stripe Customer when user has none", async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.subscriptionPlanConfig.findUnique.mockResolvedValue({
        plan: SubscriptionPlan.PRO,
        stripePriceId: "price_pro",
        trialDays: 7,
      });
      prisma.subscription.findUnique.mockResolvedValue(null);
      stripe.createCustomer.mockResolvedValue({ id: "cus_new" });
      stripe.createSubscription.mockResolvedValue({
        id: "sub_new",
        current_period_start: 1_700_000_000,
        current_period_end: 1_700_086_400,
        latest_invoice: {
          payment_intent: { client_secret: "pi_secret_new" },
        },
      });
      prisma.subscription.upsert.mockResolvedValue({});

      await service.createOrUpgrade(userId, SubscriptionPlan.PRO);

      expect(stripe.createCustomer).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
      );
      expect(stripe.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: "cus_new",
          priceId: "price_pro",
          trialDays: 7,
        }),
      );
    });

    it("reuses existing Stripe Customer when subscription exists", async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.subscriptionPlanConfig.findUnique.mockResolvedValue({
        plan: SubscriptionPlan.PRO,
        stripePriceId: "price_pro",
        trialDays: 0,
      });
      prisma.subscription.findUnique.mockResolvedValue({
        userId,
        stripeCustomerId: "cus_existing",
      });
      stripe.createSubscription.mockResolvedValue({
        id: "sub_upgraded",
        current_period_start: 1_700_000_000,
        current_period_end: 1_700_086_400,
        latest_invoice: {
          payment_intent: { client_secret: "pi_secret_existing" },
        },
      });
      prisma.subscription.upsert.mockResolvedValue({});

      await service.createOrUpgrade(userId, SubscriptionPlan.PRO);

      expect(stripe.createCustomer).not.toHaveBeenCalled();
      expect(stripe.createSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: "cus_existing" }),
      );
    });

    it("upserts subscription with TRIALING status", async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.subscriptionPlanConfig.findUnique.mockResolvedValue({
        plan: SubscriptionPlan.PRO,
        stripePriceId: "price_pro",
        trialDays: 14,
      });
      prisma.subscription.findUnique.mockResolvedValue(null);
      stripe.createCustomer.mockResolvedValue({ id: "cus_1" });
      stripe.createSubscription.mockResolvedValue({
        id: "sub_1",
        current_period_start: 1_700_000_000,
        current_period_end: 1_700_259_200,
        latest_invoice: {
          payment_intent: { client_secret: "pi_secret" },
        },
      });
      prisma.subscription.upsert.mockResolvedValue({});

      await service.createOrUpgrade(userId, SubscriptionPlan.PRO);

      expect(prisma.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId },
          create: expect.objectContaining({
            userId,
            plan: SubscriptionPlan.PRO,
            status: SubscriptionStatus.TRIALING,
            stripeCustomerId: "cus_1",
            stripeSubscriptionId: "sub_1",
          }),
        }),
      );
    });

    it("returns clientSecret and subscriptionId", async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      prisma.subscriptionPlanConfig.findUnique.mockResolvedValue({
        plan: SubscriptionPlan.PRO,
        stripePriceId: "price_pro",
        trialDays: 0,
      });
      prisma.subscription.findUnique.mockResolvedValue(null);
      stripe.createCustomer.mockResolvedValue({ id: "cus_1" });
      stripe.createSubscription.mockResolvedValue({
        id: "sub_return",
        current_period_start: 1_700_000_000,
        current_period_end: 1_700_086_400,
        latest_invoice: {
          payment_intent: { client_secret: "cs_test_secret" },
        },
      });
      prisma.subscription.upsert.mockResolvedValue({});

      const result = await service.createOrUpgrade(
        userId,
        SubscriptionPlan.PRO,
      );

      expect(result).toEqual({
        clientSecret: "cs_test_secret",
        subscriptionId: "sub_return",
      });
    });
  });

  describe("cancel", () => {
    it("throws BadRequestException when no stripeSubscriptionId", async () => {
      prisma.subscription.findUniqueOrThrow.mockResolvedValue({
        userId,
        stripeSubscriptionId: null,
      });

      await expect(service.cancel(userId)).rejects.toThrow(BadRequestException);
      expect(stripe.cancelSubscription).not.toHaveBeenCalled();
    });

    it("calls stripe.cancelSubscription with atPeriodEnd=true", async () => {
      prisma.subscription.findUniqueOrThrow.mockResolvedValue({
        userId,
        stripeSubscriptionId: "sub_cancel",
      });
      stripe.cancelSubscription.mockResolvedValue({});
      prisma.subscription.update.mockResolvedValue({});

      await service.cancel(userId);

      expect(stripe.cancelSubscription).toHaveBeenCalledWith(
        "sub_cancel",
        true,
      );
    });

    it("updates cancelAtPeriodEnd to true", async () => {
      prisma.subscription.findUniqueOrThrow.mockResolvedValue({
        userId,
        stripeSubscriptionId: "sub_cancel",
      });
      stripe.cancelSubscription.mockResolvedValue({});
      prisma.subscription.update.mockResolvedValue({});

      await service.cancel(userId);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { userId },
        data: { cancelAtPeriodEnd: true },
      });
    });
  });
});
