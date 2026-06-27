import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReviewItemDto {
  @ApiProperty()
  @IsString()
  kana: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kanji?: string;

  @ApiProperty()
  @IsString()
  meaning: string;

  @ApiProperty()
  @IsInt()
  lessonNumber: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  wrongCount: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  reviewStreak: number;

  @ApiProperty()
  @IsBoolean()
  mastered: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastReviewedAt?: string;
}

export class SyncReviewDto {
  @ApiProperty({ type: [ReviewItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewItemDto)
  items: ReviewItemDto[];
}

export class LogListeningDto {
  @ApiProperty({ example: '2026-06-24' })
  @IsString()
  date: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  seconds: number;
}

export class UpsertDailyNoteDto {
  @ApiProperty({ example: '2026-06-26' })
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  content: string;
}

export class DailyGoalItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  kind: string;

  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsBoolean()
  done: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  target?: number;
}

export class UpsertDailyGoalsDto {
  @ApiProperty({ example: '2026-06-26' })
  @IsString()
  date: string;

  @ApiProperty({ type: [DailyGoalItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyGoalItemDto)
  items: DailyGoalItemDto[];
}
