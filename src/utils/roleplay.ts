import type { CEFRLevel } from './cefr';

export type RoleplayMode = 'guided' | 'freeform' | 'challenge';

export interface RoleplayScenario {
  id: string;
  titleEn: string;
  titleSo: string;
  goalEn: string;
  goalSo: string;
  turns: number;
  mode: RoleplayMode;
  levels: CEFRLevel[];
  skills: string[];
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {id:'airport-checkin',titleEn:'Airport check-in',titleSo:'Hubinta garoonka diyaaradaha',goalEn:'Check in, handle baggage, and ask for your gate.',goalSo:'Samee check-in, boorsooyinka, oo weydii albaabka duulimaadka.',turns:6,mode:'guided',levels:['A1','A2','B1'],skills:['speaking','listening','vocabulary']},
  {id:'hotel-problem',titleEn:'Hotel problem',titleSo:'Dhib ka jira hoteelka',goalEn:'Explain a problem politely and negotiate a solution.',goalSo:'Si edeb leh u sharax dhib oo raadi xal.',turns:7,mode:'challenge',levels:['A2','B1','B2'],skills:['speaking','grammar','fluency']},
  {id:'restaurant-order',titleEn:'Restaurant order',titleSo:'Dalbashada maqaayadda',goalEn:'Order food, ask about ingredients, and change an order.',goalSo:'Dalbo cunto, weydii waxa ku jira, oo wax ka beddel dalabka.',turns:6,mode:'guided',levels:['A1','A2','B1'],skills:['vocabulary','speaking','listening']},
  {id:'job-interview',titleEn:'Job interview',titleSo:'Waraysiga shaqada',goalEn:'Introduce yourself, describe experience, and answer follow-ups.',goalSo:'Isbaro, sharax waayo-aragnimo, oo ka jawaab su’aalo daba socda.',turns:8,mode:'challenge',levels:['B1','B2','C1'],skills:['speaking','fluency','grammar']},
  {id:'doctor-visit',titleEn:'Doctor visit',titleSo:'Booqashada dhakhtarka',goalEn:'Describe symptoms, answer questions, and understand advice.',goalSo:'Sharax calaamadaha, ka jawaab su’aalo, oo faham talooyinka.',turns:7,mode:'guided',levels:['A2','B1','B2'],skills:['listening','vocabulary','speaking']},
  {id:'salary-negotiation',titleEn:'Salary negotiation',titleSo:'Gorgortanka mushaharka',goalEn:'Make a case, negotiate, and respond to objections.',goalSo:'Dood samee, gorgortan gal, oo ka jawaab diidmooyinka.',turns:8,mode:'challenge',levels:['B2','C1','C2'],skills:['fluency','speaking','vocabulary']},
  {id:'debate',titleEn:'Friendly debate',titleSo:'Dood saaxiibtinimo',goalEn:'State a position, qualify it, and challenge an idea respectfully.',goalSo:'Sheeg aragti, xaddid, oo si xushmad leh u dood.',turns:8,mode:'freeform',levels:['B2','C1','C2'],skills:['fluency','speaking','grammar']},
];

export function getRoleplaysForLevel(level: CEFRLevel): RoleplayScenario[] {
  return ROLEPLAY_SCENARIOS.filter(item => item.levels.includes(level));
}
