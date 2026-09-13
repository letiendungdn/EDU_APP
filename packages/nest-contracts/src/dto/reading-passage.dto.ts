import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export class CreateReadingQuestionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  question!: string;

  @ApiProperty({ description: 'Phải trùng chính xác text của 1 option' })
  @IsString()
  @MinLength(1)
  answer!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  options!: string[];
}

export class CreateReadingPassageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({ enum: JLPT_LEVELS })
  @IsOptional()
  @IsIn([...JLPT_LEVELS])
  jlptLevel?: (typeof JLPT_LEVELS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ type: [CreateReadingQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReadingQuestionDto)
  questions?: CreateReadingQuestionDto[];
}

export class UpdateReadingPassageDto extends PartialType(CreateReadingPassageDto) {}
