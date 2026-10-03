import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  FileText,
  TrendingUp,
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

    // Check microphone permission
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
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

      {/* Clean Tab Bar with quick progress link */}
      <div className="max-w-md mx-auto w-full px-4 pt-4 pb-2">
        <nav aria-label="Main Navigation" className="flex items-center justify-center">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-full">
            <button
              onClick={() => setActiveTab('conversation')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'conversation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isSomali ? 'Wada Hadal' : 'Conversation'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pronunciation')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'pronunciation'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSomali ? 'Sax Dhawaaqa' : 'Pronounce'}</span>
            </button>

            <button
              onClick={() => setActiveTab('transcription')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'transcription'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isSomali ? 'Qoraal' : 'Dictate'}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-3">
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

      {/* Learning Progress Modal with Recharts Visual Representation */}
      <LearningProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        appLang={appLang}
        progress={progressData}
      />

      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        appLang={appLang}
        onPermissionGranted={() => {
          setIsMicPermitted(true);
        }}
      />

      {/* Clean Footer with Quick Progress Link */}
      <footer className="border-t border-slate-900 py-3 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setIsProgressModalOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-medium"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>{isSomali ? `Horumarkaaga (${progressData.totalCount} layli)` : `Learning Progress (${progressData.totalCount} done)`}</span>
          </button>
          <span className="text-slate-400">
            {currentLang.flag} {isSomali ? currentLang.nameSo : currentLang.name} · 100% Free
          </span>
        </div>
      </footer>
    </div>
  );
}
