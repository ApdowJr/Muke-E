import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, ChatMessage, SkillLevel, TargetLanguageCode, LearnerCorrection, LearningFocus, FocusPracticeResult } from '../types';
import { getLearnerWeaknesses, rememberCorrection, LearnerWeakness } from '../utils/learnerMemory';
import { getAdaptivePracticeContext, getRecommendedScenario, getAdaptiveNextTask } from '../utils/adaptivePractice';
import { getMasteryGuidance, recordAdaptiveTaskOutcome } from '../utils/learnerMastery';
import { CONVERSATION_SCENARIOS, SUPPORTED_LANGUAGES } from '../utils/languages';
import { RobustVoiceRecorder, speakText } from '../utils/speech';
import { VoiceCircle } from './VoiceCircle';
import { MokeAvatar } from './MokeAvatar';
import { cn } from '../utils/cn';

interface ConversationViewProps {
  targetLang: TargetLanguageCode;
  appLang: AppLanguage;
  level: SkillLevel;
  speechSpeed: number;
  autoPlayAudio: boolean;
  onSendToPronunciationLab: (phrase: string) => void;
  onIncrementPractice: () => void;
  onRecordFeedback?: (feedback: { corrected: boolean; focusArea?: string; focusPassed?: boolean }) => void;
  learningFocus?: LearningFocus | null;
  onExitFocus?: () => void;
  onTriggerMicPermissionModal: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  targetLang,
  appLang,
  level,
  speechSpeed,
  autoPlayAudio,
  onSendToPronunciationLab,
  onIncrementPractice,
  onRecordFeedback,
  onTriggerMicPermissionModal,
  learningFocus,
  onExitFocus,
}) => {
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  const [adaptiveContext, setAdaptiveContext] = useState(() => getAdaptivePracticeContext(level));
  const [activeScenarioId, setActiveScenarioId] = useState(() => getRecommendedScenario(getAdaptivePracticeContext(level)).scenarioId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [learnerWeaknesses, setLearnerWeaknesses] = useState<LearnerWeakness[]>([]);
  const [focusSuccesses, setFocusSuccesses] = useState(0);
  const [sessionTurns, setSessionTurns] = useState(0);
  const [sessionCorrections, setSessionCorrections] = useState(0);
  const recommendedScenario = getRecommendedScenario(adaptiveContext);
  const nextTask = getAdaptiveNextTask(adaptiveContext, level);
  const masteryGuidance = getMasteryGuidance(adaptiveContext.weakestSkill, nextTask.type);

  const voiceRecorderRef = useRef<RobustVoiceRecorder | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeScenario =
    CONVERSATION_SCENARIOS.find((s) => s.id === activeScenarioId) ||
    CONVERSATION_SCENARIOS[0];

  useEffect(() => {
    setLearnerWeaknesses(getLearnerWeaknesses());
    const nextContext = getAdaptivePracticeContext(level);
    setAdaptiveContext(nextContext);
    setActiveScenarioId(getRecommendedScenario(nextContext).scenarioId);
  }, []);

  useEffect(() => {
    setFocusSuccesses(0);
    setSessionTurns(0);
    setSessionCorrections(0);
    const nextContext = getAdaptivePracticeContext(level, 0, 0, 0);
    setAdaptiveContext(nextContext);
    if (!learningFocus) setActiveScenarioId(getRecommendedScenario(nextContext).scenarioId);
    if (learningFocus?.practicePrompt) setInputText(learningFocus.practicePrompt);
  }, [learningFocus]);

  useEffect(() => {
    const welcome = currentLang.welcomeMessage;
    const initialMsg: ChatMessage = {
      id: 'welcome-' + Date.now(),
      role: 'tutor',
      text: welcome,
      translation: isSomali ? currentLang.welcomeMessageSo : 'Welcome! Let us speak together.',
      suggestedReplies: currentLang.samplePhrases.slice(0, 3).map((sp) => ({
        text: sp.phrase,
        translation: isSomali ? sp.translationSo : sp.translationEn,
      })),
      timestamp: Date.now(),
    };

    setMessages([initialMsg]);

    if (autoPlayAudio) {
      handleSpeak(initialMsg.text, initialMsg.id);
    }
  }, [targetLang, activeScenarioId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript, isLoading, isProcessingAudio]);

  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current) voiceRecorderRef.current.cancel();
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSpeak = async (text: string, msgId?: string) => {
    if (msgId) setPlayingMsgId(msgId);
    try {
      await speakText(text, currentLang.speechCode, currentLang.name, speechSpeed);
    } finally {
      if (msgId) setPlayingMsgId(null);
    }
  };

  const handleToggleMic = async () => {
    setMicErrorMessage(null);

    if (isListening) {
      setIsListening(false);
      setIsProcessingAudio(true);

      try {
        if (voiceRecorderRef.current) {
          const result = await voiceRecorderRef.current.stop();
          setInterimTranscript('');
          setMicStream(null);
          setIsProcessingAudio(false);

          if (result.text && result.text.trim()) {
            await handleSendMessage(result.text.trim());
          } else {
            setMicErrorMessage(
              isSomali
                ? 'Cod cad lama maqal. Fadlan ku hadal mar kale.'
                : 'No speech detected. Please speak into the mic.'
            );
          }
        }
      } catch (err) {
        setIsProcessingAudio(false);
      }
    } else {
      try {
        const recorder = new RobustVoiceRecorder(
          currentLang.speechCode,
          currentLang.name,
          (interim) => {
            setInterimTranscript(interim);
          },
          (errType) => {
            if (errType === 'permission_denied') {
              setMicErrorMessage(
                isSomali
                  ? 'Fadlan browser-kaaga ka oggolow makarafoonka si aad ugu hadasho.'
                  : 'Please allow microphone access in your browser to speak.'
              );
              onTriggerMicPermissionModal();
            } else {
              setMicErrorMessage(
                isSomali ? 'Makarafoonka lama helin.' : 'Microphone not detected.'
              );
            }
            setIsListening(false);
            setMicStream(null);
          }
        );

        voiceRecorderRef.current = recorder;
        const stream = await recorder.start();
        setMicStream(stream);
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
        setMicStream(null);
      }
    }
  };

  const handleSendMessage = async (rawText?: string) => {
    const text = (rawText || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setInterimTranscript('');
    setMicErrorMessage(null);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    onIncrementPractice();

    try {
      const scenarioTitle = isSomali ? activeScenario.titleSo : activeScenario.titleEn;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          targetLanguage: currentLang.name,
          nativeLanguage: isSomali ? 'Somali' : 'English',
          level,
          scenario: `${scenarioTitle}`,
          tutorName: 'Moke E',
          learningFocus: learningFocus || null,
          adaptiveContext,
          recommendedScenario: activeScenarioId === recommendedScenario.scenarioId,
          sessionPerformance: {
            turns: sessionTurns,
            corrections: sessionCorrections,
          },
          nextTask,
          masteryGuidance,
        }),
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      const tutorMsg: ChatMessage = {
        id: 'tutor-' + Date.now(),
        role: 'tutor',
        text: data.reply || "That's good! Let's continue.",
        translation: data.translation,
        phonetic: data.phonetic,
        feedback: data.feedback,
        correction: data.correction as LearnerCorrection | undefined,
        focusResult: data.focusResult as FocusPracticeResult | undefined,
        taskResult: data.taskResult,
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, tutorMsg]);

      if (tutorMsg.correction?.detected && tutorMsg.correction.natural) {
        setLearnerWeaknesses(rememberCorrection(tutorMsg.correction));
      }
      const focusPassed = learningFocus ? tutorMsg.focusResult?.passed === true : false;
      if (tutorMsg.taskResult?.outcome && nextTask.type) {
        recordAdaptiveTaskOutcome(
          tutorMsg.taskResult.skill || adaptiveContext.weakestSkill,
          nextTask.type,
          tutorMsg.taskResult.outcome,
        );
      }
      const corrected = Boolean(tutorMsg.correction?.detected && tutorMsg.correction.natural);
      const nextTurns = sessionTurns + 1;
      const nextCorrections = sessionCorrections + (corrected ? 1 : 0);
      const nextFocusSuccesses = focusPassed ? Math.min(focusSuccesses + 1, 2) : focusSuccesses;
      if (focusPassed) setFocusSuccesses(nextFocusSuccesses);
      setSessionTurns(nextTurns);
      setSessionCorrections(nextCorrections);
      const nextContext = getAdaptivePracticeContext(level, nextFocusSuccesses, nextTurns, nextCorrections);
      setAdaptiveContext(nextContext);
      onRecordFeedback?.({
        corrected,
        focusArea: tutorMsg.correction?.focusArea,
        focusPassed,
      });

      if (autoPlayAudio) {
        await handleSpeak(tutorMsg.text, tutorMsg.id);
      }
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: 'fallback-' + Date.now(),
        role: 'tutor',
        text: 'I understood what you said! Let us continue practicing ' + currentLang.name + '.',
        translation: isSomali
          ? 'Waan fahmay waxaad tiri! Aan sii wadno barashada ' + currentLang.nameSo + '.'
          : 'I understood! Let us keep speaking.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {learningFocus && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {isSomali ? 'Ku celcelin diirad leh' : 'Focused practice'} · {learningFocus.skill}
              </p>
              <p className="mt-1 text-sm font-semibold text-text-primary">
                {learningFocus.weakness} → {learningFocus.correction}
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">{learningFocus.practicePrompt}</p>
            </div>
            <button
              type="button"
              onClick={onExitFocus}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-muted hover:bg-app-surface hover:text-text-primary"
            >
              {isSomali ? 'Ka bax' : 'Exit'}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-primary/10 pt-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-primary">{focusSuccesses}/2</span>
              {isSomali ? 'guulo cusub' : 'successful new sentences'}
            </div>
            {focusSuccesses >= 2 && (
              <button
                type="button"
                onClick={onExitFocus}
                className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover"
              >
                {isSomali ? 'Dhammaystir' : 'Finish focus'}
              </button>
            )}
          </div>
          {focusSuccesses >= 2 && (
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-xs font-semibold text-primary">
              🎯 {isSomali ? 'Waad baratay qaabkan. Waxaad si sax ah ugu adeegsatay laba jumladood oo cusub.' : 'You have got this pattern. You used it correctly in two new sentences.'}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">
            {isSomali ? 'Tababar la qabsanaya' : 'Adaptive practice'}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-text-primary">
            {isSomali ? 'Xirfadda ugu baahan tababar' : 'Next skill'} · {adaptiveContext.weakestSkill}
          </p>
        </div>
        {activeScenarioId !== recommendedScenario.scenarioId && (
          <button
            type="button"
            onClick={() => setActiveScenarioId(recommendedScenario.scenarioId)}
            className="shrink-0 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
          >
            {isSomali ? 'Dooro talada' : 'Use recommendation'}
          </button>
        )}
      </div>
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs leading-5 text-text-secondary">
        <span className="font-semibold text-primary">{isSomali ? 'Talo:' : 'Recommendation:'}</span>{' '}
        {isSomali ? 'Mawduucan wuxuu ku salaysan yahay xirfaddaada hadda iyo waxqabadkaaga.' : recommendedScenario.reason}
      </div>
      <div className="rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-xs leading-5 text-text-secondary">
        <span className="font-semibold text-text-primary">{isSomali ? 'Hawlta xigta:' : 'Next task:'}</span>{' '}
        {nextTask.intent}
      </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label={isSomali ? 'Mawduucyada' : 'Conversation topics'}>
        <span className="shrink-0 text-xs font-semibold text-text-muted">{isSomali ? 'Mawduuca' : 'Topic'}</span>
        {CONVERSATION_SCENARIOS.map((sc) => {
          const selected = sc.id === activeScenarioId;
          return <button key={sc.id} onClick={() => setActiveScenarioId(sc.id)}
            className={cn('flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition',
              selected ? 'border-primary bg-primary text-white shadow-sm' : 'border-app-border bg-app-surface text-text-secondary hover:bg-app-elevated hover:text-text-primary')}>
            <span>{sc.icon}</span><span>{isSomali ? sc.titleSo : sc.titleEn}</span>
          </button>;
        })}
      </div>

      <div className="flex min-h-[520px] flex-col overflow-hidden rounded-3xl border border-app-border bg-app-surface shadow-elevation-md">
        <div ref={chatScrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isPlaying = playingMsgId === msg.id;
            return <div key={msg.id} className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
              {!isUser && <div className="shrink-0"><MokeAvatar size="sm" isSpeaking={isPlaying} /></div>}
              <div className={cn('max-w-[90%] space-y-2 sm:max-w-[72%]', isUser && 'flex flex-col items-end')}>
                <div className={cn('rounded-2xl px-4 py-3 text-sm leading-6',
                  isUser ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-app-border bg-app-elevated text-text-primary')}>
                  <p className="font-medium">{msg.text}</p>
                  {!isUser && msg.focusResult?.passed && <div className="mb-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">{isSomali ? '🎯 Waad qabatay! Qaabkan si sax ah ayaad u adeegsatay.' : '🎯 You nailed it! You used the target pattern correctly.'}</div>}
                  {!isUser && msg.taskResult?.feedback && <div className={cn(
                    'mb-2 rounded-xl border px-3 py-2 text-xs leading-5',
                    msg.taskResult.outcome === 'success'
                      ? 'border-primary/20 bg-primary/10 text-primary'
                      : msg.taskResult.outcome === 'partial'
                        ? 'border-warning/20 bg-warning/10 text-text-secondary'
                        : 'border-app-border bg-app-surface text-text-secondary'
                  )}>
                    <span className="font-bold">
                      {msg.taskResult.outcome === 'success'
                        ? (isSomali ? '✓ Hawsha waa sax' : '✓ Task completed')
                        : msg.taskResult.outcome === 'partial'
                          ? (isSomali ? 'Wax yar ayaa ka dhiman' : 'Almost there')
                          : (isSomali ? 'Aan mar kale isku dayno' : 'Let’s try it again')}
                    </span>{' '}
                    {msg.taskResult.feedback}
                  </div>}
                  {!isUser && msg.translation && <p className="mt-2 border-t border-app-border pt-2 text-xs text-text-secondary">{msg.translation}</p>}
                </div>
                {!isUser && <div className="flex items-center gap-4 px-1 text-xs text-text-muted">
                  <button onClick={() => handleSpeak(msg.text, msg.id)} className={cn('flex items-center gap-1.5 font-semibold hover:text-primary', isPlaying && 'text-primary')}>
                    <Volume2 className="h-3.5 w-3.5" />{isPlaying ? (isSomali ? 'Wuu hadlayaa...' : 'Playing...') : (isSomali ? 'Dhegayso' : 'Listen')}
                  </button>
                  <button onClick={() => onSendToPronunciationLab(msg.text)} className="ml-auto flex items-center gap-1.5 font-semibold hover:text-primary">
                    <Sparkles className="h-3.5 w-3.5" />{isSomali ? 'Ku celi' : 'Practice'}
                  </button>
                </div>}
                {!isUser && msg.suggestedReplies?.length ? <div className="flex flex-wrap gap-2 pt-1">
                  {msg.suggestedReplies.map((reply, idx) => <button key={idx} onClick={() => handleSendMessage(reply.text)}
                    className="rounded-xl border border-app-border bg-app-surface px-3 py-2 text-xs font-semibold text-text-secondary hover:border-primary/40 hover:text-text-primary">“{reply.text}”</button>)}
                </div> : null}
              </div>
            </div>;
          })}
          {isListening && <div className="flex justify-end"><div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><span className="h-2 w-2 animate-ping rounded-full bg-primary"/>{isSomali?'Wuu dhagaysanayaa...':'Listening...'}</div>
            <p className="mt-1 font-semibold text-text-primary">{interimTranscript || (isSomali ? 'Ku hadal...' : 'Speak now...')}</p>
          </div></div>}
          {isProcessingAudio && <div className="flex justify-end"><div className="flex items-center gap-2 rounded-xl border border-app-border bg-app-elevated px-3 py-2 text-xs text-text-secondary"><span className="h-2 w-2 animate-pulse rounded-full bg-primary"/>{isSomali?'Codkaaga ayaa la qorayaa...':'Transcribing...'}</div></div>}
          {isLoading && <div className="flex items-center gap-2 text-xs text-text-muted"><MokeAvatar size="sm" isSpeaking={true}/>{isSomali?'Moke E wuu ka jawaabayaa...':'Moke E is answering...'}</div>}
        </div>

        {micErrorMessage && <div className="flex items-center justify-between gap-3 border-t border-app-border bg-app-elevated px-4 py-3 text-xs text-warning">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{micErrorMessage}</span>
          <button onClick={() => setMicErrorMessage(null)} aria-label="Dismiss" className="text-text-muted">×</button>
        </div>}

        <div className="border-t border-app-border bg-app-surface p-3 sm:p-4">
          <form onSubmit={e => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
            <button type="button" onClick={handleToggleMic} disabled={isProcessingAudio}
              className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition',
                isListening ? 'bg-danger text-white ring-4 ring-danger/20' : 'bg-primary text-white shadow-md hover:bg-primary-hover active:scale-95')}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}>
              {isListening ? <MicOff className="h-5 w-5"/> : <Mic className="h-5 w-5"/>}
            </button>
            <input value={inputText} onChange={e=>setInputText(e.target.value)} placeholder={isSomali?'Qor ama hadal...':'Type or speak...'}
              className="min-w-0 flex-1 rounded-2xl border border-app-border bg-app-elevated px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/>
            <button type="submit" disabled={!inputText.trim() || isLoading} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-elevated text-text-primary disabled:opacity-30" aria-label="Send message">
              <Send className="h-5 w-5"/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
