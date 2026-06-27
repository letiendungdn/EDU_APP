export declare class CreateExerciseDto {
    type: string;
    question: string;
    options?: string;
    answer: string;
    lessonId: number;
}
declare const UpdateExerciseDto_base: import("@nestjs/common").Type<Partial<CreateExerciseDto>>;
export declare class UpdateExerciseDto extends UpdateExerciseDto_base {
}
export {};
