import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class TranslateDto {
  @ApiProperty({ example: "わたしはがくせいです" })
  @IsString()
  @MaxLength(2000)
  text!: string;

  @ApiPropertyOptional({ default: "ja" })
  @IsOptional()
  @IsIn(["ja", "vi", "en"])
  sourceLang?: string;

  @ApiPropertyOptional({ default: "vi" })
  @IsOptional()
  @IsIn(["ja", "vi", "en"])
  targetLang?: string;
}
