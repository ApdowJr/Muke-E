import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { AppLanguage, SkillLevel, TabType, TargetLanguageCode } from './types';
import { Header } from './components/Header';
import { ConversationView } from './components/ConversationView';
import { PronunciationCoach } from './components/PronunciationCoach';
import { TranscriptionStudio } from './components/TranscriptionStudio';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { LearningProgressModal } from './components/LearningProgressModal';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import { getStoredProgress, recordPracticeSession, ProgressSummary } from './utils/progressTracker';

export default function App() {
  const [targetLang, setTargetLang] = useState<TargetLanguageCode>('en');
  const [appLang, setAppLang] = useState<AppLanguage>('so');
  const [activeTab, setActiveTab] = useState<TabType>('conversation');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(true);
  const [pronunciationSeedPhrase, setPronunciationSeedPhrase] = useState<string>('');
  const [isMicModalOpen, setIsMicModalOpen] = useState<boolean>(false);
  const [isMicPermitted, setIsMicPermitted] = useState<boolean>(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<ProgressSummary>(getStoredProgress());

  const isSomali = appLang === 'so';
  const currentLang = SUPPORTED_LANGUAGES[targetLang];

  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem('moke_e_target_lang') as TargetLanguageCode;
      if (savedTarget && SUPPORTED_LANGUAGES[savedTarget]) setTargetLang(savedTarget);
      const savedAppLang = localStorage.getItem('moke_e_app_lang') as AppLanguage;
      if (savedAppLang) setAppLang(savedAppLang);
    } catch (e) {}

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setIsMicPermitted(res.state === 'granted');
          res.onchange = () => {
            setIsMicPermitted(res.state === 'granted');
          };
        })
        .catch(() => {});
    }
  }, []);

  const handleSetTargetLang = (code: TargetLanguageCode) => {
    setTargetLang(code);
    try {
      localStorage.setItem('moke_e_target_lang', code);
    } catch (e) {}
  };

  const handleSetAppLang = (lang: AppLanguage) => {
    setAppLang(lang);
    try {
      localStorage.setItem('moke_e_app_lang', lang);
    } catch (e) {}
  };

  const handleIncrementPractice = (score?: number) => {
    const updated = recordPracticeSession(score);
    setProgressData(updated);
  };

  const handleNavigateToPronunciation = (phrase: string) => {
    setPronunciationSeedPhrase(phrase);
    setActiveTab('pronunciation');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,#020817_0%,#0f172a_45%,#020817_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-8 pt-3 sm:px-4 lg:px-6">
        <div className="app-shell flex min-h-screen flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/80 shadow-[0_28px_80px_rgba(15,23,42,0.8)] backdrop-blur-xl">
          <Header
            targetLang={targetLang}
            setTargetLang={handleSetTargetLang}
            appLang={appLang}
            setAppLang={handleSetAppLang}
            level={level}
            setLevel={setLevel}
            speechSpeed={speechSpeed}
            setSpeechSpeed={setSpeechSpeed}
            autoPlayAudio={autoPlayAudio}
            setAutoPlayAudio={setAutoPlayAudio}
            onOpenMicPermissionModal={() => setIsMicModalOpen(true)}
            isMicPermitted={isMicPermitted}
            onOpenProgressModal={() => setIsProgressModalOpen(true)}
            streakDays={progressData.streakDays}
          />

          <div className="px-3 pb-3 pt-4 sm:px-5 lg:px-6">
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300 ring-1 ring-blue-400/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
                    {isSomali ? 'Xirfaddaaga' : 'Your practice'}
                  </p>
                  <h2 className="mt-1 text-base font-bold text-white sm:text-lg">
                    {isSomali ? 'Aynu sii wadno barashada luqadda' : 'Keep learning with confidence'}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/15"
              >
                <TrendingUp className="h-4 w-4 text-amber-300" />
                <span>
                  {isSomali ? `Horumarka (${progressData.totalCount})` : `Progress (${progressData.totalCount})`}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <nav aria-label="Main Navigation" className="w-full">
              <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 shadow-inner shadow-slate-950/50">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all sm:text-sm ${
                    activeTab === 'conversation'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{isSomali ? 'Wada Hadal' : 'Conversation'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('pronunciation')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all sm:text-sm ${
                    activeTab === 'pronunciation'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSomali ? 'Sax Dhawaaqa' : 'Pronounce'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('transcription')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all sm:text-sm ${
                    activeTab === 'transcription'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>{isSomali ? 'Qoraal' : 'Dictate'}</span>
                </button>
              </div>
            </nav>
          </div>

          <main className="flex-1 px-3 pb-4 sm:px-5 lg:px-6">
            {activeTab === 'conversation' && (
              <ConversationView
                targetLang={targetLang}
                appLang={appLang}
                level={level}
                speechSpeed={speechSpeed}
                autoPlayAudio={autoPlayAudio}
                onSendToPronunciationLab={handleNavigateToPronunciation}
                onIncrementPractice={() => handleIncrementPractice()}
                onTriggerMicPermissionModal={() => setIsMicModalOpen(true)}
              />
            )}

            {activeTab === 'pronunciation' && (
              <PronunciationCoach
                targetLang={targetLang}
                appLang={appLang}
                initialPhrase={pronunciationSeedPhrase}
                onIncrementPractice={(score) => handleIncrementPractice(score)}
                onTriggerMicPermissionModal={() => setIsMicModalOpen(true)}
              />
            )}

            {activeTab === 'transcription' && (
              <TranscriptionStudio
                targetLang={targetLang}
                appLang={appLang}
                onSendToPronunciation={handleNavigateToPronunciation}
                onIncrementPractice={() => handleIncrementPractice()}
                onTriggerMicPermissionModal={() => setIsMicModalOpen(true)}
              />
            )}
          </main>

          <footer className="border-t border-white/10 bg-slate-950/40 px-3 py-3 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="inline-flex items-center gap-1.5 self-start font-medium text-slate-300 transition hover:text-white"
              >
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                <span>
                  {isSomali ? `Horumarkaaga (${progressData.totalCount} layli)` : `Learning Progress (${progressData.totalCount} done)`}
                </span>
              </button>

              <span className="inline-flex items-center gap-1.5 self-start sm:self-auto">
                <span>{currentLang.flag}</span>
                <span>
                  {isSomali ? currentLang.nameSo : currentLang.name} · 100% Free
                </span>
              </span>
            </div>
          </footer>
        </div>
      </div>

      <LearningProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        appLang={appLang}
        progress={progressData}
      />

      <MicrophonePermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        appLang={appLang}
        onPermissionGranted={() => {
          setIsMicPermitted(true);
        }}
      />
    </div>
  );
}
