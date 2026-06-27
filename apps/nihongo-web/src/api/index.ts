import { apiRequest } from '../lib/api-client';
import type {
  AdminStats,
  AuthUser,
  Exercise,
  Grammar,
  JlptDaNangSchedule,
  KanjiEntry,
  KanjiLesson,
  Lesson,
  ListeningPlaylist,
  LoginResponse,
  MockExamTemplate,
  PaginatedResponse,
  Vocabulary,
} from '../types/api';
import type {
  DailyListeningPayload,
  JapaneseCountersPayload,
  JlptDaNangSchedulePayload,
  JlptRoadmapPayload,
  KanaChartsPayload,
  ReferenceMeta,
} from '../types/reference';

async function fetchPaginatedAll<T>(
  buildPath: (page: number, limit: number) => string,
  pageSize = 100,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (all.length < total) {
    const res = await apiRequest<PaginatedResponse<T> | T[]>(
      buildPath(page, pageSize),
    );

    if (Array.isArray(res)) return res;

    const batch = res?.data ?? [];
    total = res?.total ?? batch.length;
    all.push(...batch);

    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }

  return all;
}

export function fetchLessons() {
  return apiRequest<Lesson[]>('/lessons');
}

export function fetchVocabularies(lessonNumber: number) {
  return fetchPaginatedAll<Vocabulary>((page, limit) =>
    `/vocabularies?lessonNumber=${lessonNumber}&page=${page}&limit=${limit}`,
  );
}

export function fetchGrammars(lessonNumber: number) {
  return fetchPaginatedAll<Grammar>((page, limit) =>
    `/grammars?lessonNumber=${lessonNumber}&page=${page}&limit=${limit}`,
  );
}

export function fetchExercises(lessonNumber: number) {
  return apiRequest<Exercise[]>(`/exercises?lessonNumber=${lessonNumber}`);
}

export function fetchKanjiLessons() {
  return apiRequest<KanjiLesson[]>('/kanji-lessons');
}

export function fetchKanjiEntries(lessonNumber: number) {
  return apiRequest<KanjiEntry[]>(`/kanji?lessonNumber=${lessonNumber}`);
}

export function fetchListeningPlaylist(lessonFrom = 1, lessonTo = 25, limit = 120) {
  return apiRequest<ListeningPlaylist>(
    `/listening/playlist?lessonFrom=${lessonFrom}&lessonTo=${lessonTo}&limit=${limit}`,
  );
}

export function fetchMockExamTemplates() {
  return apiRequest<MockExamTemplate[]>('/mock-exams');
}

export function fetchJlptDaNangSchedule() {
  return apiRequest<JlptDaNangSchedule>('/jlpt/da-nang/schedule');
}

export function fetchReferenceList() {
  return apiRequest<ReferenceMeta[]>('/reference');
}

export function fetchReference<T>(slug: string) {
  return apiRequest<T>(`/reference/${slug}`);
}

export function fetchKanaCharts() {
  return fetchReference<KanaChartsPayload>('kana-charts');
}

export function fetchJapaneseCounters() {
  return fetchReference<JapaneseCountersPayload>('japanese-counters');
}

export function fetchDailyListeningConfig() {
  return fetchReference<DailyListeningPayload>('daily-listening');
}

export function fetchJlptRoadmap() {
  return fetchReference<JlptRoadmapPayload>('jlpt-roadmap');
}

export function fetchJlptDaNangScheduleStatic() {
  return fetchReference<JlptDaNangSchedulePayload>('jlpt-danang-schedule');
}

export function startMockExam(level: string) {
  return apiRequest<Record<string, unknown>>(`/mock-exams/${level}/start`, { method: 'POST' });
}

