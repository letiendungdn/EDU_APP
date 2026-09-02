import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

const ROOT_POS = ['noun', 'verb', 'i-adj', 'na-adj'] as const;

export class CreateVocabSuffixGroupDto {
  @ApiProperty({ example: 'honorifics' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug!: string;

  @ApiProperty({ example: 'Hậu tố xưng hô' })
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiPropertyOptional({ example: '呼びかけ' })
  @IsOptional()
  @IsString()
  labelJa?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  hint!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateVocabSuffixGroupDto extends PartialType(
  CreateVocabSuffixGroupDto,
) {}

export class CreateVocabSuffixItemDto {
  @ApiProperty({ example: 'honorifics', description: 'slug nhóm (VocabSuffixGroup.slug)' })
  @IsString()
  @MinLength(1)
  groupSlug!: string;

  @ApiProperty({ example: 'さん' })
  @IsString()
  @MinLength(1)
  suffix!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forms?: string[];

  @ApiProperty({ example: 'さん' })
  @IsString()
  @MinLength(1)
  kana!: string;

  @ApiProperty({ example: 'san' })
  @IsString()
  @MinLength(1)
  romaji!: string;

  @ApiProperty({ example: 'anh/chị (lịch sự)' })
  @IsString()
  @MinLength(1)
  meaningVi!: string;

  @ApiProperty({ example: 'tên người, nghề' })
  @IsString()
  @MinLength(1)
  attachesTo!: string;

  @ApiPropertyOptional({ enum: ROOT_POS, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn([...ROOT_POS], { each: true })
  pos?: (typeof ROOT_POS)[number][];

  @ApiProperty({ example: '田中さんは先生です。' })
  @IsString()
  exampleJa!: string;

  @ApiProperty({ example: 'Anh/chị Tanaka là giáo viên.' })
  @IsString()
  exampleVi!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateVocabSuffixItemDto extends PartialType(
  CreateVocabSuffixItemDto,
) {}

export class ReorderVocabSuffixItemsDto {
  @ApiProperty({ example: 'honorifics', description: 'slug nhóm (VocabSuffixGroup.slug)' })
  @IsString()
  @MinLength(1)
  groupSlug!: string;

  @ApiProperty({ type: [Number], example: [3, 1, 2] })
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds!: number[];
}
