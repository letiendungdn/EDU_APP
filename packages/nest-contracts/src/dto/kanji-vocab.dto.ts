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
  @ApiProperty({ example: '一本' })
  @IsString()
  @MinLength(1)
  word: string;

  @ApiProperty({ example: 'いっぽん' })
  @IsString()
  @MinLength(1)
  reading: string;

  @ApiProperty({ example: 'Số 1' })
  @IsString()
  @MinLength(1)
  meaningVi: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateKanjiVocabDto extends PartialType(CreateKanjiVocabDto) {}

export class ReorderKanjiVocabDto {
  @ApiProperty({ type: [Number], example: [3, 1, 2] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds: number[];
}
