import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateKanjiVocabDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  word: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  reading: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  meaningVi: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exampleJa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exampleKana?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exampleVi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateKanjiVocabDto extends PartialType(CreateKanjiVocabDto) {}

export class ReorderKanjiVocabDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds: number[];
}
