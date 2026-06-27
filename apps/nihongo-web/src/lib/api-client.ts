import type { ApiErrorBody } from '../types/api';
import { ApiError } from '../types/api';

const API_BASE = '/api';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;

export type RequestOptions = RequestInit & {
  token?: string | null;
  retries?: number;
};

interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  timestamp: string;
}

interface ApiErrorEnvelope {
  success: false;
  error?: { code?: string; message?: string };
  message?: string | string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseErrorMessage(
  body: ApiErrorBody | ApiErrorEnvelope,
  status: number,
): string {
  if ('error' in body && body.error?.message) {
    return body.error.message;
  }
  if (Array.isArray(body.message)) return body.message.join(', ');
  if (body.message) return body.message;
  return `API error: ${status}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, retries = MAX_RETRIES, ...init } = options;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as ApiErrorEnvelope;
        const message = parseErrorMessage(body, res.status);
        if (res.status >= 500 && attempt < retries) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        throw new ApiError(res.status, message);
      }

      if (res.status === 204) {
        return undefined as T;
      }

      const json = (await res.json()) as ApiSuccessEnvelope<T> | T;
      if (
        json &&
        typeof json === 'object' &&
        'success' in json &&
        json.success === true &&
        'data' in json
      ) {
        return json.data;
      }
      return json as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError) throw error;
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Network request failed');
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nihongo-auth-token');
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('nihongo-auth-token', token);
  else localStorage.removeItem('nihongo-auth-token');
}
