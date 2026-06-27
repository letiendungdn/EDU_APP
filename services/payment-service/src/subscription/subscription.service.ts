import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PaymentStatus,
  Role,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaService } from "@app/prisma";
import {
  getSubscriptionClientSecret,
  getSubscriptionPeriod,
  mapStripeSubscriptionStatus,
  resolveSubscriptionPlan,
  subscriptionPeriodPrismaData,
} from "../stripe/stripe.helpers";
import { StripeService } from "../stripe/stripe.service";
import { RefundService } from "../refund/refund.service";
import { PaymentMethodService } from "../payment-method/payment-method.service";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly refundService: RefundService,
    private readonly paymentMethodService: PaymentMethodService,
  ) {}

  async createOrUpgrade(
    userId: number,
    plan: SubscriptionPlan,
    paymentMethodId?: string,
  ): Promise<{ clientSecret: string; subscriptionId: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const planConfig = await this.prisma.subscriptionPlanConfig.findUnique({
      where: { plan },
    });
    if (!planConfig?.stripePriceId)
      throw new BadRequestException("Plan not available");

    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    let stripeCustomerId = sub?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.createCustomer(
        user.email,
        user.name ?? undefined,
      );
      stripeCustomerId = customer.id;
    }

    if (paymentMethodId) {
      await this.paymentMethodService.assertUserOwnsCard(userId, paymentMethodId);
    }

    const stripeSub = await this.stripe.createSubscription({
      customerId: stripeCustomerId,
      priceId: planConfig.stripePriceId,
      trialDays: planConfig.trialDays || undefined,
      metadata: { userId: userId.toString(), plan },
      defaultPaymentMethodId: paymentMethodId,
    });

    const period = getSubscriptionPeriod(stripeSub);
    const planToPersist = resolveSubscriptionPlan({
      stripeStatus: stripeSub.status,
      targetPlan: plan,
      currentPlan: sub?.plan,
    });

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: planToPersist,
        status: mapStripeSubscriptionStatus(stripeSub.status),
        stripeCustomerId,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: planConfig.stripePriceId,
        ...subscriptionPeriodPrismaData(period),
      },
      update: {
        plan: planToPersist,
        status: mapStripeSubscriptionStatus(stripeSub.status),
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: planConfig.stripePriceId,
        ...subscriptionPeriodPrismaData(period),
      },
    });

    return {
      clientSecret: getSubscriptionClientSecret(stripeSub),
      subscriptionId: stripeSub.id,
    };
  }

  async cancel(userId: number): Promise<void> {
    const sub = await this.prisma.subscription.findUniqueOrThrow({
      where: { userId },
    });
    if (!sub.stripeSubscriptionId)
      throw new BadRequestException("No active subscription");
    await this.stripe.cancelSubscription(sub.stripeSubscriptionId, true);
    await this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  async getStatus(userId: number) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { payments: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
  }

  async requestRefund(userId: number, reason?: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        userId,
        subscriptionId: { not: null },
        status: PaymentStatus.SUCCEEDED,
      },
      orderBy: { createdAt: "desc" },
    });
    if (!payment) {
      throw new BadRequestException("Không có giao dịch subscription để hoàn tiền");
    }

    const result = await this.refundService.refundPayment(payment.id, {
      requestedByUserId: userId,
      role: Role.USER,
      reason: reason ?? "Yêu cầu hoàn tiền subscription",
    });

    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (sub?.stripeSubscriptionId) {
      await this.stripe.cancelSubscription(sub.stripeSubscriptionId, false);
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.CANCELED,
          cancelAtPeriodEnd: false,
          canceledAt: new Date(),
        },
      });
    }

    return result;
  }

  async getPlans() {
    return this.prisma.subscriptionPlanConfig.findMany({
      where: { active: true },
      orderBy: { priceUsdCents: "asc" },
    });
  }
}
