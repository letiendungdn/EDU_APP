import { ApiPropertyOptional } from "@nestjs/swagger";
import { JlptLevel } from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: "vi" })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  nativeLanguage?: string;

  @ApiPropertyOptional({ enum: JlptLevel })
  @IsOptional()
  @IsEnum(JlptLevel)
  targetJlptLevel?: JlptLevel | null;

  @ApiPropertyOptional({ minimum: 5, maximum: 480 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(480)
  studyGoalMinutes?: number;
}
