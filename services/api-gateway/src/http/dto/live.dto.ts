import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateLiveSessionDto {
  @ApiProperty({ example: "Giải đề N5 — Bài 1" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;
}

export class JoinLiveSessionDto {
  @ApiPropertyOptional()
  @IsInt()
  sessionId?: number;
}
