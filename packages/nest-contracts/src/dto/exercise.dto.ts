import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty({ enum: ['multiple_choice', 'fill_in_blank'] })
  @IsIn(['multiple_choice', 'fill_in_blank'])
  type: string;

  @ApiProperty()
  @IsString()
  question: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  options?: string;

  @ApiProperty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsInt()
  lessonId: number;
}

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
