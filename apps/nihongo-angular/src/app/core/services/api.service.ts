import { Injectable } from '@angular/core';
import { apiFetch } from '../http/api-client';
import type {
  AdminPaymentsList,
  AdminStats,
  AdminSupportThreadSummary,
  AdminUserSummary,
  AnalyticsData,
  AuthUser,
  CommunityChatUser,
  CommunityRoomResponse,
  CommunityRoomSummary,
  CreateSubscriptionResponse,
  DailyGoalsRow,
  DailyGoalItemRow,
  DailyNoteRow,
  DictationVocab,
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
  ReadingPassage,
  ReadingPassageSummary,
  ReadingResult,
  RefundResult,
  ReviewLogItem,
  SavedCard,
  SetupIntentResponse,
  SrsDueCard,
  SrsReviewResult,
  SrsStats,
  SentencePracticeFeedback,
  Subscription,
  SubscriptionPlan,
  SubscriptionPlanConfig,
  SupportThreadResponse,
  UpdateProfileInput,
  Vocabulary,
  VocabularyWithLesson,
} from '../models/api.models';
import type { BannerScope, BannerStore } from '../utils/page-banner.util';
import type {
  BookAudioPayload,
  DailyListeningPayload,
  EnglishKatakanaPayload,
  JapaneseCountersPayload,
  JapanesePronunciationRulesPayload,
  JlptDaNangSchedulePayload,
  JlptRoadmapPayload,
  KanaChartsPayload,
} from '../models/reference.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  getLessons(): Promise<Lesson[]> {
    return apiFetch<Lesson[]>('/lessons');
  }

  getVocabularies(lessonNumber: number): Promise<Vocabulary[]> {
    return this.fetchPaginatedAll<Vocabulary>(
      (page, limit) =>
        `/vocabularies?lessonNumber=${lessonNumber}&page=${page}&limit=${limit}`,
    );
  }

  async getVocabulariesRange(lessonFrom: number, lessonTo: number): Promise<VocabularyWithLesson[]> {
    const from = Math.min(lessonFrom, lessonTo);
    const to = Math.max(lessonFrom, lessonTo);
    const lessonNumbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const batches = await Promise.all(lessonNumbers.map((n) => this.getVocabularies(n)));
    return batches.flatMap((list, index) =>
      list.map((entry) => ({ ...entry, lessonNumber: lessonNumbers[index] })),
    );
  }

  getGrammars(lessonNumber: number): Promise<Grammar[]> {
    return this.fetchPaginatedAll<Grammar>(
      (page, limit) => `/grammars?lessonNumber=${lessonNumber}&page=${page}&limit=${limit}`,
    );
  }

  getExercises(lessonNumber: number): Promise<Exercise[]> {
    return apiFetch<Exercise[]>(`/exercises?lessonNumber=${lessonNumber}`);
  }

  getKanjiLessons(): Promise<KanjiLesson[]> {
    return apiFetch<KanjiLesson[]>('/kanji-lessons');
  }

  getKanjiEntries(lessonNumber: number): Promise<KanjiEntry[]> {
    return apiFetch<KanjiEntry[]>(`/kanji?lessonNumber=${lessonNumber}`);
  }

  searchKanji(query: string): Promise<KanjiEntry[]> {
    return apiFetch<KanjiEntry[]>(`/kanji?q=${encodeURIComponent(query)}`);
  }

  getKanjiByJlpt(jlptLevel: string): Promise<KanjiEntry[]> {
    return apiFetch<KanjiEntry[]>(`/kanji?jlptLevel=${encodeURIComponent(jlptLevel)}`);
  }

  getListeningPlaylist(lessonFrom = 1, lessonTo = 25, limit = 120): Promise<ListeningPlaylist> {
    return apiFetch<ListeningPlaylist>(
      `/listening/playlist?lessonFrom=${lessonFrom}&lessonTo=${lessonTo}&limit=${limit}`,
    );
  }

  getMockExamTemplates(): Promise<MockExamTemplate[]> {
    return apiFetch<MockExamTemplate[]>('/mock-exams');
  }

  startMockExam(level: string): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>(`/mock-exams/${level}/start`, { method: 'POST' });
  }

  submitMockExam(examId: string, answers: Record<string, string>): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>(`/mock-exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  getJlptDaNangSchedule(): Promise<JlptDaNangSchedule> {
    return apiFetch<JlptDaNangSchedule>('/jlpt/da-nang/schedule');
  }

  getReference<T>(slug: string): Promise<T> {
    return apiFetch<T>(`/reference/${slug}`);
  }

  getKanaCharts(): Promise<KanaChartsPayload> {
    return this.getReference<KanaChartsPayload>('kana-charts');
  }

  getJapaneseCounters(): Promise<JapaneseCountersPayload> {
    return this.getReference<JapaneseCountersPayload>('japanese-counters');
  }

  getJapanesePronunciationRules(): Promise<JapanesePronunciationRulesPayload> {
    return this.getReference<JapanesePronunciationRulesPayload>('japanese-pronunciation-rules');
  }

  getEnglishKatakana(): Promise<EnglishKatakanaPayload> {
    return this.getReference<EnglishKatakanaPayload>('english-katakana');
  }

  getDailyListeningConfig(): Promise<DailyListeningPayload> {
    return this.getReference<DailyListeningPayload>('daily-listening');
  }

  getBookAudioFiles(): Promise<BookAudioPayload> {
    return this.getReference<BookAudioPayload>('book-audio-files');
  }

  getJlptRoadmap(): Promise<JlptRoadmapPayload> {
    return this.getReference<JlptRoadmapPayload>('jlpt-roadmap');
  }

  getJlptDaNangScheduleStatic(): Promise<JlptDaNangSchedulePayload> {
    return this.getReference<JlptDaNangSchedulePayload>('jlpt-danang-schedule');
  }

  getReadingPassages(jlptLevel?: string): Promise<ReadingPassageSummary[]> {
    const q = jlptLevel ? `?jlptLevel=${jlptLevel}` : '';
    return apiFetch<ReadingPassageSummary[]>(`/reading${q}`);
  }

  getReadingPassage(id: number): Promise<ReadingPassage> {
    return apiFetch<ReadingPassage>(`/reading/${id}`);
  }

  submitReading(id: number, answers: Record<string, string>): Promise<ReadingResult> {
    return apiFetch<ReadingResult>(`/reading/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  getDictationVocab(lessonNumber?: number, limit = 20): Promise<DictationVocab[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (lessonNumber) params.set('lessonNumber', String(lessonNumber));
    return apiFetch<DictationVocab[]>(`/dictation/vocab?${params}`);
  }

  recordDictationAttempt(vocabId: number, userInput: string, correct: boolean): Promise<unknown> {
    return apiFetch('/dictation/attempt', {
      method: 'POST',
      body: JSON.stringify({ vocabId, userInput, correct }),
    });
  }

  login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  loginWithGoogle(credential: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  logout(token: string): Promise<{ message: string }> {
    return apiFetch('/auth/logout', { method: 'POST', token });
  }

  fetchAuthMe(token: string): Promise<AuthUser> {
    return apiFetch<AuthUser>('/auth/me', { token });
  }

  updateProfile(token: string, data: UpdateProfileInput): Promise<AuthUser> {
    return apiFetch<AuthUser>('/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(data),
    });
  }

  getAnalytics(token: string): Promise<AnalyticsData> {
    return apiFetch<AnalyticsData>('/analytics', { token });
  }

  getDailyNotes(token: string): Promise<DailyNoteRow[]> {
    return apiFetch<DailyNoteRow[]>('/progress/notes', { token });
  }

  upsertDailyNote(token: string, date: string, content: string): Promise<DailyNoteRow> {
    return apiFetch<DailyNoteRow>('/progress/notes', {
      method: 'PUT',
      token,
      body: JSON.stringify({ date, content }),
    });
  }

  getDailyGoals(token: string): Promise<DailyGoalsRow[]> {
    return apiFetch<DailyGoalsRow[]>('/progress/goals', { token });
  }

  upsertDailyGoals(token: string, date: string, items: DailyGoalItemRow[]): Promise<DailyGoalsRow> {
    return apiFetch<DailyGoalsRow>('/progress/goals', {
      method: 'PUT',
      token,
      body: JSON.stringify({ date, items }),
    });
  }

  syncReviewProgress(token: string, items: ReviewLogItem[]): Promise<{ synced: number }> {
    return apiFetch('/progress/review', {
      method: 'POST',
      token,
      body: JSON.stringify({ items }),
    });
  }

  getReviewProgress(token: string): Promise<ReviewLogItem[]> {
    return apiFetch<ReviewLogItem[]>('/progress/review', { token });
  }

  logListeningProgress(token: string, date: string, seconds: number): Promise<unknown> {
    return apiFetch('/progress/listening', {
      method: 'POST',
      token,
      body: JSON.stringify({ date, seconds }),
    });
  }

  getListeningProgress(token: string): Promise<Array<{ date: string; seconds: number }>> {
    return apiFetch('/progress/listening', { token });
  }

  getSubscriptionPlans(): Promise<SubscriptionPlanConfig[]> {
    return apiFetch<SubscriptionPlanConfig[]>('/subscriptions/plans');
  }

  getSubscriptionStatus(token: string): Promise<Subscription | null> {
    return apiFetch<Subscription | null>('/subscriptions/status', { token });
  }

  createSubscription(
    token: string,
    plan: SubscriptionPlan,
    paymentMethodId?: string,
  ): Promise<CreateSubscriptionResponse> {
    return apiFetch<CreateSubscriptionResponse>('/subscriptions', {
      method: 'POST',
      token,
      body: JSON.stringify({ plan, ...(paymentMethodId ? { paymentMethodId } : {}) }),
    });
  }

  cancelSubscription(token: string): Promise<{ message: string }> {
    return apiFetch('/subscriptions', { method: 'DELETE', token });
  }

  requestSubscriptionRefund(token: string, reason?: string): Promise<RefundResult> {
    return apiFetch('/subscriptions/refund', {
      method: 'POST',
      token,
      body: JSON.stringify({ reason }),
    });
  }

  getMyPayments(token: string): Promise<PaymentRecord[]> {
    return apiFetch<PaymentRecord[]>('/payments/me', { token });
  }

  requestPaymentRefund(token: string, paymentId: number, reason?: string): Promise<RefundResult> {
    return apiFetch(`/payments/${paymentId}/refund`, {
      method: 'POST',
      token,
      body: JSON.stringify({ reason }),
    });
  }

  getPaymentMethods(token: string): Promise<SavedCard[]> {
    return apiFetch<SavedCard[]>('/payment-methods', { token });
  }

  createPaymentMethodSetup(token: string): Promise<SetupIntentResponse> {
    return apiFetch('/payment-methods/setup', { method: 'POST', token });
  }

  setDefaultPaymentMethod(token: string, paymentMethodId: string): Promise<{ message: string }> {
    return apiFetch(`/payment-methods/${paymentMethodId}/default`, {
      method: 'POST',
      token,
    });
  }

  deletePaymentMethod(token: string, paymentMethodId: string): Promise<{ message: string }> {
    return apiFetch(`/payment-methods/${paymentMethodId}`, {
      method: 'DELETE',
      token,
    });
  }

  getSupportThread(token: string): Promise<SupportThreadResponse> {
    return apiFetch<SupportThreadResponse>('/support', { token });
  }

  sendSupportMessage(token: string, content: string): Promise<unknown> {
    return apiFetch('/support/messages', {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  }

  getCommunityRooms(token: string): Promise<CommunityRoomSummary[]> {
    return apiFetch<CommunityRoomSummary[]>('/community/rooms', { token });
  }

  getCommunityRoom(token: string, roomId: number): Promise<CommunityRoomResponse> {
    return apiFetch<CommunityRoomResponse>(`/community/rooms/${roomId}`, { token });
  }

  sendCommunityMessage(token: string, roomId: number, content: string): Promise<unknown> {
    return apiFetch(`/community/rooms/${roomId}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  }

  searchCommunityUsers(token: string, q: string): Promise<CommunityChatUser[]> {
    return apiFetch<CommunityChatUser[]>(`/community/users?q=${encodeURIComponent(q)}`, { token });
  }

  getOnlineCommunityUsers(token: string): Promise<CommunityChatUser[]> {
    return apiFetch<CommunityChatUser[]>('/community/online', { token });
  }

  createDirectChat(token: string, userId: number): Promise<CommunityRoomResponse> {
    return apiFetch('/community/rooms/direct', {
      method: 'POST',
      token,
      body: JSON.stringify({ userId }),
    });
  }

  createCommunityGroup(
    token: string,
    name: string,
    memberIds: number[],
  ): Promise<CommunityRoomResponse> {
    return apiFetch('/community/rooms/group', {
      method: 'POST',
      token,
      body: JSON.stringify({ name, memberIds }),
    });
  }

  getAdminStats(token: string): Promise<AdminStats> {
    return apiFetch<AdminStats>('/admin/stats', { token });
  }

  getAdminUsers(token: string): Promise<AdminUserSummary[]> {
    return apiFetch<AdminUserSummary[]>('/admin/users', { token });
  }

  getAdminPayments(
    token: string,
    filters: { userId?: number; status?: string; page?: number; limit?: number } = {},
  ): Promise<AdminPaymentsList> {
    const params = new URLSearchParams();
    if (filters.userId) params.set('userId', String(filters.userId));
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return apiFetch<AdminPaymentsList>(`/admin/payments${qs ? `?${qs}` : ''}`, { token });
  }

  adminRefundPayment(
    token: string,
    paymentId: number,
    options?: { reason?: string; amountCents?: number },
  ): Promise<RefundResult> {
    return apiFetch(`/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      token,
      body: JSON.stringify(options ?? {}),
    });
  }

  getAdminSupportThreads(token: string): Promise<AdminSupportThreadSummary[]> {
    return apiFetch<AdminSupportThreadSummary[]>('/admin/support/threads', { token });
  }

  getAdminSupportThread(token: string, threadId: number): Promise<SupportThreadResponse> {
    return apiFetch<SupportThreadResponse>(`/admin/support/threads/${threadId}`, { token });
  }

  sendAdminSupportMessage(token: string, threadId: number, content: string): Promise<unknown> {
    return apiFetch(`/admin/support/threads/${threadId}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ content }),
    });
  }

  adminImportVocab(token: string, lessonNumber: number, text: string): Promise<{ count: number; skipped: number }> {
    return apiFetch('/admin/import/vocab', {
      method: 'POST',
      token,
      body: JSON.stringify({ lessonNumber, text }),
    });
  }

  getSrsStats(): Promise<SrsStats> {
    return apiFetch<SrsStats>('/progress/srs/stats');
  }

  getSrsDueCards(limit = 20): Promise<SrsDueCard[]> {
    return apiFetch<SrsDueCard[]>(`/progress/srs/due?limit=${limit}`);
  }

  reviewSrsCard(vocabId: number, quality: number): Promise<SrsReviewResult> {
    return apiFetch<SrsReviewResult>('/progress/srs/review', {
      method: 'POST',
      body: JSON.stringify({ vocabId, quality }),
    });
  }

  addSrsLesson(lessonNumber: number): Promise<{ added: number }> {
    return apiFetch<{ added: number }>('/progress/srs/add-lesson', {
      method: 'POST',
      body: JSON.stringify({ lessonNumber }),
    });
  }

  analyzeSentence(sentence: string): Promise<SentencePracticeFeedback> {
    return apiFetch<SentencePracticeFeedback>('/sentence-practice', {
      method: 'POST',
      body: JSON.stringify({ sentence }),
    });
  }

  getBannerConfig(): Promise<BannerStore> {
    return apiFetch<BannerStore>('/banners');
  }

  upsertBanner(
    token: string,
    scope: BannerScope,
    path: string | undefined,
    image: string,
  ): Promise<BannerStore> {
    return apiFetch<BannerStore>('/banners', {
      method: 'PUT',
      token,
      body: JSON.stringify({ scope, path, image }),
    });
  }

  deleteBanner(
    token: string,
    scope: 'global' | 'page' | 'all',
    path?: string,
  ): Promise<BannerStore> {
    const params = new URLSearchParams({ scope });
    if (scope === 'page' && path) params.set('path', path);
    return apiFetch<BannerStore>(`/banners?${params.toString()}`, {
      method: 'DELETE',
      token,
    });
  }

  private async fetchPaginatedAll<T>(
    buildPath: (page: number, limit: number) => string,
  ): Promise<T[]> {
    const pageSize = 100;
    const all: T[] = [];
    let page = 1;
    let total = Number.POSITIVE_INFINITY;

    while (all.length < total) {
      const res = await apiFetch<PaginatedResponse<T> | T[]>(buildPath(page, pageSize));
      if (Array.isArray(res)) return res;
      const batch = res.data ?? [];
      total = res.total ?? batch.length;
      all.push(...batch);
      if (batch.length === 0 || all.length >= total) break;
      page += 1;
    }
    return all;
  }

  fetchKanaRomajiLookup(text: string) {
    return apiFetch<{
      text: string;
      kana: string;
      romaji: string;
      kanji: string | null;
      meaning: string | null;
    }>('/kana/romaji', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  fetchRomajiConversion(romaji: string) {
    return apiFetch<{
      romaji: string;
      kana: string;
      kanji: string | null;
      meaning: string | null;
      options: Array<{ kind: 'kana' | 'kanji'; text: string }>;
    }>('/kana/from-romaji', {
      method: 'POST',
      body: JSON.stringify({ text: romaji }),
    });
  }
}
