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
  count: number;
  lastSeen: number;
}

const STORAGE_KEY = 'moke_e_learner_memory_v1';

export function getLearnerWeaknesses(): LearnerWeakness[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
    existing.lastSeen = Date.now();
  } else {
    current.unshift({
      phrase: correction.detected.trim(),
      correction: correction.natural.trim(),
      focusArea: correction.focusArea || 'Natural language',
      count: 1,
      lastSeen: Date.now(),
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
