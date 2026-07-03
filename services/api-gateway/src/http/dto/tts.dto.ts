import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MaxLength } from "class-validator";

export class TtsDto {
  @ApiProperty({ example: "Ý nghĩa: N1 là N2" })
  @IsString()
  @MaxLength(5000)
  text!: string;

  @ApiProperty({ enum: ["vi-VN", "ja-JP"], example: "vi-VN" })
  @IsIn(["vi-VN", "ja-JP"])
  lang!: "vi-VN" | "ja-JP";
}
