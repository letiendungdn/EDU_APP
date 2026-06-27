export declare class CreateVocabularyDto {
    kanji?: string;
    kana: string;
    romaji: string;
    meaning: string;
    lessonId: number;
}
declare const UpdateVocabularyDto_base: import("@nestjs/common").Type<Partial<CreateVocabularyDto>>;
export declare class UpdateVocabularyDto extends UpdateVocabularyDto_base {
}
export {};
