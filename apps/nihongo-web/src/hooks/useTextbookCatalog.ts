'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTextbookCatalog } from '../api';

/** Danh mục giáo trình từ DB (thay đổi hiếm → cache lâu). */
export function useTextbookCatalog() {
  return useQuery({
    queryKey: ['reference', 'textbooks'],
    queryFn: fetchTextbookCatalog,
    staleTime: 30 * 60 * 1000,
  });
}
