import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateAttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  url: string;
}

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsOptional()
  textBody?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateAttachmentDto)
  @IsOptional()
  attachments?: TemplateAttachmentDto[];

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class PreviewEmailTemplateDto {
  @IsObject()
  @IsOptional()
  vars?: Record<string, unknown>;
}

export class TestSendEmailTemplateDto {
  @IsString()
  @IsOptional()
  toEmail?: string;
}
