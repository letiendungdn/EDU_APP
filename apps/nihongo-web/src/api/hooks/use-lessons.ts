import { useQuery } from '@tanstack/react-query';
import { fetchLessons } from '../index';
import { queryKeys } from '../query-keys';
import { STALE_5M } from './constants';

export function useLessons() {
  return useQuery({
    queryKey: queryKeys.lessons.all,
    queryFn: fetchLessons,
    staleTime: STALE_5M,
  });
}
