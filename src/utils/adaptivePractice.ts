import { SkillLevel } from '../types';
import { getStoredProgress, SkillKey } from './progressTracker';
import { getLearnerWeaknesses, LearnerWeakness } from './learnerMemory';

export type AdaptiveMode = 'simplify' | 'reinforce' | 'challenge' | 'steady';

export interface AdaptivePracticeContext {
  mode: AdaptiveMode;
  difficultyDelta: -1 | 0 | 1;
  weakestSkill: SkillKey;
  weakestSkillScore: number;
  repeatedWeakness: string;
  repeatedWeaknessCount: number;
  recentPerformance: 'struggling' | 'developing' | 'strong';
  sessionSuccesses: number;
  guidance: string;
}

const SKILLS: SkillKey[] = ['speaking', 'listening', 'vocabulary', 'grammar', 'pronunciation', 'fluency'];

function weakestSkill(skills: ReturnType<typeof getStoredProgress>['skills']): SkillKey {
  return [...SKILLS].sort((a, b) => {
    const scoreA = skills[a].practiceCount === 0 ? 50 : skills[a].score;
    const scoreB = skills[b].practiceCount === 0 ? 50 : skills[b].score;
    return scoreA - scoreB || skills[a].practiceCount - skills[b].practiceCount;
  })[0];
}

function strongestWeakness(weaknesses: LearnerWeakness[]): LearnerWeakness | null {
  return [...weaknesses].sort((a, b) => b.count - a.count || b.lastSeen - a.lastSeen)[0] || null;
}

export function getAdaptivePracticeContext(
  level: SkillLevel,
  sessionSuccesses = 0,
): AdaptivePracticeContext {
  const progress = getStoredProgress();
  const weaknesses = getLearnerWeaknesses();
  const skill = weakestSkill(progress.skills);
  const skillState = progress.skills[skill];
  const weakness = strongestWeakness(weaknesses);

  const practicedScores = SKILLS
    .map((key) => progress.skills[key])
    .filter((item) => item.practiceCount > 0)
    .map((item) => item.score);

  const baseline = practicedScores.length > 0
    ? Math.round(practicedScores.reduce((sum, score) => sum + score, 0) / practicedScores.length)
    : 0;

  const recentPerformance: AdaptivePracticeContext['recentPerformance'] =
    sessionSuccesses >= 2 || baseline >= 85
      ? 'strong'
      : sessionSuccesses === 0 && baseline > 0 && baseline < 65
        ? 'struggling'
        : 'developing';

  const repeatedWeakness = weakness && weakness.count >= 2
    ? weakness.correction
    : '';

  let mode: AdaptiveMode = 'steady';
  let difficultyDelta: -1 | 0 | 1 = 0;

  if (recentPerformance === 'struggling') {
    mode = 'simplify';
    difficultyDelta = -1;
  } else if (recentPerformance === 'strong' || sessionSuccesses >= 2) {
    mode = 'challenge';
    difficultyDelta = 1;
  } else if (repeatedWeakness) {
    mode = 'reinforce';
    difficultyDelta = 0;
  }

  const levelHint =
    level === 'Beginner'
      ? 'Keep output short and concrete.'
      : level === 'Intermediate'
        ? 'Use natural variation without unnecessary complexity.'
        : 'Use nuanced, realistic language while staying context-appropriate.';

  const modeHint =
    mode === 'simplify'
      ? 'Simplify the next task and isolate one skill.'
      : mode === 'reinforce'
        ? 'Reinforce the repeated weakness with a different example.'
        : mode === 'challenge'
          ? 'Increase challenge only slightly and require transfer to a new context.'
          : 'Maintain the current difficulty and keep the learner producing language.';

  return {
    mode,
    difficultyDelta,
    weakestSkill: skill,
    weakestSkillScore: skillState.practiceCount > 0 ? skillState.score : 0,
    repeatedWeakness,
    repeatedWeaknessCount: weakness?.count || 0,
    recentPerformance,
    sessionSuccesses,
    guidance: [levelHint, modeHint].join(' '),
  };
}

export interface AdaptiveScenarioRecommendation {
  scenarioId: string;
  reason: string;
}

const SCENARIO_BY_SKILL: Record<SkillKey, string> = {
  speaking: 'general',
  listening: 'travel',
  vocabulary: 'shopping',
  grammar: 'interview',
  pronunciation: 'coffee',
  fluency: 'travel',
};

export function getRecommendedScenario(
  context: Pick<AdaptivePracticeContext, 'weakestSkill' | 'mode' | 'recentPerformance'>,
): AdaptiveScenarioRecommendation {
  if (context.mode === 'challenge') {
    return {
      scenarioId: context.weakestSkill === 'vocabulary' ? 'shopping' : 'interview',
      reason: 'Your recent practice is strong, so the next task should require a little more real-world transfer.',
    };
  }

  if (context.mode === 'simplify') {
    return {
      scenarioId: 'general',
      reason: 'Your recent performance suggests a simpler conversation will help rebuild confidence before adding pressure.',
    };
  }

  return {
    scenarioId: SCENARIO_BY_SKILL[context.weakestSkill],
    reason: context.mode === 'reinforce'
      ? 'This scenario gives you a fresh context for the weakness you have repeated most often.'
      : 'This scenario gives your weakest practiced skill a useful real-world context.',
  };
}
