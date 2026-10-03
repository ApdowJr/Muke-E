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
}

const STORAGE_KEY = 'moke_e_progress_v2';

export function getStoredProgress(): ProgressSummary {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  // Generate realistic initial week history leading up to today
  const daysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysSo = ['Isnin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimce', 'Sabti', 'Axad'];
  const todayIdx = new Date().getDay(); // 0 is Sunday
  // Reorder so today is at the end
  const weeklyData: DailyProgressPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayOfWeek = (d.getDay() + 6) % 7; // 0 is Mon, 6 is Sun
    const count = i === 0 ? 5 : Math.max(1, (i * 3 + 2) % 11);
    const accuracy = 75 + Math.min(23, (7 - i) * 3);
    weeklyData.push({
      day: daysEn[dayOfWeek],
      daySo: daysSo[dayOfWeek],
      practiceCount: count,
      accuracy,
    });
  }

  const defaultProgress: ProgressSummary = {
    totalCount: 38,
    streakDays: 4,
    bestStreak: 7,
    averageScore: 89,
    totalPhrases: 26,
    weeklyData,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
  } catch (e) {}

  return defaultProgress;
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
    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  }

  localStorage.setItem('moke_e_last_date', todayDateStr);

  const updatedTotal = current.totalCount + 1;
  const updatedPhrases = current.totalPhrases + 1;
  const updatedBest = Math.max(current.bestStreak, streak);

  let updatedAvg = current.averageScore;
  if (newScore && newScore > 0) {
    updatedAvg = Math.round((current.averageScore * 4 + newScore) / 5);
  }

  // Update today's entry in weeklyData
  const weekly = [...current.weeklyData];
  if (weekly.length > 0) {
    const lastDay = weekly[weekly.length - 1];
    lastDay.practiceCount += 1;
    if (newScore) {
      lastDay.accuracy = Math.round((lastDay.accuracy + newScore) / 2);
    }
  }

  const newSummary: ProgressSummary = {
    totalCount: updatedTotal,
    streakDays: streak,
    bestStreak: updatedBest,
    averageScore: updatedAvg,
    totalPhrases: updatedPhrases,
    weeklyData: weekly,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSummary));
  } catch (e) {}

  return newSummary;
}
