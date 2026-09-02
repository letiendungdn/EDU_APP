import { useQuery } from '@tanstack/react-query';
import { fetchLessons, type LessonContentFilter } from '../index';
import { queryKeys } from '../query-keys';
import { STALE_5M } from './constants';

export function useLessons(options?: { has?: LessonContentFilter }) {
  return useQuery({
    queryKey: queryKeys.lessons.list(options?.has),
    queryFn: () => fetchLessons(options),
    staleTime: STALE_5M,
  });
}
