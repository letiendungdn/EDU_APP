import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

/** Pagination + optional lesson filter (query string may include both). */
export class LessonPaginationDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by Minna lesson number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lessonNumber?: number;
}
