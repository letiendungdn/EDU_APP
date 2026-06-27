import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DAILY_REVIEW_LIMIT,
  getTodayReviewBatch,
  recordReviewResult,
  syncToServer,
  type MistakeWord,
} from '../../utils/mistakeVocab';
import { queryKeys } from '../query-keys';

export interface ReviewPayload {
  key: string;
  remembered: boolean;
}

export function useVocabReviewBatch(limit = DAILY_REVIEW_LIMIT) {
  return useQuery({
    queryKey: queryKeys.vocab.review(),
    queryFn: () => getTodayReviewBatch(limit),
    staleTime: 0,
  });
}

export function useVocabReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      recordReviewResult(payload.key, payload.remembered);
      await syncToServer();
      return payload;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vocab.review() });
      const snapshot = queryClient.getQueryData<MistakeWord[]>(queryKeys.vocab.review());
      queryClient.setQueryData(queryKeys.vocab.review(), (old: MistakeWord[] | undefined) =>
        (old ?? []).filter((v) => v.key !== payload.key),
      );
      return { snapshot };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(queryKeys.vocab.review(), ctx.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vocab.review() });
    },
  });
}
