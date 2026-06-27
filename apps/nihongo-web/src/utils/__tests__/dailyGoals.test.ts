import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveGoalsForDate,
  toggleGoalLocal,
  countDone,
  goalProgressLabel,
  type DailyGoalItem,
} from '../dailyGoals';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('dailyGoals', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('resolveGoalsForDate returns default items for new date', () => {
    const items = resolveGoalsForDate('2099-01-01');
    expect(items.length).toBeGreaterThanOrEqual(4);
    expect(items.some((g) => g.kind === 'listening')).toBe(true);
    expect(items.some((g) => g.kind === 'vocab')).toBe(true);
  });

  it('toggleGoalLocal toggles custom goals', () => {
    const date = '2099-06-01';
    const items = resolveGoalsForDate(date);
    const custom: DailyGoalItem = {
      id: 'custom-test',
      kind: 'custom',
      label: 'Đọc sách',
      done: false,
    };
    localStorageMock.setItem(
      'nihongo-daily-goals',
      JSON.stringify({ [date]: { items: [...items, custom], updatedAt: new Date().toISOString() } }),
    );

    const toggled = toggleGoalLocal(date, 'custom-test');
    const goal = toggled.find((g) => g.id === 'custom-test');
    expect(goal?.done).toBe(true);
  });

  it('countDone counts completed goals', () => {
    const items: DailyGoalItem[] = [
      { id: 'a', kind: 'custom', label: 'A', done: true },
      { id: 'b', kind: 'custom', label: 'B', done: false },
    ];
    expect(countDone(items)).toEqual({ done: 1, total: 2 });
  });

  it('goalProgressLabel returns null for grammar goals', () => {
    const item: DailyGoalItem = { id: 'g', kind: 'grammar', label: 'Grammar', done: false };
    expect(goalProgressLabel(item)).toBeNull();
  });
});
