import { apiRequest } from '../lib/api-client';
import type {
  AdminPaymentsList,
  AdminStats,
  AdminSupportThreadSummary,
  AdminUserSummary,
  AuthUser,
  CreateSubscriptionResponse,
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
  PaymentRecord,
  PaymentStatus,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanConfig,
  SupportThreadResponse,
  RefundResult,
  SetupIntentResponse,
  SavedCard,
  UpdateProfileInput,
  Vocabulary,
} from '../types/api';
import type {
  DailyListeningPayload,
  JapaneseCountersPayload,
  JapanesePronunciationRulesPayload,
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

export function fetchKanjiSearch(query: string) {
  return apiRequest<KanjiEntry[]>(`/kanji?q=${encodeURIComponent(query)}`);
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

export function fetchJapanesePronunciationRules() {
  return fetchReference<JapanesePronunciationRulesPayload>(
    'japanese-pronunciation-rules',
  );
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

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
}

/** @deprecated use login() */
export const loginAdmin = login;

export function register(email: string, password: string) {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAuth(token: string) {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
    credentials: 'include',
  });
}

export function loginWithGoogle(credential: string) {
  return apiRequest<LoginResponse>('/auth/google', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ credential }),
  });
}

export function updateProfile(token: string, data: UpdateProfileInput) {
  return apiRequest<AuthUser>('/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function fetchAuthMe(token: string) {
  return apiRequest<AuthUser>('/auth/me', { token });
}

export function fetchAdminStats(token: string) {
  return apiRequest<AdminStats>('/admin/stats', { token });
}

export function fetchAdminUsers(token: string) {
  return apiRequest<AdminUserSummary[]>('/admin/users', { token });
}

export type AdminPaymentsFilters = {
  userId?: number;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
};

export function fetchAdminPayments(token: string, filters: AdminPaymentsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.userId) params.set('userId', String(filters.userId));
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  const qs = params.toString();
  return apiRequest<AdminPaymentsList>(`/admin/payments${qs ? `?${qs}` : ''}`, { token });
}

export function fetchAdminUserPayments(token: string, userId: number) {
  return apiRequest<PaymentRecord[]>(`/admin/users/${userId}/payments`, { token });
}

export function adminRefundPayment(
  token: string,
  paymentId: number,
  options?: { reason?: string; amountCents?: number },
) {
  return apiRequest<RefundResult>(`/admin/payments/${paymentId}/refund`, {
    method: 'POST',
    token,
    body: JSON.stringify(options ?? {}),
  });
}

export function fetchSupportThread(token: string) {
  return apiRequest<SupportThreadResponse>('/support', { token });
}

export function sendSupportMessage(token: string, content: string) {
  return apiRequest<{ threadId: number; message: import('../types/chat').SupportMessage }>(
    '/support/messages',
    { method: 'POST', token, body: JSON.stringify({ content }) },
  );
}

export function markSupportRead(token: string) {
  return apiRequest<{ ok: boolean }>('/support/read', { method: 'PATCH', token });
}

export function fetchAdminSupportThreads(token: string) {
  return apiRequest<AdminSupportThreadSummary[]>('/admin/support/threads', { token });
}

export function fetchAdminSupportThread(token: string, threadId: number) {
  return apiRequest<SupportThreadResponse>(`/admin/support/threads/${threadId}`, {
    token,
  });
}

export function sendAdminSupportMessage(token: string, threadId: number, content: string) {
  return apiRequest<{ message: import('../types/chat').SupportMessage }>(
    `/admin/support/threads/${threadId}/messages`,
    { method: 'POST', token, body: JSON.stringify({ content }) },
  );
}

export function markAdminSupportRead(token: string, threadId: number) {
  return apiRequest<{ ok: boolean }>(`/admin/support/threads/${threadId}/read`, {
    method: 'PATCH',
    token,
  });
}

export function fetchCommunityRooms(token: string) {
  return apiRequest<import('../types/api').CommunityRoomSummary[]>('/community/rooms', {
    token,
  });
}

export function fetchCommunityRoom(token: string, roomId: number) {
  return apiRequest<import('../types/api').CommunityRoomResponse>(
    `/community/rooms/${roomId}`,
    { token },
  );
}

export function sendCommunityMessage(token: string, roomId: number, content: string) {
  return apiRequest<{ message: import('../types/chat').GroupChatMessage }>(
    `/community/rooms/${roomId}/messages`,
    { method: 'POST', token, body: JSON.stringify({ content }) },
  );
}

export function markCommunityRead(token: string, roomId: number) {
  return apiRequest<{ ok: boolean }>(`/community/rooms/${roomId}/read`, {
    method: 'PATCH',
    token,
  });
}

export function createCommunityGroup(
  token: string,
  name: string,
  memberIds: number[],
) {
  return apiRequest<import('../types/api').CommunityRoomResponse>('/community/rooms/group', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, memberIds }),
  });
}

export function createDirectChat(token: string, userId: number) {
  return apiRequest<import('../types/api').CommunityRoomResponse>('/community/rooms/direct', {
    method: 'POST',
    token,
    body: JSON.stringify({ userId }),
  });
}

export function searchCommunityUsers(token: string, q: string) {
  return apiRequest<import('../types/api').CommunityChatUser[]>(
    `/community/users?q=${encodeURIComponent(q)}`,
    { token },
  );
}

export function fetchOnlineCommunityUsers(token: string) {
  return apiRequest<import('../types/api').CommunityChatUser[]>('/community/online', {
    token,
  });
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

// ─── Subscription ─────────────────────────────────────────────

export function fetchSubscriptionPlans() {
  return apiRequest<SubscriptionPlanConfig[]>('/subscriptions/plans');
}

export function fetchSubscriptionStatus(token: string) {
  return apiRequest<Subscription | null>('/subscriptions/status', { token });
}

export function createSubscription(
  token: string,
  plan: SubscriptionPlan,
  paymentMethodId?: string,
) {
  return apiRequest<CreateSubscriptionResponse>('/subscriptions', {
    method: 'POST',
    token,
    body: JSON.stringify({
      plan,
      ...(paymentMethodId ? { paymentMethodId } : {}),
    }),
  });
}

export function cancelSubscription(token: string) {
  return apiRequest<{ message: string }>('/subscriptions', {
    method: 'DELETE',
    token,
  });
}

export function requestSubscriptionRefund(token: string, reason?: string) {
  return apiRequest<RefundResult>('/subscriptions/refund', {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  });
}

// ─── Payments / Refunds ───────────────────────────────────────

export function fetchMyPayments(token: string) {
  return apiRequest<PaymentRecord[]>('/payments/me', { token });
}

export function requestPaymentRefund(
  token: string,
  paymentId: number,
  reason?: string,
) {
  return apiRequest<RefundResult>(`/payments/${paymentId}/refund`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  });
}

// ─── Payment methods ──────────────────────────────────────────

export function fetchPaymentMethods(token: string) {
  return apiRequest<SavedCard[]>('/payment-methods', { token });
}

export function createPaymentMethodSetup(token: string) {
  return apiRequest<SetupIntentResponse>('/payment-methods/setup', {
    method: 'POST',
    token,
  });
}

export function setDefaultPaymentMethod(token: string, paymentMethodId: string) {
  return apiRequest<{ message: string }>(`/payment-methods/${paymentMethodId}/default`, {
    method: 'POST',
    token,
  });
}

export function deletePaymentMethod(token: string, paymentMethodId: string) {
  return apiRequest<{ message: string }>(`/payment-methods/${paymentMethodId}`, {
    method: 'DELETE',
    token,
  });
}
