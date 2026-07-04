import { api } from './api';

export interface LiveSessionSummary {
  id: number;
  title: string;
  roomName: string;
  status: string;
  coach?: { id: number; name: string | null; avatarUrl: string | null };
}

export interface LiveJoinResponse {
  sessionId: number;
  token: string;
  wsUrl: string;
  roomName: string;
  title?: string;
}

export async function listLiveSessions(): Promise<LiveSessionSummary[]> {
  const res = await api.get<LiveSessionSummary[]>('/live/sessions');
  return res.data ?? [];
}

export async function createLiveSession(title: string): Promise<LiveJoinResponse> {
  const res = await api.post<LiveJoinResponse>('/live/sessions', { title });
  return res.data;
}

export async function joinLiveSession(sessionId: number): Promise<LiveJoinResponse> {
  const res = await api.post<LiveJoinResponse>(`/live/sessions/${sessionId}/join`);
  return res.data;
}

export async function endLiveSession(sessionId: number): Promise<void> {
  await api.delete(`/live/sessions/${sessionId}`);
}
