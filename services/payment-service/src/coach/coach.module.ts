import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe/stripe.module";
import { CoachService } from "./coach.service";

@Module({
  imports: [StripeModule],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
