import type { ReviewCard, SrsCard } from '../domain/entities';

export function calculateNextReview(card: SrsCard, quality: number): SrsCard {
  const q = Math.min(5, Math.max(0, quality));
  let ease = card.easeFactor;
  let interval = card.interval;
  let reps = card.repetitions;

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.min(3650, Math.max(1, Math.round(interval * ease)));
    reps += 1;
  }

  ease += 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  if (ease < 1.3) ease = 1.3;

  const nextReviewAt = Date.now() + interval * 86_400_000;
  const mastered = reps >= 5 && interval >= 21;

  return {
    ...card,
    easeFactor: ease,
    interval,
    repetitions: reps,
    nextReviewAt,
    mastered,
    syncStatus: 'pending',
    updatedAt: Date.now(),
  };
}

export type { ReviewCard };
