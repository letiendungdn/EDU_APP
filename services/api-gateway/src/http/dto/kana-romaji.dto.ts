import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class KanaRomajiDto {
  @ApiProperty({ example: "たべもの" })
  @IsString()
  @MaxLength(500)
  text!: string;
}
