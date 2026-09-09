import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {vocabApi} from '../api/vocab';

export const useVocabList = (level?: string) =>
  useQuery({
    queryKey: ['vocab', 'list', level ?? 'all'],
    queryFn: () => vocabApi.list({level, limit: 50}),
    staleTime: 5 * 60 * 1000,
  });

export const useVocabDetail = (id: number) =>
  useQuery({
    queryKey: ['vocab', id],
    queryFn: () => vocabApi.getById(id),
    enabled: id > 0,
  });

export const useSrsQueue = () =>
  useQuery({
    queryKey: ['srs', 'due'],
    queryFn: vocabApi.getSrsQueue,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

export const useSubmitSrs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({vocabId, quality}: {vocabId: number; quality: 0 | 1 | 2 | 3 | 4 | 5}) =>
      vocabApi.submitSrsResult(vocabId, quality),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['srs', 'due']});
    },
  });
};
