import { PrismaService } from './prisma.service';
export declare const VOCABULARY_CONTENT_TYPE: "VOCABULARY";
export type ReviewBankItem = {
    kana: string;
    kanji: string | null;
    meaning: string;
    lessonNumber: number;
    wrongCount: number;
    reviewStreak: number;
    mastered: boolean;
    lastReviewedAt: string | null;
};
export type ReviewBankSyncItem = {
    kana: string;
    kanji?: string | null;
    meaning: string;
    lessonNumber: number;
    wrongCount: number;
    reviewStreak: number;
    mastered: boolean;
};
export declare class SrsCardRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    upsertVocabularyReviewCard(userId: number, contentId: number, item: ReviewBankSyncItem, lastReviewedAt: Date | null): Promise<void>;
    findVocabularyReviewBank(userId: number): Promise<ReviewBankItem[]>;
}
