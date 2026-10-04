import React, { useState } from 'react';
import { Mic, Settings2, Flame } from 'lucide-react';
import { AppLanguage, SkillLevel, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { MokeAvatar } from './MokeAvatar';

interface HeaderProps {
  targetLang: TargetLanguageCode; setTargetLang: (lang: TargetLanguageCode) => void;
  appLang: AppLanguage; setAppLang: (lang: AppLanguage) => void;
  level: SkillLevel; setLevel: (level: SkillLevel) => void;
  speechSpeed: number; setSpeechSpeed: (speed: number) => void;
  autoPlayAudio: boolean; setAutoPlayAudio: (autoPlay: boolean) => void;
  onOpenMicPermissionModal: () => void; isMicPermitted: boolean;
  onOpenProgressModal: () => void; streakDays: number;
}
export const Header: React.FC<HeaderProps> = (p) => {
  const [showSettings,setShowSettings]=useState(false);
  const {targetLang,setTargetLang,appLang,setAppLang,level,setLevel,speechSpeed,setSpeechSpeed,autoPlayAudio,setAutoPlayAudio,onOpenMicPermissionModal,isMicPermitted,onOpenProgressModal,streakDays}=p;
  const isSomali=appLang==='so';
  return <header className="sticky top-0 z-50 border-b border-app-border bg-app-bg/90 backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface"><MokeAvatar size="sm"/></div><div className="min-w-0"><p className="font-display text-base font-extrabold tracking-tight">Moke E</p><p className="hidden text-[10px] font-semibold uppercase tracking-[.14em] text-text-muted sm:block">{isSomali?'Baro. Hadal. Xasuuso.':'Learn. Speak. Remember.'}</p></div></div>
      <div className="flex items-center gap-2">
        <button onClick={onOpenProgressModal} className="hidden items-center gap-1.5 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-xs font-bold text-text-secondary hover:text-text-primary sm:flex"><Flame className="h-4 w-4 text-warning"/>{streakDays||1}d</button>
        <select value={targetLang} onChange={e=>setTargetLang(e.target.value as TargetLanguageCode)} aria-label="Target language" className="max-w-36 rounded-xl border border-app-border bg-app-surface px-2.5 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary">{Object.values(SUPPORTED_LANGUAGES).map(l=><option key={l.code} value={l.code}>{l.flag} {isSomali?l.nameSo:l.name}</option>)}</select>
        <div className="hidden items-center rounded-xl border border-app-border bg-app-surface p-1 sm:flex"><button onClick={()=>setAppLang('so')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${appLang==='so'?'bg-primary text-white':'text-text-muted'}`}>Soomaali</button><button onClick={()=>setAppLang('en')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${appLang==='en'?'bg-primary text-white':'text-text-muted'}`}>English</button></div>
        <button onClick={onOpenMicPermissionModal} aria-label="Microphone settings" className={`hidden h-9 w-9 items-center justify-center rounded-xl border sm:flex ${isMicPermitted?'border-success/30 bg-success/10 text-success':'border-app-border bg-app-surface text-text-secondary'}`}><Mic className="h-4 w-4"/></button>
        <div className="relative"><button onClick={()=>setShowSettings(v=>!v)} aria-label="Settings" className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-secondary hover:text-text-primary"><Settings2 className="h-4 w-4"/></button>{showSettings&&<div className="absolute right-0 mt-2 w-72 rounded-2xl border border-app-border bg-app-surface p-4 shadow-elevation-lg"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-bold">{isSomali?'Habaynta':'Settings'}</span><button onClick={()=>setShowSettings(false)} className="text-text-muted">×</button></div><div className="space-y-4 text-xs"><div><label className="mb-2 block font-semibold text-text-muted">{isSomali?'Heerka':'Level'}</label><div className="grid grid-cols-3 gap-1">{(['Beginner','Intermediate','Advanced'] as SkillLevel[]).map(l=><button key={l} onClick={()=>setLevel(l)} className={`rounded-lg py-2 font-semibold ${level===l?'bg-primary text-white':'bg-app-elevated text-text-secondary'}`}>{l==='Beginner'?(isSomali?'Bilaabe':'Beginner'):l==='Intermediate'?(isSomali?'Dhexe':'Intermediate'):(isSomali?'Sare':'Advanced')}</button>)}</div></div><div><div className="mb-2 flex justify-between text-text-muted"><span>{isSomali?'Xawaaraha codka':'Voice speed'}</span><b className="text-text-primary">{speechSpeed}x</b></div><div className="grid grid-cols-3 gap-1">{[.8,1,1.2].map(s=><button key={s} onClick={()=>setSpeechSpeed(s)} className={`rounded-lg py-2 font-semibold ${speechSpeed===s?'bg-primary text-white':'bg-app-elevated text-text-secondary'}`}>{s}x</button>)}</div></div><div className="flex items-center justify-between border-t border-app-border pt-3"><span className="text-text-secondary">{isSomali?'Auto cod':'Auto-play audio'}</span><button onClick={()=>setAutoPlayAudio(!autoPlayAudio)} className={`h-6 w-10 rounded-full p-0.5 ${autoPlayAudio?'bg-primary':'bg-app-elevated'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${autoPlayAudio?'translate-x-4':'translate-x-0'}`}/></button></div></div></div>}</div>
      </div>
    </div>
  </header>;
};