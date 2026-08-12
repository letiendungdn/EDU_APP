import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

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

  /** URL ảnh (S3 /media/…) hoặc data URL; null để xóa khi cập nhật */
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  imageUrl?: string | null;
}

export class UpdateVocabularyDto extends PartialType(CreateVocabularyDto) {}
