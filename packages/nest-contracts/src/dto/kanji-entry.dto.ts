import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export class CreateKanjiEntryDto {
  @ApiProperty({ example: '食' })
  @IsString()
  @MinLength(1)
  character!: string;

  @ApiProperty({ example: 'ăn, thức ăn' })
  @IsString()
  @MinLength(1)
  meaningVi!: string;

  @ApiProperty({ example: 21, description: 'Số bài kanji (KanjiLesson.lessonNumber)' })
  @Type(() => Number)
  @IsInt()
  lessonNumber!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hanViet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onyomi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kunyomi?: string;

  @ApiPropertyOptional({ enum: JLPT_LEVELS })
  @IsOptional()
  @IsIn([...JLPT_LEVELS])
  jlptLevel?: (typeof JLPT_LEVELS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateKanjiEntryDto extends PartialType(CreateKanjiEntryDto) {}
