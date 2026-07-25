import { describe, expect, it } from 'vitest';
import { calculateNextReview } from './srs';
import type { SrsCard } from '../domain/entities';

function card(overrides: Partial<SrsCard> = {}): SrsCard {
  return {
    id: 1,
    vocabularyId: 10,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewAt: Date.now(),
    mastered: false,
    syncStatus: 'synced',
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('calculateNextReview (SM-2)', () => {
  it('clamps quality below 0 as again', () => {
    const next = calculateNextReview(card({ repetitions: 3, interval: 10 }), -2);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.syncStatus).toBe('pending');
  });

  it('resets on quality < 3', () => {
    const next = calculateNextReview(
      card({ repetitions: 4, interval: 15, easeFactor: 2.5 }),
      2,
    );
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
    expect(next.mastered).toBe(false);
  });

  it('first success → interval 1', () => {
    const next = calculateNextReview(card(), 4);
    expect(next.repetitions).toBe(1);
    expect(next.interval).toBe(1);
  });

  it('second success → interval 6', () => {
    const next = calculateNextReview(card({ repetitions: 1, interval: 1 }), 4);
    expect(next.repetitions).toBe(2);
    expect(next.interval).toBe(6);
  });

  it('later success multiplies interval by ease', () => {
    const next = calculateNextReview(
      card({ repetitions: 2, interval: 6, easeFactor: 2.5 }),
      4,
    );
    expect(next.repetitions).toBe(3);
    expect(next.interval).toBe(15);
  });

  it('keeps easeFactor >= 1.3', () => {
    const next = calculateNextReview(card({ easeFactor: 1.3 }), 0);
    expect(next.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('marks mastered when reps >= 5 and interval >= 21', () => {
    const next = calculateNextReview(
      card({ repetitions: 4, interval: 21, easeFactor: 2.5 }),
      5,
    );
    expect(next.repetitions).toBe(5);
    expect(next.interval).toBeGreaterThanOrEqual(21);
    expect(next.mastered).toBe(true);
  });

  it('sets nextReviewAt roughly interval days ahead', () => {
    const before = Date.now();
    const next = calculateNextReview(card(), 4);
    const dayMs = 86_400_000;
    expect(next.nextReviewAt).toBeGreaterThanOrEqual(before + dayMs - 5_000);
    expect(next.nextReviewAt).toBeLessThanOrEqual(Date.now() + dayMs + 5_000);
  });
});
