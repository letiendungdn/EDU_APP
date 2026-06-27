import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe/stripe.module";
import { RefundModule } from "../refund/refund.module";
import { KafkaModule } from "../kafka/kafka.module";
import { RealtimeModule } from "../../../api-gateway/src/realtime/realtime.module";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";

@Module({
  imports: [StripeModule, KafkaModule, RefundModule, RealtimeModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
