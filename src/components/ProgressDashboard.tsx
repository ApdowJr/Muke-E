import React from 'react';
import { BarChart3, Flame, Target, Brain, Clock3 } from 'lucide-react';
import type { AppLanguage } from '../types';
import type { ProgressSummary } from '../utils/progressTracker';
import { getLearnerWeaknesses } from '../utils/learnerMemory';
import type { CEFRLevel } from '../utils/cefr';
import { getCEFRInfo } from '../utils/cefr';

interface Props { appLang: AppLanguage; progress: ProgressSummary; cefrLevel: CEFRLevel; onStartFocus: (focus: ReturnType<typeof getLearnerWeaknesses>[number]) => void; }
const skills = ['speaking','listening','vocabulary','grammar','pronunciation','fluency'] as const;
export const ProgressDashboard: React.FC<Props> = ({appLang,progress,cefrLevel,onStartFocus}) => {
 const so=appLang==='so'; const weaknesses=getLearnerWeaknesses(); const info=getCEFRInfo(cefrLevel);
 return <div className="space-y-5">
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {[[Flame,progress.streakDays,so?'maalin oo xiriir ah':'day streak'],[Target,progress.totalCount,so?'fadhiyo':'sessions'],[BarChart3,progress.averageScore+'%',so?'celcelis':'practice average'],[Brain,progress.totalPhrases,so?'weedho':'phrases']].map(([Icon,value,label])=>{const I=Icon as React.ElementType;return <div key={String(label)} className="rounded-2xl border border-app-border bg-app-surface p-4"><I className="h-5 w-5 text-primary"/><p className="mt-3 text-2xl font-bold">{String(value)}</p><p className="text-xs text-text-muted">{String(label)}</p></div>})}
  </section>
  <section className="rounded-3xl border border-app-border bg-app-surface p-5">
   <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">CEFR</p><h2 className="mt-1 text-xl font-bold">{info.level} · {info.title}</h2></div><Clock3 className="h-5 w-5 text-primary"/></div>
   <p className="mt-2 text-sm text-text-secondary">{info.description}</p>
   <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{['A1','A2','B1','B2','C1','C2'].map(level=><div key={level} className={`rounded-xl px-2 py-3 text-center text-xs font-bold ${level===cefrLevel?'bg-primary text-white':'bg-app-elevated text-text-muted'}`}>{level}</div>)}</div>
  </section>
  <section className="rounded-3xl border border-app-border bg-app-surface p-5">
   <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/><h3 className="font-bold">{so?'Xirfadaha':'Skill evidence'}</h3></div>
   <div className="mt-5 grid gap-3 md:grid-cols-2">{skills.map(skill=>{const item=progress.skills[skill];return <div key={skill} className="rounded-2xl bg-app-elevated p-4"><div className="flex items-center justify-between text-sm"><span className="font-bold capitalize">{skill}</span><span className="font-bold">{item.score}%</span></div><div className="mt-3 h-2 rounded-full bg-app-border"><div className="h-2 rounded-full bg-primary transition-all" style={{width:`${Math.max(0,Math.min(100,item.score))}%`}}/></div><p className="mt-2 text-[11px] text-text-muted">{item.practiceCount} {so?'tababar':'practice samples'} · {item.score===0?(so?'caddeyn weli ma jirto':'no evidence yet'):(so?'tani waa qiyaas tababar':'practice estimate, not certified proficiency')}</p></div>})}</div>
  </section>
  <section className="rounded-3xl border border-app-border bg-app-surface p-5">
   <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/><h3 className="font-bold">{so?'Waxa aad ku celinayso':'Personal review queue'}</h3></div>
   {weaknesses.length===0?<p className="mt-3 text-sm text-text-muted">{so?'Marka aad sameyso sixitaanno, halkan ayaa lagu soo bandhigi doonaa.':'Corrections you repeat will appear here for focused review.'}</p>:<div className="mt-4 grid gap-3 md:grid-cols-2">{weaknesses.slice(0,4).map(item=><button key={item.id} onClick={()=>onStartFocus(item)} className="rounded-2xl border border-app-border bg-app-elevated p-4 text-left hover:border-primary/40"><p className="text-sm font-bold">{item.phrase}</p><p className="mt-1 text-xs text-primary">→ {item.correction}</p><p className="mt-2 text-xs text-text-muted">{item.count} {so?'jeer':'repeats'} · {item.focusArea}</p></button>)}</div>}
  </section>
 </div>;
};
