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
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <MokeAvatar size="md" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              Moke E
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSomali ? 'Barashada Luqadaha' : 'Language Companion'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Learning Progress / Streak Trigger Button */}
          <button
            onClick={onOpenProgressModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all shadow-sm active:scale-95"
            title={isSomali ? 'Eeg Horumarkaaga & Streak-ga' : 'View Learning Progress & Streak'}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streakDays || 1}d</span>
          </button>

          {/* Target Language Dropdown */}
          <div className="relative">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as TargetLanguageCode)}
              aria-label="Target language"
              className="bg-slate-800 hover:bg-slate-750 text-slate-100 font-semibold text-xs sm:text-sm py-2 px-2.5 sm:px-3 rounded-xl border border-slate-700/80 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {isSomali ? lang.nameSo : lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* App Language (Soomaali / English) */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/70 text-xs font-medium">
            <button
              onClick={() => setAppLang('so')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors ${
                appLang === 'so'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Soomaali
            </button>
            <button
              onClick={() => setAppLang('en')}
              className={`px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors ${
                appLang === 'en'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Mic status trigger */}
          <button
            onClick={onOpenMicPermissionModal}
            className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
              isMicPermitted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
            }`}
            title={isSomali ? 'Makarafoonka' : 'Microphone status'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Settings"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 text-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">
                    {isSomali ? 'Habaynta' : 'Settings'}
                  </span>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">
                    {isSomali ? 'Heerka Luqadda' : 'Level'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(lvl)}
                        className={`py-1.5 rounded-lg text-center font-medium transition-colors ${
                          level === lvl
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {lvl === 'Beginner' ? (isSomali ? 'Bilaabe' : 'Beginner') : lvl === 'Intermediate' ? (isSomali ? 'Dhexe' : 'Mid') : (isSomali ? 'Sare' : 'Adv')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1.5 font-medium">
                    <span>{isSomali ? 'Xawaaraha Codka' : 'Voice Speed'}</span>
                    <span className="text-white font-mono">{speechSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[0.8, 1.0, 1.2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeechSpeed(s)}
                        className={`py-1 rounded-lg text-center ${
                          speechSpeed === s
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-300">
                    {isSomali ? 'Toos u yeer codka' : 'Auto-play Audio'}
                  </span>
                  <button
                    onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                      autoPlayAudio ? 'bg-blue-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                        autoPlayAudio ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
