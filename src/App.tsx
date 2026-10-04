import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Mic2, BarChart3, Sparkles, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppLanguage, SkillLevel, TabType, TargetLanguageCode, LearningFocus } from './types';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ConversationView } from './components/ConversationView';
import { PronunciationCoach } from './components/PronunciationCoach';
import { TranscriptionStudio } from './components/TranscriptionStudio';
import { MicrophonePermissionModal } from './components/MicrophonePermissionModal';
import { LearningDashboard } from './components/LearningDashboard';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SUPPORTED_LANGUAGES } from './utils/languages';
import { getStoredProgress, recordPracticeSession, recordSkillPractice, recordConversationFeedback, ProgressSummary } from './utils/progressTracker';
import { LearnerWeakness } from './utils/learnerMemory';
import { CEFRLevel, bandForCEFR } from './utils/cefr';

export default function App() {
  const [targetLang, setTargetLang] = useState<TargetLanguageCode>('en');
  const [appLang, setAppLang] = useState<AppLanguage>('so');
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [cefrLevel, setCefrLevel] = useState<CEFRLevel>('A1');
  const [level, setLevel] = useState<SkillLevel>('Beginner');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [pronunciationSeedPhrase, setPronunciationSeedPhrase] = useState('');
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isMicPermitted, setIsMicPermitted] = useState(false);
  const [progressData, setProgressData] = useState<ProgressSummary>(() => getStoredProgress());
  const [learningFocus, setLearningFocus] = useState<LearningFocus | null>(null);

  const isSomali = appLang === 'so';
  const currentLang = SUPPORTED_LANGUAGES[targetLang];


  useEffect(() => {
    try {
      const savedTarget = localStorage.getItem('moke_e_target_lang') as TargetLanguageCode;
      if (savedTarget && SUPPORTED_LANGUAGES[savedTarget]) setTargetLang(savedTarget);
      const savedAppLang = localStorage.getItem('moke_e_app_lang') as AppLanguage;
      if (savedAppLang === 'so' || savedAppLang === 'en') setAppLang(savedAppLang);
      const savedCEFR = localStorage.getItem('moke_e_cefr_level') as CEFRLevel;
      if (['A1','A2','B1','B2','C1','C2'].includes(savedCEFR)) {
        setCefrLevel(savedCEFR);
        setLevel(bandForCEFR(savedCEFR));
      }
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

  const handleSetCefr = (next: CEFRLevel) => {
    setCefrLevel(next);
    setLevel(bandForCEFR(next));
    try { localStorage.setItem('moke_e_cefr_level', next); } catch (e) {}
  };

  const refreshProgress = (next: ProgressSummary) => setProgressData(next);

  const handleConversationPractice = () => refreshProgress(recordPracticeSession());
  const handleConversationFeedback = (feedback: { corrected: boolean; focusArea?: string; focusPassed?: boolean }) =>
    refreshProgress(recordConversationFeedback(feedback));

  const handlePronunciationPractice = (score?: number) => {
    let next = recordPracticeSession(score);
    if (typeof score === 'number') next = recordSkillPractice('pronunciation', score);
    refreshProgress(next);
  };

  const handleListeningPractice = () => {
    let next = recordPracticeSession();
    next = recordSkillPractice('listening', 70);
    refreshProgress(next);
  };

  const handleStartFocus = (focus: LearnerWeakness) => {
    setLearningFocus({
      skill: focus.focusArea || 'Natural language',
      weakness: focus.phrase,
      correction: focus.correction,
      practicePrompt: focus.practicePrompt || ('Practice this naturally: ' + focus.correction),
    });
    setActiveTab('speak');
  };

  const handleExitFocus = () => setLearningFocus(null);

  const handleNavigateToPronunciation = (phrase: string) => {
    setPronunciationSeedPhrase(phrase);
    setActiveTab('practice');
  };

  const handleStartRoleplay = (roleplayId?: string) => {
    if (roleplayId) {
      const map: Record<string,string> = {
        'airport-checkin':'travel',
        'hotel-problem':'travel',
        'restaurant-order':'coffee',
        'job-interview':'interview',
        'doctor-visit':'doctor',
        'salary-negotiation':'interview',
        'debate':'general',
      };
      try { localStorage.setItem('moke_e_roleplay_scenario', map[roleplayId] || 'general'); } catch (e) {}
    }
    setActiveTab('speak');
  };


  if (showLanding) {
    return (
      <LandingPage
        appLang={appLang}
        targetLang={targetLang}
        onStartLearning={() => setShowLanding(false)}
        onSetTargetLang={handleSetTargetLang}
      />
    );
  }

  const navItems = [
    { id: 'learn' as TabType, label: isSomali ? 'Baro' : 'Learn', short: isSomali ? 'Baro' : 'Learn', icon: BookOpen },
    { id: 'practice' as TabType, label: isSomali ? 'Ku celceli' : 'Practice', short: isSomali ? 'Layli' : 'Practice', icon: Mic2 },
    { id: 'speak' as TabType, label: isSomali ? 'Hadal' : 'Speak', short: isSomali ? 'Hadal' : 'Speak', icon: MessageSquare },
    { id: 'progress' as TabType, label: isSomali ? 'Horumar' : 'Progress', short: isSomali ? 'Horumar' : 'Progress', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white">Skip to learning content</a>
      <Header targetLang={targetLang} setTargetLang={handleSetTargetLang} appLang={appLang} setAppLang={handleSetAppLang}
        level={level} setLevel={(next) => { setLevel(next); }} speechSpeed={speechSpeed} setSpeechSpeed={setSpeechSpeed}
        autoPlayAudio={autoPlayAudio} setAutoPlayAudio={setAutoPlayAudio} onOpenMicPermissionModal={() => setIsMicModalOpen(true)}
        isMicPermitted={isMicPermitted} onOpenProgressModal={() => setActiveTab('progress')} streakDays={progressData.streakDays} />

      <div className="mx-auto flex w-full max-w-[1480px]">
        <aside className="hidden w-60 shrink-0 border-r border-app-border px-4 py-6 lg:block">
          <div className="mb-7 px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{isSomali ? 'Barashadaada' : 'Your learning'}</p>
            <p className="mt-1 text-sm font-semibold">{currentLang.nativeName} · {cefrLevel}</p>
          </div>
          <nav className="space-y-1" aria-label="Learning navigation">
            {navItems.map(item => { const Icon=item.icon; const active=activeTab===item.id; return (
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active?'bg-primary text-white shadow-md':'text-text-secondary hover:bg-app-elevated hover:text-text-primary'}`}>
                <Icon className="h-4 w-4"/>{item.label}
              </button>
            );})}
          </nav>
          <div className="mt-8 rounded-2xl border border-app-border bg-app-surface p-4">
            <div className="flex items-center gap-2 text-sm font-bold"><Flame className="h-4 w-4 text-warning"/>{progressData.streakDays} {isSomali?'maalmood':'day streak'}</div>
            <p className="mt-1 text-xs leading-5 text-text-muted">{isSomali?'Joogteyntu waxay dhistaa xirfad.':'Small daily practice builds real fluency.'}</p>
            <button onClick={()=>setActiveTab('progress')} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">{isSomali?'Eeg horumarka':'View progress'}<ArrowRight className="h-3 w-3"/></button>
          </div>
        </aside>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-text-muted">
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-2.5"><BookOpen className="h-3.5 w-3.5 text-primary"/>{currentLang.flag} {isSomali?currentLang.nameSo:currentLang.name}</span>
                <span className="rounded-full bg-app-elevated px-2.5 py-1">{cefrLevel}</span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {activeTab==='learn' ? (isSomali?'Qorshee barashadaada.':'Build your learning path.')
                  : activeTab==='practice' ? (isSomali?'Ku celceli waxa aad rabto inaad si fiican u samayso.':'Practice what you want to do better.')
                  : activeTab==='speak' ? (isSomali?'Ku hadal si dhab ah.':'Speak for real.')
                  : (isSomali?'Caddee horumarkaaga.':'See your learning evidence.')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                {isSomali?'Cashar, tababar, wada hadal iyo dib-u-eegis isku xiran.':'Curriculum, practice, conversation, and review working as one system.'}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-app-border bg-app-surface p-2 shadow-elevation-sm">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><Sparkles className="h-4 w-4"/></div>
              <div className="pr-2"><p className="text-xs font-bold">{isSomali?'Maanta':'Today'}</p><p className="text-[11px] text-text-muted">{progressData.totalCount} {isSomali?'fadhiyo':'practice sessions'}</p></div>
            </div>
          </section>

          <div className="animate-fade-in">
            {activeTab==='learn' && <LearningDashboard appLang={appLang} cefrLevel={cefrLevel} setCefrLevel={handleSetCefr} progress={progressData} onSpeak={handleStartRoleplay} onPractice={()=>setActiveTab('practice')}/>}
            {activeTab==='practice' && (
              <div className="space-y-6">
                <PronunciationCoach targetLang={targetLang} appLang={appLang} initialPhrase={pronunciationSeedPhrase}
                  onIncrementPractice={handlePronunciationPractice} onTriggerMicPermissionModal={()=>setIsMicModalOpen(true)}/>
                <TranscriptionStudio targetLang={targetLang} appLang={appLang} onSendToPronunciation={handleNavigateToPronunciation}
                  onIncrementPractice={handleListeningPractice} onTriggerMicPermissionModal={()=>setIsMicModalOpen(true)}/>
              </div>
            )}
            {activeTab==='speak' && <ConversationView targetLang={targetLang} appLang={appLang} level={level} cefrLevel={cefrLevel} speechSpeed={speechSpeed} autoPlayAudio={autoPlayAudio}
              learningFocus={learningFocus} onExitFocus={handleExitFocus} onSendToPronunciationLab={handleNavigateToPronunciation}
              onIncrementPractice={handleConversationPractice} onRecordFeedback={handleConversationFeedback} onTriggerMicPermissionModal={()=>setIsMicModalOpen(true)}/>}
            {activeTab==='progress' && <ProgressDashboard appLang={appLang} progress={progressData} cefrLevel={cefrLevel} onStartFocus={handleStartFocus}/>}
          </div>

          {activeTab==='learn' && <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              [CheckCircle2,isSomali?'Cashar cad':'Clear curriculum',isSomali?'A1 ilaa C2, ujeeddooyin la fahmi karo.':'CEFR-aligned goals from A1 to C2.'],
              [Mic2,isSomali?'Cod iyo sixid':'Voice + feedback',isSomali?'Ku hadal, dhageyso, oo hagaaji.':'Speak, listen, and improve with evidence.'],
              [BarChart3,isSomali?'Horumar dhab ah':'Visible evidence',isSomali?'La soco tababarka iyo daciifnimada.':'Track practice, weaknesses, and review.'],
            ].map(([Icon,title,desc])=>{const I=Icon as React.ElementType;return <div key={String(title)} className="rounded-2xl border border-app-border bg-app-surface p-4"><I className="h-4 w-4 text-primary"/><p className="mt-2 text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs leading-5 text-text-muted">{String(desc)}</p></div>})}
          </div>}
        </main>
      </div>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-surface/95 px-2 pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">{navItems.map(item=>{const Icon=item.icon;const active=activeTab===item.id;return <button key={item.id} onClick={()=>setActiveTab(item.id)} aria-current={active?'page':undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold ${active?'text-primary':'text-text-muted'}`}><Icon className="h-5 w-5"/>{item.short}</button>})}</div>
      </nav>

      <MicrophonePermissionModal isOpen={isMicModalOpen} onClose={()=>setIsMicModalOpen(false)} appLang={appLang} onPermissionGranted={()=>setIsMicPermitted(true)}/>
    </div>
  );
}
