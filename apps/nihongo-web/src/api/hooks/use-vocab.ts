import { useQuery } from '@tanstack/react-query';
import { fetchVocabularies } from '../index';
import { queryKeys } from '../query-keys';
import { STALE_5M } from './constants';

export function useVocab(lessonNumber: number) {
  return useQuery({
    queryKey: queryKeys.vocab.byLesson(lessonNumber),
    queryFn: () => fetchVocabularies(lessonNumber),
    enabled: lessonNumber > 0,
    staleTime: STALE_5M,
  });
}
