import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { StripeModule } from "./stripe/stripe.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { BookingModule } from "./booking/booking.module";
import { PayoutModule } from "./payout/payout.module";
import { WebhookModule } from "./webhook/webhook.module";
import { MarketplaceModule } from "./marketplace/marketplace.module";
import { CoachModule } from "./coach/coach.module";
import { KafkaModule } from "./kafka/kafka.module";
import { RefundModule } from "./refund/refund.module";
import { PaymentMethodModule } from "./payment-method/payment-method.module";

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    StripeModule,
    RefundModule,
    PaymentMethodModule,
    SubscriptionModule,
    BookingModule,
    PayoutModule,
    WebhookModule,
    MarketplaceModule,
    CoachModule,
  ],
  exports: [
    StripeModule,
    RefundModule,
    PaymentMethodModule,
    SubscriptionModule,
    BookingModule,
    PayoutModule,
    WebhookModule,
    MarketplaceModule,
    CoachModule,
  ],
})
export class PaymentModule {}

export default PaymentModule;
