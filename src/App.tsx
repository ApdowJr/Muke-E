import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
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
import { cn } from './utils/cn';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  const tabs: Array<{ id: TabType; label: string; labelSo: string; icon: React.ReactNode }> = [
    { id: 'conversation', label: 'Conversation', labelSo: 'Wada Hadal', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'pronunciation', label: 'Pronounce', labelSo: 'Sax Dhawaaqa', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'transcription', label: 'Dictate', labelSo: 'Qoraal', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Desktop/Tablet Header */}
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

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        {/* Premium Content Banner */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/15 sm:flex-shrink-0"
          >
            <TrendingUp className="h-4 w-4 text-amber-300" />
            <span>
              {isSomali ? `Horumarka (${progressData.totalCount})` : `Progress (${progressData.totalCount})`}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="mb-6 -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 shadow-inner shadow-slate-950/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition-all sm:text-sm',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                {tab.icon}
                <span>{isSomali ? tab.labelSo : tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Learning Content Area */}
        <div className="space-y-4">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/40 px-4 py-3 text-center text-[11px] text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => setIsProgressModalOpen(true)}
            className="inline-flex items-center gap-1.5 self-start font-medium text-slate-300 transition hover:text-white sm:self-auto"
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

      {/* Modals */}
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
