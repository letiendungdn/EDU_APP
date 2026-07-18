import axios, { type AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../config/api';

// ─── Gemini direct REST ────────────────────────────────────────────────────

const extra = Constants.expoConfig?.extra as { geminiApiKey?: string } | undefined;
const GEMINI_KEY = extra?.geminiApiKey ?? '';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const SENTENCE_SYSTEM_PROMPT =
  'Bạn là gia sư tiếng Nhật. Phản hồi JSON (không markdown): ' +
  '{"corrected":"","reading":"","meaning":"","explanation":"","examples":[]}. ' +
  'Nếu câu đúng để corrected rỗng.';

export interface SentenceFeedback {
  corrected: string;
  reading: string;
  meaning: string;
  explanation: string;
  examples: string[];
}

export async function analyzeSentence(sentence: string): Promise<SentenceFeedback> {
  const body = {
    system_instruction: { parts: [{ text: SENTENCE_SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: sentence }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

  const json = await res.json();
  const raw: string =
    json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const fenceMatch = /```(?:json)?\s*([\s\S]*?)\s*```/.exec(raw);
  const cleaned = (fenceMatch ? fenceMatch[1] : raw).trim();

  const parsed = JSON.parse(cleaned) as Partial<SentenceFeedback>;
  return {
    corrected: parsed.corrected ?? '',
    reading: parsed.reading ?? '',
    meaning: parsed.meaning ?? '',
    explanation: parsed.explanation ?? '',
    examples: parsed.examples ?? [],
  };
}

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
