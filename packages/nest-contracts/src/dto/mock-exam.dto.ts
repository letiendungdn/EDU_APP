import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const LEVEL_RE = /^n[1-5]$/;
const SOURCE_MODES = ['GENERATED', 'CUSTOM'] as const;
const SECTION_IDS = ['vocab', 'grammar', 'kanji', 'listening'] as const;
const QUESTION_TYPES = ['multiple_choice', 'fill_in_blank', 'listening'] as const;

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

  @IsOptional()
  @IsIn([...SOURCE_MODES])
  sourceMode?: (typeof SOURCE_MODES)[number];

  @IsInt()
  @Min(10)
  @Max(240)
  durationMinutes!: number;

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
  @IsIn([...SOURCE_MODES])
  sourceMode?: (typeof SOURCE_MODES)[number];

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

export class MockExamOptionInputDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class CreateMockExamQuestionDto {
  @IsIn([...SECTION_IDS])
  sectionId!: (typeof SECTION_IDS)[number];

  @IsIn([...QUESTION_TYPES])
  type!: (typeof QUESTION_TYPES)[number];

  @IsString()
  @MinLength(1)
  question!: string;

  @IsString()
  @MinLength(1)
  correctAnswer!: string;

  /** Prefer objects with text + optional imageUrl; plain strings still accepted. */
  @IsOptional()
  @IsArray()
  options?: Array<string | MockExamOptionInputDto>;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  audioText?: string | null;

  @IsOptional()
  @IsString()
  audioUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMockExamQuestionDto {
  @IsOptional()
  @IsIn([...SECTION_IDS])
  sectionId?: (typeof SECTION_IDS)[number];

  @IsOptional()
  @IsIn([...QUESTION_TYPES])
  type?: (typeof QUESTION_TYPES)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  question?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  correctAnswer?: string;

  @IsOptional()
  @IsArray()
  options?: Array<string | MockExamOptionInputDto>;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  audioText?: string | null;

  @IsOptional()
  @IsString()
  audioUrl?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReorderMockExamQuestionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds!: number[];
}
