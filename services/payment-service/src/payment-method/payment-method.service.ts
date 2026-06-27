import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import { StripeService } from "../stripe/stripe.service";

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
  ) {}

  private async getOrCreateStripeCustomerId(userId: number): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { subscription: true },
    });

    if (user.subscription?.stripeCustomerId) {
      return user.subscription.stripeCustomerId;
    }

    const customer = await this.stripe.createCustomer(
      user.email,
      user.name ?? undefined,
    );

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        stripeCustomerId: customer.id,
      },
      update: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  async listCards(userId: number): Promise<SavedCard[]> {
    const customerId = await this.getOrCreateStripeCustomerId(userId);
    const [methods, defaultId] = await Promise.all([
      this.stripe.listCardPaymentMethods(customerId),
      this.stripe.getCustomerDefaultPaymentMethodId(customerId),
    ]);

    const cards = await Promise.all(
      methods.map(async (pm) => {
        try {
          await this.stripe.allowPaymentMethodRedisplay(pm.id);
        } catch {
          // Thẻ cũ có thể không hỗ trợ — bỏ qua
        }
        return {
          id: pm.id,
          brand: pm.card?.brand ?? "card",
          last4: pm.card?.last4 ?? "????",
          expMonth: pm.card?.exp_month ?? 0,
          expYear: pm.card?.exp_year ?? 0,
          isDefault: pm.id === defaultId,
        };
      }),
    );

    return cards;
  }

  async assertUserOwnsCard(
    userId: number,
    paymentMethodId: string,
  ): Promise<void> {
    const customerId = await this.getOrCreateStripeCustomerId(userId);
    const methods = await this.stripe.listCardPaymentMethods(customerId);
    if (!methods.some((pm) => pm.id === paymentMethodId)) {
      throw new NotFoundException("Không tìm thấy thẻ");
    }
  }

  async createSetupIntent(userId: number): Promise<{ clientSecret: string }> {
    const customerId = await this.getOrCreateStripeCustomerId(userId);
    const intent = await this.stripe.createSetupIntent(customerId);
    if (!intent.client_secret) {
      throw new BadRequestException("Không tạo được setup intent");
    }
    return { clientSecret: intent.client_secret };
  }

  async detachCard(userId: number, paymentMethodId: string): Promise<void> {
    const customerId = await this.getOrCreateStripeCustomerId(userId);
    const methods = await this.stripe.listCardPaymentMethods(customerId);
    const owned = methods.some((pm) => pm.id === paymentMethodId);
    if (!owned) {
      throw new NotFoundException("Không tìm thấy thẻ");
    }
    await this.stripe.detachPaymentMethod(paymentMethodId);
  }

  async setDefaultCard(
    userId: number,
    paymentMethodId: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { subscription: true },
    });
    const customerId = await this.getOrCreateStripeCustomerId(userId);
    const methods = await this.stripe.listCardPaymentMethods(customerId);
    const owned = methods.some((pm) => pm.id === paymentMethodId);
    if (!owned) {
      throw new NotFoundException("Không tìm thấy thẻ");
    }

    await this.stripe.setDefaultPaymentMethod(
      customerId,
      paymentMethodId,
      user.subscription?.stripeSubscriptionId,
    );

    return { message: "Đã đặt làm thẻ mặc định" };
  }
}
