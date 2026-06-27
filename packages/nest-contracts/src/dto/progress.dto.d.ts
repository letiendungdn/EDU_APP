export declare class ReviewItemDto {
    kana: string;
    kanji?: string;
    meaning: string;
    lessonNumber: number;
    wrongCount: number;
    reviewStreak: number;
    mastered: boolean;
    lastReviewedAt?: string;
}
export declare class SyncReviewDto {
    items: ReviewItemDto[];
}
export declare class LogListeningDto {
    date: string;
    seconds: number;
}
export declare class UpsertDailyNoteDto {
    date: string;
    content: string;
}
export declare class DailyGoalItemDto {
    id: string;
    kind: string;
    label: string;
    done: boolean;
    target?: number;
}
export declare class UpsertDailyGoalsDto {
    date: string;
    items: DailyGoalItemDto[];
}
