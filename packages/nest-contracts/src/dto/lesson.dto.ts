import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  lessonNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
