export interface ReviewSchedule {
  repetitions: number;
  intervalDays: number;
  dueAt: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function getNextReview(
  repetitions: number,
  intervalDays: number,
  reset = false,
): ReviewSchedule {
  const safeRepetitions = reset ? 0 : Math.max(0, Math.floor(repetitions));
  const safeInterval = reset ? 0 : Math.max(0, Math.floor(intervalDays));

  const nextRepetitions = safeRepetitions + 1;
  const intervals = [1, 2, 4, 7, 14, 30];
  const nextInterval = intervals[Math.min(nextRepetitions - 1, intervals.length - 1)] ?? Math.max(30, safeInterval * 2);

  return {
    repetitions: nextRepetitions,
    intervalDays: Math.max(1, nextInterval),
    dueAt: Date.now() + Math.max(1, nextInterval) * DAY_MS,
  };
}

export function isReviewDue(review?: Partial<ReviewSchedule> | null, now = Date.now()): boolean {
  return !review || !Number.isFinite(review.dueAt) || Number(review.dueAt) <= now;
}

export function getReviewLabel(review?: Partial<ReviewSchedule> | null, now = Date.now()): 'due' | 'scheduled' {
  return isReviewDue(review, now) ? 'due' : 'scheduled';
}
