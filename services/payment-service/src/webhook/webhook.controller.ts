import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "@app/common";
import { WebhookService } from "./webhook.service";

@Controller("api/webhooks")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post("stripe")
  @HttpCode(200)
  async handleStripe(
    @Headers("stripe-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    if (!req.rawBody) throw new BadRequestException("Missing raw body");
    await this.webhookService.handleStripeEvent(req.rawBody, signature);
    return { received: true };
  }
}
