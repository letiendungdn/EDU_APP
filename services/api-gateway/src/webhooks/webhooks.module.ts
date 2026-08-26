import { Module } from "@nestjs/common";
import { PrismaModule } from "@app/prisma";
import { BrevoWebhookService } from "./brevo-webhook.service";
import { WebhooksController } from "./webhooks.controller";

@Module({
  imports: [PrismaModule],
  controllers: [WebhooksController],
  providers: [BrevoWebhookService],
})
export class WebhooksModule {}
