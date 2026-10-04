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


import type { CEFRLevel } from './cefr';

const CEFR_BAND_SKILL_TASKS: Record<CEFRLevel, Record<SkillKey, { objective: string; task: string; successSignal: string }>> = {
  A1: {
    speaking: { objective: 'Build clear everyday responses.', task: 'Answer a familiar question in one simple sentence.', successSignal: 'One understandable idea is communicated.' },
    listening: { objective: 'Catch familiar words and simple questions.', task: 'Listen for the main meaning and answer briefly.', successSignal: 'The learner identifies the main intent.' },
    vocabulary: { objective: 'Use essential everyday words.', task: 'Reuse one target word in a new simple sentence.', successSignal: 'The word is used with the intended meaning.' },
    grammar: { objective: 'Control basic sentence patterns.', task: 'Produce a sentence with the target pattern.', successSignal: 'The core pattern is understandable.' },
    pronunciation: { objective: 'Make familiar words understandable.', task: 'Repeat a short phrase slowly and clearly.', successSignal: 'Most target words are recognizable.' },
    fluency: { objective: 'Keep simple speech moving.', task: 'Give a short answer without abandoning the message.', successSignal: 'The learner completes the response.' },
  },
  A2: {
    speaking: { objective: 'Handle routine everyday exchanges.', task: 'Answer and add one useful detail.', successSignal: 'The learner completes a practical exchange.' },
    listening: { objective: 'Follow short routine conversations.', task: 'Answer a follow-up based on what was heard.', successSignal: 'The learner tracks the main context.' },
    vocabulary: { objective: 'Expand practical everyday vocabulary.', task: 'Use a target expression in a familiar situation.', successSignal: 'Meaning and basic collocation are appropriate.' },
    grammar: { objective: 'Use common structures with more control.', task: 'Reformulate a sentence using the target structure.', successSignal: 'The structure stays understandable after reformulation.' },
    pronunciation: { objective: 'Improve clarity and rhythm.', task: 'Repeat a short natural phrase at a comfortable pace.', successSignal: 'Speech remains intelligible and reasonably natural.' },
    fluency: { objective: 'Connect short ideas.', task: 'Explain a familiar choice using because, but, or so.', successSignal: 'Ideas connect without long breakdowns.' },
  },
  B1: {
    speaking: { objective: 'Express opinions and experiences independently.', task: 'Answer, give a reason, and add an example.', successSignal: 'The learner develops a connected answer.' },
    listening: { objective: 'Follow everyday natural conversation.', task: 'Respond to a follow-up that depends on context.', successSignal: 'The learner understands more than isolated keywords.' },
    vocabulary: { objective: 'Transfer useful vocabulary between contexts.', task: 'Use a target expression in a new realistic situation.', successSignal: 'The expression remains natural and meaningful.' },
    grammar: { objective: 'Control common structures while speaking.', task: 'Reformulate an idea while preserving its meaning.', successSignal: 'Accuracy survives a small change in form.' },
    pronunciation: { objective: 'Improve connected speech.', task: 'Shadow a natural sentence and preserve its rhythm.', successSignal: 'Stress and word boundaries stay clear.' },
    fluency: { objective: 'Sustain connected conversation.', task: 'Explain a choice and respond to a follow-up.', successSignal: 'The learner maintains the thread of the conversation.' },
  },
  B2: {
    speaking: { objective: 'Handle detailed real-world discussion.', task: 'State a position, support it, and address a counterpoint.', successSignal: 'Ideas are developed with appropriate detail.' },
    listening: { objective: 'Follow natural speech and implied meaning.', task: 'Summarize the speaker’s point and implication.', successSignal: 'The learner captures context and intent.' },
    vocabulary: { objective: 'Choose precise language across contexts.', task: 'Paraphrase an idea for a different audience.', successSignal: 'Word choice is precise and context-appropriate.' },
    grammar: { objective: 'Control complex structures reliably.', task: 'Reformulate a nuanced idea using a different structure.', successSignal: 'Complexity does not damage clarity.' },
    pronunciation: { objective: 'Refine natural rhythm and emphasis.', task: 'Shadow a realistic sentence at conversational pace.', successSignal: 'Speech stays clear under natural speed.' },
    fluency: { objective: 'Respond flexibly under conversational pressure.', task: 'Compare options and defend a nuanced preference.', successSignal: 'The learner adapts without long breakdowns.' },
  },
  C1: {
    speaking: { objective: 'Express nuanced ideas with precision.', task: 'Qualify a position and respond spontaneously to a challenge.', successSignal: 'Meaning, tone, and nuance remain controlled.' },
    listening: { objective: 'Infer attitude, intent, and unstated meaning.', task: 'Explain both the explicit point and implied stance.', successSignal: 'The learner interprets nuance rather than keywords alone.' },
    vocabulary: { objective: 'Use precise, idiomatic language naturally.', task: 'Reframe the same idea for a formal and informal audience.', successSignal: 'Register and word choice fit the context.' },
    grammar: { objective: 'Maintain advanced grammatical control.', task: 'Recast a complex idea without losing meaning or tone.', successSignal: 'Complex structures remain accurate and natural.' },
    pronunciation: { objective: 'Refine prosody and conversational delivery.', task: 'Shadow nuanced speech and reproduce its emphasis.', successSignal: 'Prosody supports meaning and sounds natural.' },
    fluency: { objective: 'Sustain spontaneous, nuanced interaction.', task: 'Handle an unexpected follow-up while maintaining the argument.', successSignal: 'The learner adapts smoothly and precisely.' },
  },
  C2: {
    speaking: { objective: 'Communicate with near-complete flexibility.', task: 'Defend a nuanced position, qualify it, and adapt register on demand.', successSignal: 'The learner controls precision, nuance, and register.' },
    listening: { objective: 'Interpret subtle meaning across demanding speech.', task: 'Identify explicit meaning, implication, tone, and rhetorical intent.', successSignal: 'Subtle distinctions are accurately understood.' },
    vocabulary: { objective: 'Control idiomatic and domain-sensitive language.', task: 'Express the same complex idea with deliberate register changes.', successSignal: 'Vocabulary is exact, flexible, and context-sensitive.' },
    grammar: { objective: 'Use complex grammar with effortless control.', task: 'Recast dense content while preserving nuance and emphasis.', successSignal: 'Form, meaning, and style remain controlled.' },
    pronunciation: { objective: 'Polish natural prosody and expressive delivery.', task: 'Shadow demanding speech while preserving emphasis and phrasing.', successSignal: 'Delivery is consistently clear, natural, and expressive.' },
    fluency: { objective: 'Sustain effortless spontaneous interaction.', task: 'Navigate an unexpected challenge without losing coherence.', successSignal: 'Speech remains flexible and precise under pressure.' },
  },
};

export function getCEFRCurriculumFocus(level: CEFRLevel, skill: SkillKey): CurriculumFocus {
  const item = CEFR_BAND_SKILL_TASKS[level][skill];
  return { level: level === 'A1' || level === 'A2' ? 'Beginner' : level === 'B1' || level === 'B2' ? 'Intermediate' : 'Advanced', skill, ...item };
}
