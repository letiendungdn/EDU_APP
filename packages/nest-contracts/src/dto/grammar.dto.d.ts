export declare class CreateExampleDto {
    jp: string;
    romaji: string;
    en?: string;
    vi?: string;
}
export declare class CreateGrammarDto {
    pattern: string;
    meaning: string;
    explanation?: string;
    lessonId: number;
    examples?: CreateExampleDto[];
}
declare const UpdateGrammarDto_base: import("@nestjs/common").Type<Partial<CreateGrammarDto>>;
export declare class UpdateGrammarDto extends UpdateGrammarDto_base {
}
export {};
