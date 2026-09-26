import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

const KINDS = ["GRAMMAR", "VOCAB", "KANJI"] as const;
const LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export class MindMapItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  pattern!: string;

  @ApiProperty()
  @IsString()
  meaning!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  href?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lessonNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkLabel?: string;
}

export class MindMapBranchDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  labelJa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  posX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  posY?: number;

  @ApiProperty({ type: [MindMapItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MindMapItemDto)
  patterns!: MindMapItemDto[];
}

export class CreateMindMapLevelDto {
  @ApiProperty({ enum: KINDS })
  @IsIn([...KINDS])
  kind!: (typeof KINDS)[number];

  @ApiProperty({ enum: LEVELS })
  @IsIn([...LEVELS])
  level!: (typeof LEVELS)[number];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  summary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiProperty({ type: [MindMapBranchDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MindMapBranchDto)
  branches!: MindMapBranchDto[];
}

export class UpdateMindMapLevelDto extends PartialType(CreateMindMapLevelDto) {}

export class UpsertMindMapsDto {
  @ApiProperty({ type: [CreateMindMapLevelDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMindMapLevelDto)
  levels!: CreateMindMapLevelDto[];

  @ApiPropertyOptional({
    description: "Nếu có, xoá toàn bộ kind này trước khi upsert",
    enum: KINDS,
  })
  @IsOptional()
  @IsIn([...KINDS])
  replaceKind?: (typeof KINDS)[number];
}
