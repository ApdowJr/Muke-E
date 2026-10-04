import React, { useState } from 'react';
import {
  Mic,
  Settings2,
  Volume2,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { AppLanguage, SkillLevel, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { MokeAvatar } from './MokeAvatar';

interface HeaderProps {
  targetLang: TargetLanguageCode;
  setTargetLang: (lang: TargetLanguageCode) => void;
  appLang: AppLanguage;
  setAppLang: (lang: AppLanguage) => void;
  level: SkillLevel;
  setLevel: (level: SkillLevel) => void;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  autoPlayAudio: boolean;
  setAutoPlayAudio: (autoPlay: boolean) => void;
  onOpenMicPermissionModal: () => void;
  isMicPermitted: boolean;
  onOpenProgressModal: () => void;
  streakDays: number;
}

export const Header: React.FC<HeaderProps> = ({
  targetLang,
  setTargetLang,
  appLang,
  setAppLang,
  level,
  setLevel,
  speechSpeed,
  setSpeechSpeed,
  autoPlayAudio,
  setAutoPlayAudio,
  onOpenMicPermissionModal,
  isMicPermitted,
  onOpenProgressModal,
  streakDays,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/75 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-5 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-2 shadow-lg shadow-blue-500/10">
                <MokeAvatar size="md" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white">Moke E</h1>
                <p className="text-[11px] text-slate-400">
                  {isSomali ? 'Barashada Luqadaha' : 'Language Companion'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              onClick={onOpenProgressModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-bold text-amber-300 transition hover:bg-amber-500/15"
              title={isSomali ? 'Eeg Horumarkaaga & Streak-ga' : 'View Learning Progress & Streak'}
            >
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{streakDays || 1}d</span>
            </button>

            <div className="relative">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as TargetLanguageCode)}
                aria-label="Target language"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-[11px] font-semibold text-slate-100 outline-none transition hover:border-blue-500/50 focus:border-blue-500 sm:text-xs"
              >
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.flag} {isSomali ? lang.nameSo : lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setAppLang('so')}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  appLang === 'so'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Soomaali
              </button>
              <button
                onClick={() => setAppLang('en')}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  appLang === 'en'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onOpenMicPermissionModal}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                isMicPermitted
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
              }`}
              title={isSomali ? 'Makarafoonka' : 'Microphone status'}
            >
              <Mic className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                <Settings2 className="h-4 w-4" />
              </button>

              {showSettings && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-slate-950/60">
                  <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white">
                      {isSomali ? 'Habaynta' : 'Settings'}
                    </span>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="mb-1.5 block font-medium text-slate-400">
                        {isSomali ? 'Heerka Luqadda' : 'Level'}
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setLevel(lvl)}
                            className={`rounded-lg py-1.5 text-center font-medium transition ${
                              level === lvl ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {lvl === 'Beginner'
                              ? isSomali ? 'Bilaabe' : 'Beginner'
                              : lvl === 'Intermediate'
                                ? isSomali ? 'Dhexe' : 'Mid'
                                : isSomali ? 'Sare' : 'Adv'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-slate-400">
                        <span>{isSomali ? 'Xawaaraha Codka' : 'Voice Speed'}</span>
                        <span className="font-mono text-white">{speechSpeed}x</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.8, 1.0, 1.2].map((s) => (
                          <button
                            key={s}
                            onClick={() => setSpeechSpeed(s)}
                            className={`rounded-lg py-1 text-center transition ${
                              speechSpeed === s ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                      <span className="text-slate-300">{isSomali ? 'Toos u yeer codka' : 'Auto-play Audio'}</span>
                      <button
                        onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                          autoPlayAudio ? 'bg-blue-600' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                            autoPlayAudio ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
