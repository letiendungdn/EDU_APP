import axios, { type AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'access_token';

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getAccessToken();
  return Boolean(token);
}

function createClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const api = createClient();

export interface VocabDto {
  id: number;
  kana?: string;
  kanji?: string | null;
  meaning?: string;
  romaji?: string;
}

function parseVocabList(raw: unknown): VocabDto[] {
  if (Array.isArray(raw)) return raw as VocabDto[];
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const data = (raw as { data?: unknown }).data;
    if (Array.isArray(data)) return data as VocabDto[];
  }
  return [];
}

export async function fetchAllVocabForLesson(lessonNumber: number): Promise<VocabDto[]> {
  const all: VocabDto[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const res = await api.get('/vocabularies', {
      params: { lessonNumber, page, limit },
    });
    const batch = parseVocabList(res.data);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }

  return all;
}

export async function login(email: string, password: string): Promise<void> {
  const res = await api.post<{ access_token?: string }>('/auth/login', {
    email,
    password,
  });
  const token = res.data.access_token;
  if (!token) throw new Error('Không nhận được access token');
  await saveAccessToken(token);
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    await clearAccessToken();
  }
}

const translateCache = new Map<string, string>();

export async function translateJapanese(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const cached = translateCache.get(trimmed);
  if (cached) return cached;

  const res = await api.post<{ translation?: string }>('/translate', {
    text: trimmed,
    sourceLang: 'ja',
    targetLang: 'vi',
  });

  const translated = res.data.translation?.trim() || trimmed;
  translateCache.set(trimmed, translated);
  return translated;
}
