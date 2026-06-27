import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class RequestRefundDto {
  @ApiPropertyOptional({ example: "Hủy buổi học / không dùng gói" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: "Hoàn một phần (cent). Admin hoặc theo policy." })
  @IsOptional()
  @IsInt()
  @Min(1)
  amountCents?: number;
}
