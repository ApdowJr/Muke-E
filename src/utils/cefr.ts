import type { SkillKey } from './progressTracker';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CEFRLevelInfo {
  level: CEFRLevel;
  band: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  description: string;
  canDo: string[];
  focus: Record<SkillKey, string>;
}

export const CEFR_LEVELS: CEFRLevelInfo[] = [
  { level:'A1', band:'Beginner', title:'Foundation', description:'Understand and use very common everyday expressions.', canDo:['Introduce yourself and ask simple questions.','Handle basic needs such as food, directions, and prices.','Understand slow, clear speech on familiar topics.'], focus:{speaking:'short everyday responses',listening:'common phrases and questions',vocabulary:'high-frequency words',grammar:'basic sentence patterns',pronunciation:'clear sounds and word stress',fluency:'short turns with less hesitation'} },
  { level:'A2', band:'Beginner', title:'Everyday', description:'Communicate in routine situations using simple connected language.', canDo:['Talk about routines, family, work, and plans.','Handle predictable travel and shopping situations.','Understand the main point of short, clear messages.'], focus:{speaking:'connected everyday answers',listening:'routine conversations',vocabulary:'common collocations',grammar:'past, future, questions and negatives',pronunciation:'clear rhythm and endings',fluency:'link two or three ideas'} },
  { level:'B1', band:'Intermediate', title:'Independent', description:'Deal with most familiar situations and explain experiences and opinions.', canDo:['Tell stories and explain reasons.','Manage travel, work, and social conversations.','Follow the main points of standard speech on familiar topics.'], focus:{speaking:'reasons, examples and stories',listening:'context and main ideas',vocabulary:'transfer across contexts',grammar:'reliable common structures',pronunciation:'connected speech',fluency:'sustained everyday conversation'} },
  { level:'B2', band:'Intermediate', title:'Confident', description:'Interact with native speakers with enough fluency for regular conversation.', canDo:['Defend an opinion and compare alternatives.','Participate in work, study, and social discussions.','Understand extended speech and most media on familiar topics.'], focus:{speaking:'argument and nuance',listening:'detail and implied meaning',vocabulary:'precision and register',grammar:'complex structures under pressure',pronunciation:'natural rhythm',fluency:'spontaneous interaction'} },
  { level:'C1', band:'Advanced', title:'Fluent', description:'Use language flexibly and effectively for social, academic, and professional purposes.', canDo:['Express ideas precisely with flexible structure.','Adapt tone and register to the audience.','Follow demanding speech and identify attitude or implication.'], focus:{speaking:'nuanced positions',listening:'inference and intent',vocabulary:'idiomatic precision',grammar:'flexible complex control',pronunciation:'natural prosody',fluency:'fast, flexible conversation'} },
  { level:'C2', band:'Advanced', title:'Mastery', description:'Express yourself spontaneously, precisely, and with fine control of meaning.', canDo:['Handle subtle distinctions, humour, and implied meaning.','Reformulate effortlessly when circumstances change.','Understand virtually everything heard at natural speed.'], focus:{speaking:'subtle and precise expression',listening:'fine-grained inference',vocabulary:'idiom, nuance and register',grammar:'near-effortless control',pronunciation:'natural intelligibility',fluency:'effortless spontaneous speech'} },
];

export function getCEFRInfo(level: CEFRLevel): CEFRLevelInfo {
  return CEFR_LEVELS.find(item => item.level === level) ?? CEFR_LEVELS[0];
}

export function bandForCEFR(level: CEFRLevel): 'Beginner' | 'Intermediate' | 'Advanced' {
  return getCEFRInfo(level).band;
}

export function nextCEFRLevel(level: CEFRLevel): CEFRLevel | null {
  const index = CEFR_LEVELS.findIndex(item => item.level === level);
  return CEFR_LEVELS[index + 1]?.level ?? null;
}
