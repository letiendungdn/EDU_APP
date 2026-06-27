export interface Lesson {
  id: number;
  lessonNumber: number;
  title: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    vocabularies: number;
    grammars: number;
    exercises: number;
  };
}

export interface Vocabulary {
  id: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
  lessonId: number;
  imageUrl?: string | null;
}

export interface GrammarExample {
  id: number;
  jp: string;
  romaji: string;
  en: string | null;
  vi: string | null;
}

export interface Grammar {
  id: number;
  pattern: string;
  meaning: string;
  explanation: string | null;
  lessonId: number;
  examples?: GrammarExample[];
}

export interface Exercise {
  id: number;
  type: 'multiple_choice' | 'fill_in_blank' | string;
  question: string;
  options: string[] | null;
  answer: string;
  lessonId: number;
}

export interface KanjiLesson {
  id: number;
  lessonNumber: number;
  title: string | null;
  jlptLevel: string | null;
  _count?: { entries: number };
}

export interface KanjiEntry {
  id: number;
  character: string;
  hanViet: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  meaningVi: string;
  mnemonicJp?: string | null;
  mnemonicVi?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  lesson?: { lessonNumber: number; title: string | null; jlptLevel: string | null };
  vocabularies?: Array<{ id: number; word: string; reading: string; meaningVi: string }>;
}

export interface ListeningPlaylistItem {
  id: string;
  type: 'vocab' | 'sentence';
  speakText: string;
  display: string;
  meaning: string;
  lessonNumber: number;
}

export interface ListeningPlaylist {
  goalMinutes: number;
  lessonFrom: number;
  lessonTo: number;
  totalAvailable: number;
  items: ListeningPlaylistItem[];
}

export interface MockExamTemplate {
  level: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  lessonRange: string;
  description: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface AdminStats {
  counts: {
    lessons: number;
    vocabularies: number;
    grammars: number;
    exercises: number;
    kanjiLessons: number;
    kanjiEntries: number;
    users: number;
    examResults?: number;
  };
  recentLessons: Array<{
    id: number;
    lessonNumber: number;
    title: string | null;
    _count: { vocabularies: number; grammars: number; exercises: number };
  }>;
  generatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface JlptAnnouncement {
  title: string;
  url: string;
  updatedAt: string | null;
  examDate: string | null;
  kind: 'exam' | 'registration' | 'fee' | 'other';
}

export interface JlptDaNangSchedule {
  source: 'live' | 'fallback';
  fetchedAt: string;
  organizer: {
    name: string;
    shortName: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    registrationPortal: string;
  };
  fees: {
    formFee: string;
    examFee: string;
    note: string;
  };
  venues: Array<{
    address: string;
    district: string;
    levels: string;
    note?: string;
  }>;
  examDay: Array<{
    levels: string;
    arriveAt: string;
    startAt: string;
    venue: string;
  }>;
  briefing: string;
  announcements: JlptAnnouncement[];
}

export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
  error?: { code?: string; message?: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
