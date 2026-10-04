import React from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Mic2, MessageCircle, Brain, Sparkles } from 'lucide-react';
import type { AppLanguage, SkillLevel } from '../types';
import type { ProgressSummary } from '../utils/progressTracker';
import { CEFR_LEVELS, type CEFRLevel, getCEFRInfo } from '../utils/cefr';
import { getCEFRCurriculumFocus } from '../utils/curriculum';
import { getRoleplaysForLevel } from '../utils/roleplay';

interface Props {
  appLang: AppLanguage;
  cefrLevel: CEFRLevel;
  setCefrLevel: (level: CEFRLevel) => void;
  level: SkillLevel;
  progress: ProgressSummary;
  onSpeak: (scenarioId?: string) => void;
  onPractice: () => void;
}

const skillLabels: Record<string,string> = { speaking:'Speaking', listening:'Listening', vocabulary:'Vocabulary', grammar:'Grammar', pronunciation:'Pronunciation', fluency:'Fluency' };

export const LearningDashboard: React.FC<Props> = ({ appLang, cefrLevel, setCefrLevel, level, progress, onSpeak, onPractice }) => {
  const so = appLang === 'so';
  const info = getCEFRInfo(cefrLevel);
  const weakest = (Object.keys(progress.skills) as Array<keyof typeof progress.skills>).sort((a,b) => progress.skills[a].score - progress.skills[b].score)[0] ?? 'speaking';
  const focus = getCEFRCurriculumFocus(cefrLevel, weakest);
  const roleplays = getRoleplaysForLevel(cefrLevel).slice(0,3);

  return <div className="space-y-5">
    <section className="rounded-3xl border border-app-border bg-app-surface p-5 shadow-elevation-sm sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary"><Sparkles className="h-4 w-4"/> {so ? 'Qorshahaaga' : 'Your learning path'}</div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{so ? 'Baro → ku celceli → ku hadal.' : 'Learn → practice → speak.'}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{so ? 'Muke-E wuxuu isku xiraa casharka, tababarka, iyo wada hadalka si horumarkaagu u noqdo mid la isticmaali karo.' : 'Muke-E connects curriculum, practice, and conversation so progress becomes usable language.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CEFR_LEVELS.map(item => <button key={item.level} onClick={()=>setCefrLevel(item.level)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${item.level===cefrLevel?'border-primary bg-primary text-white':'border-app-border bg-app-elevated text-text-secondary hover:text-text-primary'}`}>{item.level}</button>)}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-app-elevated p-4"><p className="text-xs text-text-muted">CEFR</p><p className="mt-1 text-xl font-bold">{info.level} · {info.title}</p><p className="mt-1 text-xs text-text-secondary">{info.description}</p></div>
        <div className="rounded-2xl bg-app-elevated p-4"><p className="text-xs text-text-muted">{so?'Xirfadda daciifka ah':'Current focus'}</p><p className="mt-1 text-xl font-bold">{skillLabels[weakest]}</p><p className="mt-1 text-xs text-text-secondary">{focus.objective}</p></div>
        <div className="rounded-2xl bg-app-elevated p-4"><p className="text-xs text-text-muted">{so?'Joogteyn':'Streak'}</p><p className="mt-1 text-xl font-bold">{progress.streakDays} {so?'maalin':'days'}</p><p className="mt-1 text-xs text-text-secondary">{progress.totalCount} {so?'fadhi tababar':'practice sessions'}</p></div>
      </div>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-3xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{so?'Tallaabada hadda':'Current lesson'}</p><h3 className="mt-1 text-lg font-bold">{focus.objective}</h3></div><BookOpen className="h-5 w-5 text-primary"/></div>
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold">{focus.task}</p><p className="mt-2 text-xs leading-5 text-text-secondary">{focus.successSignal}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={()=>onSpeak()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"><MessageCircle className="h-4 w-4"/>{so?'Ku hadal':'Speak now'}</button>
          <button onClick={onPractice} className="inline-flex items-center gap-2 rounded-xl border border-app-border px-4 py-2.5 text-sm font-bold"><Mic2 className="h-4 w-4"/>{so?'Ku celceli dhawaaqa':'Practice pronunciation'}</button>
        </div>
      </div>
      <div className="rounded-3xl border border-app-border bg-app-surface p-5">
        <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/><h3 className="font-bold">{so?'Waxa aad awooddo':'Can-do goals'}</h3></div>
        <div className="mt-4 space-y-3">{info.canDo.map(item=><div key={item} className="flex gap-2 text-sm text-text-secondary"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>{item}</div>)}</div>
      </div>
    </section>

    <section className="rounded-3xl border border-app-border bg-app-surface p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">{so?'Xaalado dhab ah':'Real-world scenarios'}</p><h3 className="mt-1 text-lg font-bold">{so?'Roleplay aad hadda qaban karto':'Roleplays matched to your level'}</h3></div><ChevronRight className="h-5 w-5 text-text-muted"/></div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">{roleplays.map(role=><button key={role.id} onClick={()=>onSpeak(role.id)} className="group rounded-2xl border border-app-border bg-app-elevated p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40"><div className="text-2xl">{role.id==='airport-checkin'?'✈️':role.id==='restaurant-order'?'☕':role.id==='job-interview'?'💼':role.id==='doctor-visit'?'🏥':role.id==='hotel-problem'?'🏨':role.id==='salary-negotiation'?'💰':'🗣️'}</div><p className="mt-3 text-sm font-bold">{so?role.titleSo:role.titleEn}</p><p className="mt-1 text-xs leading-5 text-text-muted">{so?role.goalSo:role.goalEn}</p><span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">{so?'Bilow':'Start'} <ChevronRight className="h-3 w-3"/></span></button>)}</div>
    </section>
  </div>;
};
