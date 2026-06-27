import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe/stripe.module";
import { RefundModule } from "../refund/refund.module";
import { BookingService } from "./booking.service";

@Module({
  imports: [StripeModule, RefundModule],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
