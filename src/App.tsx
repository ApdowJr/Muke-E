import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Mic2, FileText, BarChart3, Sparkles, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppLanguage, SkillLevel, TabType, TargetLanguageCode } from './types';
import { Header } from './components/Header';
import { ConversationView } from './components/ConversationView';
import { PronunciationCoach } from './components/PronunciationCoach';
import { TranscriptionStudio } from './components/TranscriptionStudio';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { LearningProgressModal } from './components/LearningProgressModal';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import { getStoredProgress, recordPracticeSession, recordSkillPractice, recordConversationFeedback, ProgressSummary } from './utils/progressTracker';
import { LearnerWeakness } from './utils/learnerMemory';

export default function App() {
  const [targetLang, setTargetLang] = useState<TargetLanguageCode>('en');
  const [appLang, setAppLang] = useState<AppLanguage>('so');
  const [activeTab, setActiveTab] = useState<TabType>('conversation');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [pronunciationSeedPhrase, setPronunciationSeedPhrase] = useState('');
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isMicPermitted, setIsMicPermitted] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [progressData, setProgressData] = useState<ProgressSummary>(() => getStoredProgress());
  const [focusPrompt, setFocusPrompt] = useState('');

  const isSomali = appLang === 'so';
  const currentLang = SUPPORTED_LANGUAGES[targetLang];

  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem('moke_e_target_lang') as TargetLanguageCode;
      if (savedTarget && SUPPORTED_LANGUAGES[savedTarget]) setTargetLang(savedTarget);
      const savedAppLang = localStorage.getItem('moke_e_app_lang') as AppLanguage;
      if (savedAppLang === 'so' || savedAppLang === 'en') setAppLang(savedAppLang);
    } catch (e) {}

    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setIsMicPermitted(res.state === 'granted');
          res.onchange = () => setIsMicPermitted(res.state === 'granted');
        })
        .catch(() => {});
    }
  }, []);

  const handleSetTargetLang = (code: TargetLanguageCode) => {
    setTargetLang(code);
    try { localStorage.setItem('moke_e_target_lang', code); } catch (e) {}
  };

  const handleSetAppLang = (lang: AppLanguage) => {
    setAppLang(lang);
    try { localStorage.setItem('moke_e_app_lang', lang); } catch (e) {}
  };

  const refreshProgress = (next: ProgressSummary) => setProgressData(next);

  const handleConversationPractice = () => {
    refreshProgress(recordPracticeSession());
  };

  const handleConversationFeedback = (feedback: { corrected: boolean; focusArea?: string }) => {
    refreshProgress(recordConversationFeedback(feedback));
  };

  const handlePronunciationPractice = (score?: number) => {
    refreshProgress(recordPracticeSession(score));
    if (typeof score === 'number') {
      refreshProgress(recordSkillPractice('pronunciation', score));
    }
  };

  const handleListeningPractice = () => {
    refreshProgress(recordPracticeSession());
    refreshProgress(recordSkillPractice('listening', 70));
  };

  const handleStartFocus = (focus: LearnerWeakness) => {
    setFocusPrompt(focus.practicePrompt || ('Practice this naturally: ' + focus.correction));
    setActiveTab('conversation');
  };

  const handleNavigateToPronunciation = (phrase: string) => {
    setPronunciationSeedPhrase(phrase);
    setActiveTab('pronunciation');
  };

  const navItems = [
    { id: 'conversation' as TabType, label: isSomali ? 'Baro & Hadal' : 'Learn & Speak', short: isSomali ? 'Baro' : 'Learn', icon: MessageSquare },
    { id: 'pronunciation' as TabType, label: isSomali ? 'Dhawaaq' : 'Pronunciation', short: isSomali ? 'Cod' : 'Speak', icon: Mic2 },
    { id: 'transcription' as TabType, label: isSomali ? 'Dhageysi' : 'Listening', short: isSomali ? 'Dhagaysi' : 'Listen', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
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

      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="hidden w-56 shrink-0 border-r border-app-border px-4 py-6 lg:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              {isSomali ? 'Barashadaada' : 'Your learning'}
            </p>
            <p className="mt-1 text-sm font-semibold">{currentLang.nativeName}</p>
          </div>
          <nav className="space-y-1" aria-label="Learning navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:bg-app-elevated hover:text-text-primary'}`}>
                  <Icon className="h-4 w-4" />{item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-app-border bg-app-surface p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Flame className="h-4 w-4 text-warning" /> {progressData.streakDays} {isSomali ? 'maalmood' : 'day streak'}
            </div>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              {isSomali ? 'Joogteyntu waxay dhistaa xirfad.' : 'Small daily practice builds real fluency.'}
            </p>
            <button onClick={() => setIsProgressModalOpen(true)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
              {isSomali ? 'Eeg horumarka' : 'View progress'} <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <section className="mb-6 grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-text-muted">
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-2.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> {currentLang.flag} {isSomali ? currentLang.nameSo : currentLang.name}
                </span>
                <span className="rounded-full bg-app-elevated px-2.5 py-1">{level}</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {isSomali ? 'Aan ku barno adigoo dhab u hadlaya.' : 'Learn by actually speaking.'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
                {isSomali
                  ? 'Wada sheekeysi dabiici ah, sixid cad, iyo ku celcelin kaa caawisa inaad xasuusato.'
                  : 'Practice real conversations, get clear corrections, and repeat what matters until it sticks.'}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-surface p-2 shadow-elevation-sm">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Sparkles className="h-4 w-4" /></div>
              <div className="pr-2">
                <p className="text-xs font-bold">{isSomali ? 'Maanta' : 'Today'}</p>
                <p className="text-[11px] text-text-muted">{progressData.totalCount} {isSomali ? 'layli' : 'practice sessions'}</p>
              </div>
            </div>
          </section>

          <section className="mb-5 rounded-2xl border border-app-border bg-app-surface p-1 shadow-elevation-sm">
            <div className="grid grid-cols-3 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs font-bold transition sm:text-sm ${active ? 'bg-app-elevated text-text-primary' : 'text-text-muted hover:text-text-primary'}`}>
                    <Icon className="h-4 w-4" /><span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="animate-fade-in">
            {activeTab === 'conversation' && (
              <ConversationView targetLang={targetLang} appLang={appLang} level={level} speechSpeed={speechSpeed}
                autoPlayAudio={autoPlayAudio} focusPrompt={focusPrompt} onSendToPronunciationLab={handleNavigateToPronunciation}
                onIncrementPractice={handleConversationPractice} onRecordFeedback={handleConversationFeedback}
                onTriggerMicPermissionModal={() => setIsMicModalOpen(true)} />
            )}
            {activeTab === 'pronunciation' && (
              <PronunciationCoach targetLang={targetLang} appLang={appLang} initialPhrase={pronunciationSeedPhrase}
                onIncrementPractice={handlePronunciationPractice} onTriggerMicPermissionModal={() => setIsMicModalOpen(true)} />
            )}
            {activeTab === 'transcription' && (
              <TranscriptionStudio targetLang={targetLang} appLang={appLang}
                onSendToPronunciation={handleNavigateToPronunciation} onIncrementPractice={handleListeningPractice}
                onTriggerMicPermissionModal={() => setIsMicModalOpen(true)} />
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              [CheckCircle2, isSomali ? 'Wada hadal dhab ah' : 'Real conversation', isSomali ? 'Ku tababar xaalado nololeed.' : 'Practice useful situations.'],
              [Mic2, isSomali ? 'Ku hadal codkaaga' : 'Use your voice', isSomali ? 'Dhageyso, ku celi, sax.' : 'Listen, repeat, improve.'],
              [BarChart3, isSomali ? 'Horumar la arki karo' : 'Visible progress', isSomali ? 'La soco tababarkaaga.' : 'Track your practice.'],
            ].map(([Icon, title, desc]) => {
              const I = Icon as React.ElementType;
              return (
                <div key={String(title)} className="rounded-2xl border border-app-border bg-app-surface p-4">
                  <I className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-sm font-bold">{String(title)}</p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">{String(desc)}</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-surface/95 px-2 pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold ${active ? 'text-primary' : 'text-text-muted'}`}>
                <Icon className="h-5 w-5" />{item.short}
              </button>
            );
          })}
        </div>
      </nav>

      <LearningProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        appLang={appLang}
        progress={progressData}
        onStartFocus={handleStartFocus}
      />
      <MicrophonePermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        appLang={appLang}
        onPermissionGranted={() => setIsMicPermitted(true)}
      />
    </div>
  );
}
