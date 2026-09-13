import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export class CreateKanjiLessonDto {
  @ApiProperty({ example: 900 })
  @Type(() => Number)
  @IsInt()
  lessonNumber!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

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

export class UpdateKanjiLessonDto extends PartialType(CreateKanjiLessonDto) {}
