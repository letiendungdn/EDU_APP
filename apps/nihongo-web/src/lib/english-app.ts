const INTERNAL_URL =
  process.env.ENGLISH_APP_INTERNAL_URL ??
  (process.env.NODE_ENV === 'production' ? 'http://english-web:3001' : 'http://localhost:3001');

const PUBLIC_URL =
  process.env.ENGLISH_APP_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_ENGLISH_APP_URL ??
  'http://localhost:3001';

const PROBE_TIMEOUT_MS = 2000;

export type EnglishAppFeature = {
  enabled: boolean;
  url: string;
};

export async function probeEnglishApp(): Promise<EnglishAppFeature> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const response = await fetch(INTERNAL_URL, {
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return { enabled: response.status < 500, url: PUBLIC_URL };
  } catch {
    return { enabled: false, url: PUBLIC_URL };
  }
}
