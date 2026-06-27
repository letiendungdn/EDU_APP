export const DEFAULT_GOAL_MINUTES = 15;
export const DEFAULT_GOAL_SECONDS = DEFAULT_GOAL_MINUTES * 60;

const STORAGE_KEY = 'nihongo-daily-listening';

export interface ListeningStats {
  minutesToday: number;
  streak: number;
  goalMinutes: number;
}

interface StoredListeningData {
  date?: string;
  minutesToday?: number;
  streak?: number;
  lastCompletedDate?: string;
  goalMinutes?: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function loadListeningStats(): ListeningStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { minutesToday: 0, streak: 0, goalMinutes: DEFAULT_GOAL_MINUTES };
    }
    const data = JSON.parse(raw) as StoredListeningData;
    if (data.date !== todayKey()) {
      return { minutesToday: 0, streak: data.streak ?? 0, goalMinutes: DEFAULT_GOAL_MINUTES };
    }
    return {
      minutesToday: data.minutesToday ?? 0,
      streak: data.streak ?? 0,
      goalMinutes: DEFAULT_GOAL_MINUTES,
    };
  } catch {
    return { minutesToday: 0, streak: 0, goalMinutes: DEFAULT_GOAL_MINUTES };
  }
}

export function saveListeningMinutes(totalSeconds: number): StoredListeningData & {
  date: string;
  minutesToday: number;
  streak: number;
  goalMinutes: number;
} {
  const today = todayKey();
  const minutes = Math.floor(totalSeconds / 60);
  const prev = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '{}',
  ) as StoredListeningData;

  const minutesToday =
    prev.date === today ? Math.max(prev.minutesToday ?? 0, minutes) : minutes;

  let streak = prev.streak ?? 0;
  const hitGoalToday = minutesToday >= DEFAULT_GOAL_MINUTES;
  const wasGoalBefore = prev.date === today && (prev.minutesToday ?? 0) >= DEFAULT_GOAL_MINUTES;

  if (hitGoalToday && !wasGoalBefore) {
    if (prev.lastCompletedDate === yesterdayKey()) {
      streak += 1;
    } else if (prev.lastCompletedDate !== today) {
      streak = 1;
    }
  }

  const saved = {
    date: today,
    minutesToday,
    streak,
    lastCompletedDate: hitGoalToday ? today : prev.lastCompletedDate,
    goalMinutes: DEFAULT_GOAL_MINUTES,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}

export function formatListeningTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
