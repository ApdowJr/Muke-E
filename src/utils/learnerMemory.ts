import { getNextReview, type ReviewSchedule } from './spacedRepetition';

export interface LearnerCorrection {
  detected: string;
  natural: string;
  explanation: string;
  focusArea: string;
  practicePrompt: string;
}

export interface LearnerWeakness {
  phrase: string;
  correction: string;
  focusArea: string;
  practicePrompt: string;
  count: number;
  lastSeen: number;
  review: ReviewSchedule;
}

const STORAGE_KEY = 'moke_e_learner_memory_v1';

export function getLearnerWeaknesses(): LearnerWeakness[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      review: item?.review && typeof item.review === 'object'
        ? item.review
        : getNextReview(0, 0),
    })).filter((item) => typeof item?.phrase === 'string' && typeof item?.correction === 'string');
  } catch {
    return [];
  }
}

export function rememberCorrection(correction: LearnerCorrection): LearnerWeakness[] {
  if (!correction?.detected || !correction?.natural) return getLearnerWeaknesses();

  const current = getLearnerWeaknesses();
  const key = correction.detected.trim().toLowerCase();
  const existing = current.find((item) => item.phrase.trim().toLowerCase() === key);

  if (existing) {
    existing.count += 1;
    existing.correction = correction.natural;
    existing.focusArea = correction.focusArea;
    existing.practicePrompt = correction.practicePrompt || `Practice this naturally: ${correction.natural}`;
    existing.lastSeen = Date.now();
    existing.review = getNextReview(existing.review?.repetitions ?? 0, existing.review?.intervalDays ?? 0, true);
  } else {
    current.unshift({
      phrase: correction.detected.trim(),
      correction: correction.natural.trim(),
      focusArea: correction.focusArea || 'Natural language',
      practicePrompt: correction.practicePrompt || `Practice this naturally: ${correction.natural.trim()}`,
      count: 1,
      lastSeen: Date.now(),
      review: getNextReview(0, 0),
    });
  }

  const next = current
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 12);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function clearLearnerMemory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}


export function getLearningFocus(): LearnerWeakness | null {
  const weaknesses = getLearnerWeaknesses();
  if (weaknesses.length === 0) return null;
  return [...weaknesses].sort((a, b) => b.count - a.count || b.lastSeen - a.lastSeen)[0];
}
