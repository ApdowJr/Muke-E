import type { AdaptiveTaskType } from './adaptivePractice';

export type MasteryOutcome = 'success' | 'partial' | 'fail';

export interface MasteryRecord {
  attempts: number;
  successes: number;
  partials: number;
  consecutiveSuccesses: number;
  lastOutcome: MasteryOutcome | null;
  lastPracticedAt: string | null;
}

const STORAGE_KEY = 'moke_e_adaptive_mastery_v1';

const EMPTY_RECORD: MasteryRecord = {
  attempts: 0,
  successes: 0,
  partials: 0,
  consecutiveSuccesses: 0,
  lastOutcome: null,
  lastPracticedAt: null,
};

function isMasteryOutcome(value: unknown): value is MasteryOutcome {
  return value === 'success' || value === 'partial' || value === 'fail';
}

function normalizeRecord(value: unknown): MasteryRecord {
  if (!value || typeof value !== 'object') return { ...EMPTY_RECORD };
  const record = value as Partial<MasteryRecord>;
  return {
    attempts: Number.isFinite(record.attempts) && record.attempts >= 0 ? Math.floor(record.attempts) : 0,
    successes: Number.isFinite(record.successes) && record.successes >= 0 ? Math.floor(record.successes) : 0,
    partials: Number.isFinite(record.partials) && record.partials >= 0 ? Math.floor(record.partials) : 0,
    consecutiveSuccesses:
      Number.isFinite(record.consecutiveSuccesses) && record.consecutiveSuccesses >= 0
        ? Math.floor(record.consecutiveSuccesses)
        : 0,
    lastOutcome: isMasteryOutcome(record.lastOutcome) ? record.lastOutcome : null,
    lastPracticedAt: typeof record.lastPracticedAt === 'string' ? record.lastPracticedAt : null,
  };
}

function read(): Record<string, MasteryRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const normalized: Record<string, MasteryRecord> = {};
    for (const [key, value] of Object.entries(parsed)) {
      normalized[key] = normalizeRecord(value);
    }
    return normalized;
  } catch (e) {
    return {};
  }
}

function keyFor(skill: string, taskType: AdaptiveTaskType): string {
  return (skill || 'speaking').trim().toLowerCase() + ':' + taskType;
}

export function recordAdaptiveTaskOutcome(
  skill: string,
  taskType: AdaptiveTaskType,
  outcome: MasteryOutcome,
): MasteryRecord {
  const records = read();
  const key = keyFor(skill, taskType);
  const previous = records[key] || { ...EMPTY_RECORD };

  const next: MasteryRecord = {
    attempts: previous.attempts + 1,
    successes: previous.successes + (outcome === 'success' ? 1 : 0),
    partials: previous.partials + (outcome === 'partial' ? 1 : 0),
    consecutiveSuccesses: outcome === 'success' ? previous.consecutiveSuccesses + 1 : 0,
    lastOutcome: outcome,
    lastPracticedAt: new Date().toISOString(),
  };

  records[key] = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {}
  return next;
}

export function getAdaptiveMastery(skill: string, taskType: AdaptiveTaskType): MasteryRecord {
  return read()[keyFor(skill, taskType)] || { ...EMPTY_RECORD };
}

export function getMasteryGuidance(skill: string, taskType: AdaptiveTaskType): string {
  const mastery = getAdaptiveMastery(skill, taskType);
  if (mastery.consecutiveSuccesses >= 3 && mastery.attempts >= 4) {
    return 'Learner has demonstrated repeated successful transfer. Increase challenge slightly or move to a new context.';
  }
  if (mastery.attempts >= 2 && mastery.successes === 0) {
    return 'Learner has not yet demonstrated successful transfer. Simplify and teach the pattern before increasing difficulty.';
  }
  if (mastery.partials > 0 && mastery.successes === 0) {
    return 'Learner is developing this skill. Keep the same target but vary the example and give one concrete cue.';
  }
  return 'Mastery evidence is still limited. Do not claim mastery from a single successful response.';
}
