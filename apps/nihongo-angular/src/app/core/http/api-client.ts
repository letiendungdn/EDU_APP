export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const TOKEN_KEY = 'nihongo_auth_token';
const TOKEN_EVENT = 'nihongo-auth-token';

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(TOKEN_EVENT, { detail: token }));
}

interface ApiEnvelope<T> {
  success: true;
  data: T;
}

function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'success' in json && (json as ApiEnvelope<T>).success) {
    return (json as ApiEnvelope<T>).data;
  }
  return json as T;
}

function shouldSkipRefresh(path: string): boolean {
  return (
    path.startsWith('/auth/login') ||
    path.startsWith('/auth/register') ||
    path.startsWith('/auth/oidc') ||
    path.startsWith('/auth/google') ||
    path.startsWith('/auth/refresh')
  );
}

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setStoredToken(null);
        return null;
      }
      const json = (await res.json()) as unknown;
      const data = unwrap<{ access_token?: string }>(json);
      const token = data?.access_token ?? null;
      if (token) setStoredToken(token);
      else setStoredToken(null);
      return token;
    } catch {
      setStoredToken(null);
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null; _authRetried?: boolean } = {},
): Promise<T> {
  const { token, _authRetried, ...init } = options;
  const headers = new Headers(init.headers);
  const authToken = token === undefined ? getStoredToken() : token;
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`/api${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401 && !_authRetried && !shouldSkipRefresh(path)) {
      const next = await refreshAccessToken();
      if (next) {
        return apiFetch<T>(path, { ...options, token: next, _authRetried: true });
      }
    }
    let message = `API error: ${res.status}`;
    try {
      const err = (await res.json()) as { message?: string; error?: { message?: string } };
      if (err.error?.message) message = err.error.message;
      else if (err.message) message = err.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as unknown;
  return unwrap<T>(json);
}
