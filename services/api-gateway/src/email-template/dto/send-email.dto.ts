import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import { TemplateAttachmentDto } from "./update-email-template.dto";

export class SendToUserDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsObject()
  @IsOptional()
  vars?: Record<string, unknown>;
}

export class BroadcastFilterDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsBoolean()
  @IsOptional()
  emailVerifiedOnly?: boolean;

  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;
}

export class BroadcastDto {
  @IsObject()
  @IsOptional()
  @Type(() => BroadcastFilterDto)
  filter?: BroadcastFilterDto;
}

export class ComposeDto {
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @IsString()
  @MaxLength(500)
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @IsOptional()
  @Type(() => TemplateAttachmentDto)
  attachments?: TemplateAttachmentDto[];
}
