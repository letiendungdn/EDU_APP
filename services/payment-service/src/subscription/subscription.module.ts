import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe/stripe.module";
import { RefundModule } from "../refund/refund.module";
import { PaymentMethodModule } from "../payment-method/payment-method.module";
import { SubscriptionService } from "./subscription.service";

@Module({
  imports: [StripeModule, RefundModule, PaymentMethodModule],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
