import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    this.stripe = new Stripe(config.getOrThrow("STRIPE_SECRET_KEY"), {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    } as unknown as ConstructorParameters<typeof Stripe>[1]);
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, name });
  }

  async createSubscription(params: {
    customerId: string;
    priceId: string;
    trialDays?: number;
    metadata?: Record<string, string>;
    defaultPaymentMethodId?: string;
  }): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      metadata: params.metadata ?? {},
      payment_behavior: "default_incomplete",
      ...(params.defaultPaymentMethodId
        ? { default_payment_method: params.defaultPaymentMethodId }
        : {}),
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: [
        "latest_invoice.confirmation_secret",
        "latest_invoice.payment_intent",
        "pending_setup_intent",
      ],
    });
  }

  async cancelSubscription(
    stripeSubId: string,
    atPeriodEnd = true,
  ): Promise<Stripe.Subscription> {
    if (atPeriodEnd) {
      return this.stripe.subscriptions.update(stripeSubId, {
        cancel_at_period_end: true,
      });
    }
    return this.stripe.subscriptions.cancel(stripeSubId);
  }

  async updateSubscription(
    stripeSubId: string,
    newPriceId: string,
  ): Promise<Stripe.Subscription> {
    const sub = await this.stripe.subscriptions.retrieve(stripeSubId);
    return this.stripe.subscriptions.update(stripeSubId, {
      items: [{ id: sub.items.data[0].id, price: newPriceId }],
      proration_behavior: "create_prorations",
    });
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    customerId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: params.metadata ?? {},
      payment_method_types: ["card"],
    });
  }

  async refundPayment(
    chargeId: string,
    amountCents?: number,
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      charge: chargeId,
      amount: amountCents,
    });
  }

  async allowPaymentMethodRedisplay(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.update(paymentMethodId, {
      allow_redisplay: "always",
    });
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });
  }

  async listCardPaymentMethods(
    customerId: string,
  ): Promise<Stripe.PaymentMethod[]> {
    const result = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    return result.data;
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
    stripeSubscriptionId?: string | null,
  ): Promise<void> {
    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    if (stripeSubscriptionId) {
      await this.stripe.subscriptions.update(stripeSubscriptionId, {
        default_payment_method: paymentMethodId,
      });
    }
  }

  async getCustomerDefaultPaymentMethodId(
    customerId: string,
  ): Promise<string | null> {
    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    const defaultPm = customer.invoice_settings?.default_payment_method;
    if (!defaultPm) return null;
    return typeof defaultPm === "string" ? defaultPm : defaultPm.id;
  }

  async createConnectAccount(email: string): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: "express",
      email,
      capabilities: { transfers: { requested: true } },
    });
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
  }

  async transferToCoach(params: {
    amountCents: number;
    currency: string;
    stripeAccountId: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create({
      amount: params.amountCents,
      currency: params.currency.toLowerCase(),
      destination: params.stripeAccountId,
      metadata: params.metadata ?? {},
    });
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
