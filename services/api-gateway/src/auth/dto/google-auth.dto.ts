import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class GoogleAuthDto {
  @ApiProperty({ description: "Google ID token từ GIS / OAuth" })
  @IsString()
  @MinLength(10)
  credential: string;
}
