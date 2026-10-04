import { SkillLevel } from '../types';
import { getStoredProgress, SkillKey } from './progressTracker';
import { getLearnerWeaknesses, LearnerWeakness } from './learnerMemory';
import { getAdaptiveMastery } from './learnerMastery';

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
  sessionTurns: number;
  sessionCorrections: number;
  sessionAccuracy: number;
  taskAccuracy: number;
  masteryState: 'limited' | 'developing' | 'transfer-ready';
  masteryTaskType: AdaptiveTaskType;
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

export interface AdaptiveSessionSignals {
  focusSuccesses?: number;
  turns?: number;
  corrections?: number;
  taskSuccesses?: number;
  taskPartials?: number;
  taskAttempts?: number;
}

export function getAdaptivePracticeContext(
  level: SkillLevel,
  session: AdaptiveSessionSignals = {},
): AdaptivePracticeContext {
  const progress = getStoredProgress();
  const weaknesses = getLearnerWeaknesses();
  const sessionSuccesses = session.focusSuccesses ?? 0;
  const sessionTurns = session.turns ?? 0;
  const sessionCorrections = session.corrections ?? 0;
  const taskSuccesses = session.taskSuccesses ?? 0;
  const taskPartials = session.taskPartials ?? 0;
  const taskAttempts = session.taskAttempts ?? 0;
  const taskAccuracy = taskAttempts > 0
    ? Math.round(((taskSuccesses + taskPartials * 0.5) / taskAttempts) * 100)
    : 0;
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

  const sessionAccuracy = sessionTurns > 0
    ? Math.max(0, Math.round(((sessionTurns - sessionCorrections) / sessionTurns) * 100))
    : 0;

  const recentPerformance: AdaptivePracticeContext['recentPerformance'] =
    (taskAttempts >= 2 && taskAccuracy < 50) || (sessionTurns >= 3 && sessionAccuracy < 55)
      ? 'struggling'
      : (taskAttempts >= 2 && taskAccuracy >= 85) || sessionSuccesses >= 2 || (sessionTurns >= 3 && sessionAccuracy >= 85) || baseline >= 85
        ? 'strong'
        : sessionSuccesses === 0 && baseline > 0 && baseline < 65
          ? 'struggling'
          : 'developing';

  const masteryTaskTypes: AdaptiveTaskType[] = ['guided', 'transfer', 'challenge', 'conversation'];
  const mastery = masteryTaskTypes
    .map((taskType) => ({ taskType, record: getAdaptiveMastery(skill, taskType) }))
    .sort((a, b) => b.record.consecutiveSuccesses - a.record.consecutiveSuccesses || b.record.successes - a.record.successes)[0];
  const masteryState: AdaptivePracticeContext['masteryState'] =
    mastery.record.consecutiveSuccesses >= 3 && mastery.record.attempts >= 4
      ? 'transfer-ready'
      : mastery.record.attempts >= 2 && (mastery.record.successes > 0 || mastery.record.partials > 0)
        ? 'developing'
        : 'limited';

  const repeatedWeakness = weakness && weakness.count >= 2
    ? weakness.correction
    : '';

  let mode: AdaptiveMode = 'steady';
  let difficultyDelta: -1 | 0 | 1 = 0;

  if (recentPerformance === 'struggling') {
    mode = 'simplify';
    difficultyDelta = -1;
  } else if (masteryState === 'transfer-ready' || recentPerformance === 'strong' || sessionSuccesses >= 2) {
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
    sessionTurns,
    sessionCorrections,
    sessionAccuracy,
    taskAccuracy,
    masteryState,
    masteryTaskType: mastery.taskType,
    guidance: [levelHint, modeHint, masteryState === 'transfer-ready' ? 'Use a new context because repeated transfer evidence is available.' : ''].filter(Boolean).join(' '),
  };
}

export type AdaptiveTaskType = 'guided' | 'transfer' | 'challenge' | 'conversation';

export interface AdaptiveNextTask {
  type: AdaptiveTaskType;
  intent: string;
  instruction: string;
}

export function getAdaptiveNextTask(
  context: Pick<
    AdaptivePracticeContext,
    'mode' | 'weakestSkill' | 'repeatedWeakness' | 'recentPerformance' | 'masteryState' | 'masteryTaskType'
  >,
  level: SkillLevel,
): AdaptiveNextTask {
  if (context.mode === 'simplify') {
    return {
      type: 'guided',
      intent: 'Use a short, concrete sentence about the current scenario.',
      instruction: level === 'Beginner'
        ? 'Ask for one short sentence using familiar words and one clear idea.'
        : 'Ask for one simple sentence, then one small detail if the learner succeeds.',
    };
  }

  if (context.mode === 'reinforce' && context.repeatedWeakness) {
    return {
      type: 'transfer',
      intent: 'Practice the repeated weakness in a different context.',
      instruction: 'Require a new sentence that applies this pattern naturally: ' + context.repeatedWeakness,
    };
  }

  if (context.masteryState === 'developing' && (context.masteryTaskType === 'guided' || context.masteryTaskType === 'conversation')) {
    return {
      type: 'transfer',
      intent: 'Move a developing skill from guided practice into a fresh context.',
      instruction: 'Ask for a new sentence that uses the same skill without repeating the previous example.',
    };
  }

  if (context.mode === 'challenge' || context.masteryState === 'transfer-ready' || context.recentPerformance === 'strong') {
    return {
      type: 'challenge',
      intent: 'Transfer the skill with a slightly more demanding response.',
      instruction: level === 'Advanced'
        ? 'Ask for a nuanced reason, comparison, reformulation, or realistic follow-up.'
        : 'Ask for a reason, comparison, past/future detail, or a different phrasing.',
    };
  }

  return {
    type: 'conversation',
    intent: 'Keep producing language while practicing ' + context.weakestSkill + '.',
    instruction: 'Ask one natural follow-up question that makes the learner produce a useful target-language response.',
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
  context: Pick<AdaptivePracticeContext, 'weakestSkill' | 'mode' | 'recentPerformance' | 'masteryState'>,
): AdaptiveScenarioRecommendation {
  if (context.mode === 'challenge' || context.masteryState === 'transfer-ready') {
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
