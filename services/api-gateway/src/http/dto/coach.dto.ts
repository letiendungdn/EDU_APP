import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SessionStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

export class UpsertCoachProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  hourlyRateUsd!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: "Asia/Ho_Chi_Minh" })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AvailabilitySlotDto {
  @ApiProperty({ minimum: 0, maximum: 6 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  startHour!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(59)
  startMinute?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(23)
  endHour!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(59)
  endMinute?: number;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilitySlotDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots!: AvailabilitySlotDto[];
}

export class GetSessionsDto {
  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}

export class DateRangeDto {
  @ApiProperty({ example: "2026-06-01" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: "2026-06-30" })
  @IsDateString()
  endDate!: string;
}

export class StripeOnboardDto {
  @ApiProperty({ example: "http://localhost:5173/coach/onboard/refresh" })
  @IsString()
  refreshUrl!: string;

  @ApiProperty({ example: "http://localhost:5173/coach/onboard/return" })
  @IsString()
  returnUrl!: string;
}
