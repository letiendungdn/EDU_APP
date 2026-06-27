import { useQuery } from '@tanstack/react-query';
import { queryKeys as domainQueryKeys } from '../api/query-keys';
import {
  useExamTemplates,
  useGrammar,
  useLessons,
  useVocab,
} from '../api/hooks';
import {
  fetchAdminPayments,
  fetchAdminSupportThread,
  fetchAdminSupportThreads,
  fetchAdminStats,
  fetchAdminUsers,
  fetchCommunityRoom,
  fetchCommunityRooms,
  fetchSupportThread,
  fetchAuthMe,
  fetchExercises,
  fetchJlptDaNangSchedule,
  fetchDailyListeningConfig,
  fetchJapaneseCounters,
  fetchJlptRoadmap,
  fetchJlptDaNangScheduleStatic,
  fetchKanaCharts,
  fetchKanjiEntries,
  fetchKanjiLessons,
  fetchListeningPlaylist,
} from '../api';
import type { AdminPaymentsFilters } from '../api';
import { getStoredToken } from '../lib/api-client';

export { queryKeys as domainQueryKeys } from '../api/query-keys';
export {
  useLessons,
  useVocab,
  useGrammar,
  useExamTemplates,
  useVocabReview,
  useVocabReviewBatch,
} from '../api/hooks';

/** @deprecated Use domainQueryKeys — kept for backward compatibility */
export const queryKeys = {
  ...domainQueryKeys,
  /** @deprecated use queryKeys.lessons.all */
  lessons: domainQueryKeys.lessons.all,
  /** @deprecated use queryKeys.vocab.byLesson */
  vocabularies: domainQueryKeys.vocab.byLesson,
  /** @deprecated use queryKeys.grammar.byLesson */
  grammars: domainQueryKeys.grammar.byLesson,
  /** @deprecated use queryKeys.exam.templates */
  mockExamTemplates: domainQueryKeys.exam.templates,
  exercises: (lesson: number) => ['exercises', lesson] as const,
  kanjiLessons: ['kanji-lessons'] as const,
  kanjiEntries: (lesson: number) => ['kanji', lesson] as const,
  listeningPlaylist: (from: number, to: number) => ['listening-playlist', from, to] as const,
  jlptDaNangSchedule: ['jlpt-da-nang-schedule'] as const,
  kanaCharts: ['reference', 'kana-charts'] as const,
  japaneseCounters: ['reference', 'japanese-counters'] as const,
  dailyListeningConfig: ['reference', 'daily-listening'] as const,
  jlptRoadmap: ['reference', 'jlpt-roadmap'] as const,
  jlptDaNangStatic: ['reference', 'jlpt-danang-schedule'] as const,
  authMe: ['auth', 'me'] as const,
  adminStats: ['admin', 'stats'] as const,
  adminUsers: ['admin', 'users'] as const,
  adminPayments: (filters: AdminPaymentsFilters) => ['admin', 'payments', filters] as const,
  supportThread: ['support', 'thread'] as const,
  adminSupportThreads: ['admin', 'support', 'threads'] as const,
  adminSupportThread: (id: number) => ['admin', 'support', 'thread', id] as const,
  communityRooms: ['community', 'rooms'] as const,
  communityRoom: (id: number) => ['community', 'room', id] as const,
};

const STALE_5M = 5 * 60 * 1000;

export const useLessonsQuery = useLessons;
export const useVocabulariesQuery = useVocab;
export const useGrammarsQuery = useGrammar;
export const useMockExamTemplatesQuery = useExamTemplates;

export function useExercisesQuery(lessonNumber: number) {
  return useQuery({
    queryKey: queryKeys.exercises(lessonNumber),
    queryFn: () => fetchExercises(lessonNumber),
    enabled: lessonNumber > 0,
    staleTime: STALE_5M,
  });
}

export function useKanjiLessonsQuery() {
  return useQuery({
    queryKey: queryKeys.kanjiLessons,
    queryFn: fetchKanjiLessons,
    staleTime: STALE_5M,
  });
}

