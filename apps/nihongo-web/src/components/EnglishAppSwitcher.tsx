'use client';

import { useQuery } from '@tanstack/react-query';

type AppFeaturesResponse = {
  english: { enabled: boolean; url: string };
};

export default function EnglishAppSwitcher() {
  const { data } = useQuery({
    queryKey: ['app-features'],
    queryFn: async () => {
      const response = await fetch('/app-features', { cache: 'no-store' });
      if (!response.ok) {
        return { english: { enabled: false, url: '' } };
      }
      return (await response.json()) as AppFeaturesResponse;
    },
    staleTime: 30_000,
  });

  if (!data?.english.enabled) {
    return null;
  }

  return (
    <a href={data.english.url} className="nav-link app-switcher">
      🇬🇧 English
    </a>
  );
}
