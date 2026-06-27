import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { StripeModule } from "../stripe/stripe.module";
import { RefundService } from "./refund.service";

@Module({
  imports: [PrismaModule, StripeModule],
  providers: [RefundService],
  exports: [RefundService],
})
export class RefundModule {}
