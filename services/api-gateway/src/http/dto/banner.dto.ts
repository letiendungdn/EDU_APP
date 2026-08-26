import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

export class UpsertBannerDto {
  @ApiProperty({ enum: ["global", "page"], example: "page" })
  @IsIn(["global", "page"])
  scope: "global" | "page";

  @ApiPropertyOptional({
    example: "/grammar",
    description: "Bắt buộc khi scope=page",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ description: "Ảnh dạng data URL (jpeg/png/webp)" })
  @IsString()
  @Matches(/^data:image\/(jpeg|jpg|png|webp);base64,/, {
    message: "image phải là data URL ảnh hợp lệ",
  })
  @MaxLength(8_000_000, { message: "Ảnh quá lớn (tối đa ~6MB)" })
  image: string;
}

export class DeleteBannerDto {
  @ApiProperty({ enum: ["global", "page", "all"], example: "page" })
  @IsIn(["global", "page", "all"])
  scope: "global" | "page" | "all";

  @ApiPropertyOptional({ example: "/grammar" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;
}
