export declare class CreateLessonDto {
    lessonNumber: number;
    title?: string;
}
declare const UpdateLessonDto_base: import("@nestjs/common").Type<Partial<CreateLessonDto>>;
export declare class UpdateLessonDto extends UpdateLessonDto_base {
}
export {};
