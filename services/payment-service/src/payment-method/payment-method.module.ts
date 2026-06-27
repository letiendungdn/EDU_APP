import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { StripeModule } from "../stripe/stripe.module";
import { PaymentMethodService } from "./payment-method.service";

@Module({
  imports: [PrismaModule, StripeModule],
  providers: [PaymentMethodService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}
