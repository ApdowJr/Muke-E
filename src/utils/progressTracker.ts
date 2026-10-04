export type SkillKey = 'speaking' | 'listening' | 'vocabulary' | 'grammar' | 'pronunciation' | 'fluency';

export interface SkillProgress {
  score: number;
  practiceCount: number;
  lastPracticedAt: string | null;
}

export interface DailyProgressPoint {
  day: string;
  daySo: string;
  practiceCount: number;
  accuracy: number;
}

export interface ProgressSummary {
  totalCount: number;
  streakDays: number;
  bestStreak: number;
  averageScore: number;
  totalPhrases: number;
  weeklyData: DailyProgressPoint[];
  skills: Record<SkillKey, SkillProgress>;
}

const STORAGE_KEY = 'moke_e_progress_v3';
const LEGACY_STORAGE_KEY = 'moke_e_progress_v2';

const SKILLS: SkillKey[] = ['speaking', 'listening', 'vocabulary', 'grammar', 'pronunciation', 'fluency'];

function emptySkills(): Record<SkillKey, SkillProgress> {
  return Object.fromEntries(
    SKILLS.map((skill) => [skill, { score: 0, practiceCount: 0, lastPracticedAt: null }])
  ) as Record<SkillKey, SkillProgress>;
}

function emptyWeeklyData(): DailyProgressPoint[] {
  const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysSo = ['Isnin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimce', 'Sabti', 'Axad'];
  const weeklyData: DailyProgressPoint[] = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = (d.getDay() + 6) % 7;
    weeklyData.push({
      day: daysEn[dayOfWeek],
      daySo: daysSo[dayOfWeek],
      practiceCount: 0,
      accuracy: 0,
    });
  }

  return weeklyData;
}

function normalizeProgress(value: Partial<ProgressSummary>): ProgressSummary {
  const skills = emptySkills();
  if (value.skills) {
    for (const skill of SKILLS) {
      const saved = value.skills[skill];
      if (saved) {
        skills[skill] = {
          score: Number(saved.score) || 0,
          practiceCount: Number(saved.practiceCount) || 0,
          lastPracticedAt: saved.lastPracticedAt || null,
        };
      }
    }
  }

  return {
    totalCount: Number(value.totalCount) || 0,
    streakDays: Number(value.streakDays) || 0,
    bestStreak: Number(value.bestStreak) || 0,
    averageScore: Number(value.averageScore) || 0,
    totalPhrases: Number(value.totalPhrases) || 0,
    weeklyData: Array.isArray(value.weeklyData) && value.weeklyData.length === 7
      ? value.weeklyData.map((day) => ({
          day: day.day,
          daySo: day.daySo,
          practiceCount: Number(day.practiceCount) || 0,
          accuracy: Number(day.accuracy) || 0,
        }))
      : emptyWeeklyData(),
    skills,
  };
}

export function getStoredProgress(): ProgressSummary {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeProgress(JSON.parse(raw));

    // Migrate older locally stored progress without inventing new activity.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = normalizeProgress(JSON.parse(legacy));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch (e) {
    // Fall through to an empty, honest baseline.
  }

  return normalizeProgress({});
}

function persist(progress: ProgressSummary): ProgressSummary {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
  return progress;
}

function updateWeeklyEntry(weeklyData: DailyProgressPoint[], score?: number): DailyProgressPoint[] {
  const weekly = weeklyData.length === 7 ? weeklyData.map((item) => ({ ...item })) : emptyWeeklyData();
  const today = weekly[weekly.length - 1];
  today.practiceCount += 1;
  if (typeof score === 'number' && score > 0) {
    today.accuracy = today.accuracy === 0 ? Math.round(score) : Math.round((today.accuracy + score) / 2);
  }
  return weekly;
}

export function recordPracticeSession(newScore?: number): ProgressSummary {
  const current = getStoredProgress();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem('moke_e_last_date');

  let streak = current.streakDays;
  if (!lastDate) {
    streak = 1;
  } else if (lastDate !== todayDateStr) {
    const diffDays = Math.round(
      (new Date(todayDateStr).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    streak = diffDays === 1 ? streak + 1 : 1;
  }

  try {
    localStorage.setItem('moke_e_last_date', todayDateStr);
  } catch (e) {}

  const updatedScore = typeof newScore === 'number' && newScore > 0
    ? Math.round((current.averageScore * Math.max(1, current.totalCount) + newScore) / (Math.max(1, current.totalCount) + 1))
    : current.averageScore;

  return persist({
    ...current,
    totalCount: current.totalCount + 1,
    streakDays: streak,
    bestStreak: Math.max(current.bestStreak, streak),
    averageScore: updatedScore,
    totalPhrases: current.totalPhrases + 1,
    weeklyData: updateWeeklyEntry(current.weeklyData, newScore),
  });
}

export function recordSkillPractice(skill: SkillKey, score: number): ProgressSummary {
  const current = getStoredProgress();
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
  const previous = current.skills[skill];
  const nextCount = previous.practiceCount + 1;
  const nextScore = previous.score === 0
    ? boundedScore
    : Math.round((previous.score * previous.practiceCount + boundedScore) / nextCount);

  return persist({
    ...current,
    skills: {
      ...current.skills,
      [skill]: {
        score: nextScore,
        practiceCount: nextCount,
        lastPracticedAt: new Date().toISOString(),
      },
    },
  });
}

export function recordConversationFeedback(options: {
  corrected: boolean;
  focusArea?: string;
  focusPassed?: boolean;
}): ProgressSummary {
  const current = getStoredProgress();
  const focusPassed = options.focusPassed === true;
  const updates: Array<[SkillKey, number]> = [
    ['speaking', focusPassed ? 94 : options.corrected ? 65 : 82],
    ['fluency', focusPassed ? 92 : options.corrected ? 68 : 84],
    ['grammar', focusPassed ? 90 : options.corrected ? 58 : 86],
  ];

  if (options.focusArea?.toLowerCase().includes('vocab') || options.focusArea?.toLowerCase().includes('word')) {
    updates.push(['vocabulary', focusPassed ? 92 : options.corrected ? 62 : 84]);
  }

  let next = current;
  for (const [skill, score] of updates) {
    next = recordSkillPractice(skill, score);
  }
  return next;
}
