import {
  Body,
  Controller,
  ForbiddenException,
  Headers,
  HttpCode,
  Post,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@app/common";
import { BrevoWebhookService } from "./brevo-webhook.service";
import type { BrevoWebhookEventDto } from "./dto/brevo-event.dto";

@ApiTags("webhooks")
@Controller("api/webhooks")
@Public()
export class WebhooksController {
  private readonly brevoSecret: string;

  constructor(
    config: ConfigService,
    private readonly brevoWebhook: BrevoWebhookService,
  ) {
    this.brevoSecret = config.get<string>("BREVO_WEBHOOK_SECRET") ?? "";
  }

  @Post("brevo")
  @HttpCode(200)
  @ApiOperation({ summary: "Brevo transactional email event webhook" })
  async handleBrevoEvent(
    @Headers("x-brevo-signature") sig: string | undefined,
    @Body() event: BrevoWebhookEventDto,
  ) {
    if (this.brevoSecret && sig !== this.brevoSecret) {
      throw new ForbiddenException("Invalid webhook signature");
    }
    await this.brevoWebhook.handleEvent(event);
    return { ok: true };
  }
}
