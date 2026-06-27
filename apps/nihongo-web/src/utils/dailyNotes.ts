const STORAGE_KEY = 'nihongo-daily-notes';

export interface DailyNoteEntry {
  content: string;
  updatedAt: string;
}

export type DailyNotesStore = Record<string, DailyNoteEntry>;

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadAllNotes(): DailyNotesStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DailyNotesStore;
  } catch {
    return {};
  }
}

export function getNote(date: string): DailyNoteEntry | null {
  const store = loadAllNotes();
  return store[date] ?? null;
}

export function saveNoteLocal(date: string, content: string): DailyNoteEntry {
  const store = loadAllNotes();
  const entry: DailyNoteEntry = {
    content,
    updatedAt: new Date().toISOString(),
  };
  if (!content.trim()) {
    delete store[date];
  } else {
    store[date] = entry;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return entry;
}

export function listNoteDates(limit = 90): string[] {
  const store = loadAllNotes();
  return Object.keys(store)
    .filter((d) => store[d]?.content?.trim())
    .sort((a, b) => b.localeCompare(a))
    .slice(0, limit);
}

export function mergeNotesFromServer(
  local: DailyNotesStore,
  server: Array<{ date: string; content: string; updatedAt: string }>,
): DailyNotesStore {
  const merged = { ...local };
  for (const row of server) {
    const localEntry = merged[row.date];
    const serverTime = new Date(row.updatedAt).getTime();
    const localTime = localEntry ? new Date(localEntry.updatedAt).getTime() : 0;
    if (!localEntry || serverTime >= localTime) {
      merged[row.date] = {
        content: row.content,
        updatedAt: row.updatedAt,
      };
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function formatNoteDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function previewText(content: string, max = 60): string {
  const line = content.trim().split('\n')[0] ?? '';
  return line.length > max ? `${line.slice(0, max)}…` : line;
}
