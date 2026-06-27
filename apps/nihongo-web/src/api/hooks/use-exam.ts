import { useQuery } from '@tanstack/react-query';
import { fetchMockExamTemplates } from '../index';
import { queryKeys } from '../query-keys';
import { STALE_5M } from './constants';

export function useExamTemplates() {
  return useQuery({
    queryKey: queryKeys.exam.templates,
    queryFn: fetchMockExamTemplates,
    staleTime: STALE_5M,
  });
}
