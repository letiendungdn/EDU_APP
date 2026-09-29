import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, Matches } from "class-validator";

/**
 * Chỉ cho phép loại file web thật sự upload: ảnh (không SVG — SVG chứa được script),
 * PDF (chat hỗ trợ) và âm thanh (câu hỏi nghe của đề thi). text/html… bị chặn:
 * file đó phục vụ từ bucket/CDN có thể thành XSS lưu trữ.
 */
export const ALLOWED_UPLOAD_CONTENT_TYPE =
  /^(image\/(jpeg|jpg|png|webp|gif)|application\/pdf|audio\/(mpeg|mp3|mp4|x-m4a|aac|wav|x-wav|wave|ogg|webm))$/i;

/** Thư mục web dùng; chặn ghi tuỳ ý vào chỗ khác trong bucket. */
export const UPLOAD_FOLDERS = [
  "uploads",
  "chat",
  "session",
  "vocab",
  "kanji",
  "mock-exam-images",
  "mock-exam-audio",
] as const;

export class GetPresignedUrlDto {
  @ApiProperty({ example: "image/jpeg" })
  @IsString()
  @Matches(ALLOWED_UPLOAD_CONTENT_TYPE, {
    message: "contentType không được phép (chỉ ảnh, PDF, âm thanh)",
  })
  contentType!: string;

  @ApiPropertyOptional({ default: "uploads", enum: UPLOAD_FOLDERS })
  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: string;
}
