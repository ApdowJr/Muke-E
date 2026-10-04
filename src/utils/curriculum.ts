import type { SkillLevel } from '../types';
import type { SkillKey } from './progressTracker';

export interface CurriculumFocus {
  level: SkillLevel;
  skill: SkillKey;
  objective: string;
  task: string;
  successSignal: string;
}

const OBJECTIVES: Record<SkillLevel, Record<SkillKey, CurriculumFocus>> = {
  Beginner: {
    speaking: { level: 'Beginner', skill: 'speaking', objective: 'Build short everyday responses.', task: 'Answer with one clear sentence about a familiar situation.', successSignal: 'The learner communicates one idea clearly.' },
    listening: { level: 'Beginner', skill: 'listening', objective: 'Understand common questions and phrases.', task: 'Identify the main meaning and answer with a short response.', successSignal: 'The learner responds to the main idea without guessing wildly.' },
    vocabulary: { level: 'Beginner', skill: 'vocabulary', objective: 'Use high-frequency words in context.', task: 'Reuse one target word in a new sentence.', successSignal: 'The target word is used with the correct meaning.' },
    grammar: { level: 'Beginner', skill: 'grammar', objective: 'Build reliable basic sentence patterns.', task: 'Produce one sentence using the target pattern.', successSignal: 'Word order and the core pattern are understandable.' },
    pronunciation: { level: 'Beginner', skill: 'pronunciation', objective: 'Improve clarity of common words.', task: 'Repeat a short phrase slowly and clearly.', successSignal: 'Most target words are recognizable.' },
    fluency: { level: 'Beginner', skill: 'fluency', objective: 'Reduce hesitation in familiar topics.', task: 'Give one short answer without switching languages.', successSignal: 'The learner keeps the response moving.' },
  },
  Intermediate: {
    speaking: { level: 'Intermediate', skill: 'speaking', objective: 'Extend answers with useful detail.', task: 'Answer, then add a reason or example.', successSignal: 'The learner connects ideas naturally.' },
    listening: { level: 'Intermediate', skill: 'listening', objective: 'Follow natural conversational meaning.', task: 'Respond to a follow-up that depends on what was said.', successSignal: 'The learner tracks context rather than isolated words.' },
    vocabulary: { level: 'Intermediate', skill: 'vocabulary', objective: 'Transfer useful vocabulary across contexts.', task: 'Use the target expression in a different situation.', successSignal: 'Meaning and collocation remain natural.' },
    grammar: { level: 'Intermediate', skill: 'grammar', objective: 'Control common structures while speaking.', task: 'Reformulate a sentence using the target structure.', successSignal: 'The structure remains accurate under a small change.' },
    pronunciation: { level: 'Intermediate', skill: 'pronunciation', objective: 'Improve rhythm and connected speech.', task: 'Repeat a natural phrase at conversational pace.', successSignal: 'Stress and word boundaries remain understandable.' },
    fluency: { level: 'Intermediate', skill: 'fluency', objective: 'Speak in connected ideas with fewer pauses.', task: 'Give a short explanation with a connector such as because, but, or so.', successSignal: 'The learner sustains a connected response.' },
  },
  Advanced: {
    speaking: { level: 'Advanced', skill: 'speaking', objective: 'Handle nuanced real-world conversation.', task: 'Give a position, qualify it, and respond to a follow-up.', successSignal: 'The learner adapts language to nuance and context.' },
    listening: { level: 'Advanced', skill: 'listening', objective: 'Infer meaning and intent from natural speech.', task: 'Explain the speaker’s main point and implied intent.', successSignal: 'The learner captures meaning beyond keywords.' },
    vocabulary: { level: 'Advanced', skill: 'vocabulary', objective: 'Use precise and idiomatic language appropriately.', task: 'Rephrase the same idea for a different audience or context.', successSignal: 'Word choice is precise without sounding forced.' },
    grammar: { level: 'Advanced', skill: 'grammar', objective: 'Control complex structures under pressure.', task: 'Reformulate an idea using a more nuanced structure.', successSignal: 'Complexity does not break clarity or accuracy.' },
    pronunciation: { level: 'Advanced', skill: 'pronunciation', objective: 'Refine natural rhythm, stress, and clarity.', task: 'Shadow a short natural sentence and preserve its rhythm.', successSignal: 'The sentence remains clear at natural speed.' },
    fluency: { level: 'Advanced', skill: 'fluency', objective: 'Sustain spontaneous, flexible conversation.', task: 'Compare two options and defend a nuanced preference.', successSignal: 'The learner responds flexibly without long breakdowns.' },
  },
};

export function getCurriculumFocus(level: SkillLevel, skill: SkillKey): CurriculumFocus {
  return OBJECTIVES[level][skill];
}
