'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api-client';

type AppFeaturesResponse = {
  english: { enabled: boolean; url: string };
};

export default function EnglishAppSwitcher() {
  const { token } = useAuth();

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

  if (!data?.english.enabled) return null;

  async function handleSwitch() {
    const englishUrl = data!.english.url;

    if (token) {
      try {
        // Exchange nihongo token for an English JWT — auto-creates account by email if needed
        const res = await apiRequest<{ token: string }>(
          '/english/auth/token-exchange',
          { method: 'POST', body: JSON.stringify({ token }), token },
        );
        // Pass the English token via query param so english-web can pick it up on mount
        window.location.href = `${englishUrl}?sso_token=${encodeURIComponent(res.token)}`;
        return;
      } catch {
        // Fallback: open english app without SSO (user will be asked to login)
      }
    }

    window.location.href = englishUrl;
  }

  return (
    <button
      onClick={() => void handleSwitch()}
      className="nav-link app-switcher"
      title="English"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      🇬🇧 <span className="app-switcher__label">English</span>
    </button>
  );
}