export function useKanjiEntriesQuery(lessonNumber: number) {
  return useQuery({
    queryKey: queryKeys.kanjiEntries(lessonNumber),
    queryFn: () => fetchKanjiEntries(lessonNumber),
    enabled: lessonNumber > 0,
    staleTime: STALE_5M,
  });
}

export function useListeningPlaylistQuery(lessonFrom: number, lessonTo: number) {
  return useQuery({
    queryKey: queryKeys.listeningPlaylist(lessonFrom, lessonTo),
    queryFn: () => fetchListeningPlaylist(lessonFrom, lessonTo),
    staleTime: STALE_5M,
  });
}

export function useJlptDaNangScheduleQuery() {
  return useQuery({
    queryKey: queryKeys.jlptDaNangSchedule,
    queryFn: fetchJlptDaNangSchedule,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useKanaChartsQuery() {
  return useQuery({
    queryKey: queryKeys.kanaCharts,
    queryFn: fetchKanaCharts,
    staleTime: STALE_5M,
  });
}

export function useJapaneseCountersQuery() {
  return useQuery({
    queryKey: queryKeys.japaneseCounters,
    queryFn: fetchJapaneseCounters,
    staleTime: STALE_5M,
  });
}

export function useDailyListeningConfigQuery() {
  return useQuery({
    queryKey: queryKeys.dailyListeningConfig,
    queryFn: fetchDailyListeningConfig,
    staleTime: STALE_5M,
  });
}

export function useJlptRoadmapQuery() {
  return useQuery({
    queryKey: queryKeys.jlptRoadmap,
    queryFn: fetchJlptRoadmap,
    staleTime: STALE_5M,
  });
}

export function useJlptDaNangStaticQuery() {
  return useQuery({
    queryKey: queryKeys.jlptDaNangStatic,
    queryFn: fetchJlptDaNangScheduleStatic,
    staleTime: STALE_5M,
  });
}

export function useAuthMeQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.authMe,
    queryFn: () => fetchAuthMe(token!),
    enabled: enabled && !!token,
    retry: false,
    staleTime: 60_000,
  });
}

export function useAdminStatsQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.adminStats,
    queryFn: () => fetchAdminStats(token!),
    enabled: enabled && !!token,
    staleTime: 30_000,
  });
}

export function useAdminUsersQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: () => fetchAdminUsers(token!),
    enabled: enabled && !!token,
    staleTime: 60_000,
  });
}

export function useAdminPaymentsQuery(filters: AdminPaymentsFilters, enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.adminPayments(filters),
    queryFn: () => fetchAdminPayments(token!, filters),
    enabled: enabled && !!token,
    staleTime: 15_000,
  });
}

export function useSupportThreadQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.supportThread,
    queryFn: () => fetchSupportThread(token!),
    enabled: enabled && !!token,
    staleTime: 10_000,
    refetchInterval: 8_000,
  });
}

export function useAdminSupportThreadsQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.adminSupportThreads,
    queryFn: () => fetchAdminSupportThreads(token!),
    enabled: enabled && !!token,
    staleTime: 10_000,
    refetchInterval: 8_000,
  });
}

export function useAdminSupportThreadQuery(threadId: number | null, enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.adminSupportThread(threadId ?? 0),
    queryFn: () => fetchAdminSupportThread(token!, threadId!),
    enabled: enabled && !!token && threadId != null,
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}

export function useCommunityRoomsQuery(enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.communityRooms,
    queryFn: () => fetchCommunityRooms(token!),
    enabled: enabled && !!token,
    staleTime: 10_000,
    refetchInterval: 8_000,
  });
}

export function useCommunityRoomQuery(roomId: number | null, enabled = true) {
  const token = getStoredToken();
  return useQuery({
    queryKey: queryKeys.communityRoom(roomId ?? 0),
    queryFn: () => fetchCommunityRoom(token!, roomId!),
    enabled: enabled && !!token && roomId != null,
    staleTime: 5_000,
    refetchInterval: 5_000,
  });
}
