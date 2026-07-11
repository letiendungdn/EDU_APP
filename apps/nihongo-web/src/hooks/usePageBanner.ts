'use client';

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  deleteBannerApi,
  fetchBannerConfig,
  resolveBanner,
  upsertBannerApi,
  type BannerScope,
  type BannerStore,
} from '../utils/pageBanner';

const BANNER_QUERY_KEY = ['page-banners'];
const EMPTY_STORE: BannerStore = { global: null, pages: {} };

export function usePageBanner() {
  const pathname = usePathname() ?? '/';
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: store = EMPTY_STORE } = useQuery({
    queryKey: BANNER_QUERY_KEY,
    queryFn: fetchBannerConfig,
    staleTime: 5 * 60_000,
  });

  const bannerUrl = useMemo(() => resolveBanner(store, pathname), [store, pathname]);

  const setBanner = useCallback(
    async (imageDataUrl: string, scope: BannerScope) => {
      if (!token) throw new Error('Chưa đăng nhập');
      const next = await upsertBannerApi(token, scope, pathname, imageDataUrl);
      queryClient.setQueryData(BANNER_QUERY_KEY, next);
    },
    [pathname, queryClient, token],
  );

  const removeBanner = useCallback(
    async (scope: 'global' | 'page' | 'all') => {
      if (!token) throw new Error('Chưa đăng nhập');
      const next = await deleteBannerApi(token, scope, pathname);
      queryClient.setQueryData(BANNER_QUERY_KEY, next);
    },
    [pathname, queryClient, token],
  );

  return { bannerUrl, setBanner, removeBanner, pathname, isAdmin };
}
