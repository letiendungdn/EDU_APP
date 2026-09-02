import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const LEVEL_RE = /^n[1-5]$/;

export class CreateMockExamTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug?: string;

  @IsString()
  @Matches(LEVEL_RE, { message: 'level phải là n5, n4, n3, n2 hoặc n1' })
  level!: string;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes!: number;

  @IsInt()
  @Min(1)
  lessonFrom!: number;

  @IsInt()
  @Min(1)
  lessonTo!: number;

  @IsInt()
  @Min(1)
  kanjiLessonFrom!: number;

  @IsInt()
  @Min(1)
  kanjiLessonTo!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  vocabCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  grammarCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  kanjiCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  listeningWordCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  listeningSentenceCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passThreshold?: number;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMockExamTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @Matches(LEVEL_RE)
  level?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  lessonFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  lessonTo?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  kanjiLessonFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  kanjiLessonTo?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  vocabCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  grammarCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  kanjiCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  listeningWordCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  listeningSentenceCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passThreshold?: number;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
