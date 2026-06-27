import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SubscriptionPlan } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateSubscriptionDto {
  @ApiProperty({ enum: SubscriptionPlan, example: SubscriptionPlan.PRO })
  @IsEnum(SubscriptionPlan)
  plan!: SubscriptionPlan;

  @ApiPropertyOptional({ description: "Stripe payment method id (pm_...) đã lưu" })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