export function submitMockExam(examId: string, answers: Record<string, string>) {
  return apiRequest<Record<string, unknown>>(`/mock-exams/${examId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export function loginAdmin(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchAuthMe(token: string) {
  return apiRequest<AuthUser>('/auth/me', { token });
}

export function fetchAdminStats(token: string) {
  return apiRequest<AdminStats>('/admin/stats', { token });
}

export function adminImportVocab(token: string, lessonNumber: number, text: string) {
  return apiRequest<{ count: number; skipped: number }>('/admin/import/vocab', {
    method: 'POST',
    token,
    body: JSON.stringify({ lessonNumber, text }),
  });
}

export interface ReviewLogItem {
  kana: string;
  kanji?: string | null;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  reviewStreak: number;
  mastered: boolean;
  lastReviewedAt?: string | null;
}

export function syncReviewProgress(token: string, items: ReviewLogItem[]) {
  return apiRequest<{ synced: number }>('/progress/review', {
    method: 'POST',
    token,
    body: JSON.stringify({ items }),
  });
}

export function fetchReviewProgress(token: string) {
  return apiRequest<ReviewLogItem[]>('/progress/review', { token });
}

export function logListeningProgress(token: string, date: string, seconds: number) {
  return apiRequest<unknown>('/progress/listening', {
    method: 'POST',
    token,
    body: JSON.stringify({ date, seconds }),
  });
}

export function fetchListeningProgress(token: string) {
  return apiRequest<Array<{ date: string; seconds: number }>>('/progress/listening', {
    token,
  });
}

// ─── Reading ─────────────────────────────────────────────────

export interface ReadingPassageSummary {
  id: number;
  title: string;
  jlptLevel: string | null;
  estimatedMin: number;
  sortOrder: number;
  _count: { questions: number };
}

export interface ReadingPassage {
  id: number;
  title: string;
  content: string;
  jlptLevel: string | null;
  source: string | null;
  estimatedMin: number;
  questions: ReadingQuestion[];
}

export interface ReadingQuestion {
  id: number;
  question: string;
  answer: string;
  explanation: string | null;
  sortOrder: number;
  options: { id: number; text: string; sortOrder: number }[];
}

export interface ReadingResult {
  correct: number;
  total: number;
  percent: number;
  results: { questionId: number; correct: boolean; correctAnswer: string; explanation: string | null }[];
}

export function fetchReadingPassages(jlptLevel?: string) {
  const q = jlptLevel ? `?jlptLevel=${jlptLevel}` : '';
  return apiRequest<ReadingPassageSummary[]>(`/reading${q}`);
}

export function fetchReadingPassage(id: number) {
  return apiRequest<ReadingPassage>(`/reading/${id}`);
}

export function submitReading(id: number, answers: Record<string, string>) {
  return apiRequest<ReadingResult>(`/reading/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// ─── Dictation ───────────────────────────────────────────────

export interface DictationVocab {
  id: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
}

export function fetchDictationVocab(lessonNumber?: number, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (lessonNumber) params.set('lessonNumber', String(lessonNumber));
  return apiRequest<DictationVocab[]>(`/dictation/vocab?${params}`);
}

export function recordDictationAttempt(vocabId: number, userInput: string, correct: boolean) {
  return apiRequest<unknown>('/dictation/attempt', {
    method: 'POST',
    body: JSON.stringify({ vocabId, userInput, correct }),
  });
}

// ─── Analytics ───────────────────────────────────────────────

export interface AnalyticsData {
  overview: {
    totalStudySeconds: number;
    totalListeningSeconds: number;
    totalCardsReviewed: number;
    masteredVocab: number;
    totalExams: number;
    passedExams: number;
  };
  studySessions: { date: string; seconds: number; cardsReviewed: number }[];
  examHistory: { submittedAt: string; percent: number; passed: boolean; level: string; title: string }[];
  listeningHistory: { date: string; seconds: number }[];
}

export function fetchAnalytics(token: string) {
  return apiRequest<AnalyticsData>('/analytics', { token });
}

// ─── Daily notes ─────────────────────────────────────────────

export interface DailyNoteRow {
  date: string;
  content: string;
  updatedAt: string;
}

export function fetchDailyNotes(token: string) {
  return apiRequest<DailyNoteRow[]>('/progress/notes', { token });
}

export function upsertDailyNote(token: string, date: string, content: string) {
  return apiRequest<DailyNoteRow>('/progress/notes', {
    method: 'PUT',
    token,
    body: JSON.stringify({ date, content }),
  });
}

// ─── Daily goals ─────────────────────────────────────────────

export interface DailyGoalItemRow {
  id: string;
  kind: string;
  label: string;
  done: boolean;
  target?: number;
}

export interface DailyGoalsRow {
  date: string;
  items: DailyGoalItemRow[];
  updatedAt: string;
}

export function fetchDailyGoals(token: string) {
  return apiRequest<DailyGoalsRow[]>('/progress/goals', { token });
}

export function upsertDailyGoals(
  token: string,
  date: string,
  items: DailyGoalItemRow[],
) {
  return apiRequest<DailyGoalsRow>('/progress/goals', {
    method: 'PUT',
    token,
    body: JSON.stringify({ date, items }),
  });
}
