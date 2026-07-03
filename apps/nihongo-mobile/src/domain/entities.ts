export type SyncStatus = 'synced' | 'pending' | 'conflict';

export interface Vocabulary {
  id: number;
  lessonNumber: number;
  kana: string;
  kanji: string | null;
  meaning: string;
  romaji: string;
  sortOrder: number;
  syncStatus: SyncStatus;
}

export interface SrsCard {
  id: number;
  vocabularyId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: number;
  mastered: boolean;
  syncStatus: SyncStatus;
  updatedAt: number;
}

export interface ReviewCard {
  card: SrsCard;
  kana: string;
  kanji: string | null;
  meaning: string;
  romaji: string;
}

export interface OverlayLabel {
  left: number;
  top: number;
  width: number;
  height: number;
  original: string;
  translated: string;
}
