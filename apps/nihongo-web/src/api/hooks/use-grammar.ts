import { useQuery } from '@tanstack/react-query';
import { fetchGrammars } from '../index';
import { queryKeys } from '../query-keys';
import { STALE_5M } from './constants';

export function useGrammar(lessonNumber: number) {
  return useQuery({
    queryKey: queryKeys.grammar.byLesson(lessonNumber),
    queryFn: () => fetchGrammars(lessonNumber),
    enabled: lessonNumber > 0,
    staleTime: STALE_5M,
  });
}
