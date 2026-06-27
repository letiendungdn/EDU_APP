import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class GetPresignedUrlDto {
  @ApiProperty({ example: "image/jpeg" })
  @IsString()
  @Matches(/^[a-z]+\/[a-z0-9.+-]+$/i)
  contentType!: string;

  @ApiPropertyOptional({ default: "uploads" })
  @IsOptional()
  @IsString()
  folder?: string;
}
