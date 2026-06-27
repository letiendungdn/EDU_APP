import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useVocab } from '../../api/hooks/use-vocab';

vi.mock('../../api/index', () => ({
  fetchVocabularies: vi.fn(),
}));

import { fetchVocabularies } from '../../api/index';

const mockVocab = [
  { id: 1, kanji: '食べる', kana: 'たべる', romaji: 'taberu', meaning: 'ăn', lessonId: 1 },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useVocab', () => {
  beforeEach(() => {
    vi.mocked(fetchVocabularies).mockReset();
  });

  it('fetches vocab for a lesson', async () => {
    vi.mocked(fetchVocabularies).mockResolvedValue(mockVocab);

    const { result } = renderHook(() => useVocab(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockVocab);
    expect(fetchVocabularies).toHaveBeenCalledWith(1);
  });

  it('does not fetch when lesson is 0', () => {
    renderHook(() => useVocab(0), { wrapper: createWrapper() });
    expect(fetchVocabularies).not.toHaveBeenCalled();
  });
});
