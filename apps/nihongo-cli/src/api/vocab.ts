import {api} from './client';
import type {Vocab, SrsReviewCard} from '../types';

export const vocabApi = {
  list: async (params?: {level?: string; page?: number; limit?: number}) => {
    const res = await api.get<{items: Vocab[]; total: number}>('/vocab', {params});
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<Vocab>(`/vocab/${id}`);
    return res.data;
  },

  getSrsQueue: async () => {
    const res = await api.get<SrsReviewCard[]>('/vocab/srs/due');
    return res.data;
  },

  submitSrsResult: async (vocabId: number, quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    const res = await api.post<{nextInterval: number}>(`/vocab/${vocabId}/srs`, {quality});
    return res.data;
  },
};
