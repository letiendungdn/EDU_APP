import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateExampleDto {
  @ApiProperty()
  @IsString()
  jp: string;

  @ApiProperty()
  @IsString()
  romaji: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vi?: string;
}

export class CreateGrammarDto {
  @ApiProperty()
  @IsString()
  pattern: string;

  @ApiProperty()
  @IsString()
  meaning: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty()
  @IsInt()
  lessonId: number;

  @ApiPropertyOptional({ type: [CreateExampleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateExampleDto)
  examples?: CreateExampleDto[];
}

export class UpdateGrammarDto extends PartialType(CreateGrammarDto) {}
