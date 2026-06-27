import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateVocabularyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kanji?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  kana: string;

  @ApiProperty()
  @IsString()
  romaji: string;

  @ApiProperty()
  @IsString()
  meaning: string;

  @ApiProperty()
  @IsInt()
  lessonId: number;
}

export class UpdateVocabularyDto extends PartialType(CreateVocabularyDto) {}
