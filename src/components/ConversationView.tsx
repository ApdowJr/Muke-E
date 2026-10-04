import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, ChatMessage, SkillLevel, TargetLanguageCode } from '../types';
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
  onTriggerMicPermissionModal,
}) => {
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  const [activeScenarioId, setActiveScenarioId] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const voiceRecorderRef = useRef<RobustVoiceRecorder | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeScenario =
    CONVERSATION_SCENARIOS.find((s) => s.id === activeScenarioId) ||
    CONVERSATION_SCENARIOS[0];

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
        suggestedReplies: data.suggestedReplies || [],
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, tutorMsg]);

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
      {/* Scenario Selector - Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6 scrollbar-hide">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
          {isSomali ? 'Mawduuca:' : 'Topic:'}
        </span>
        {CONVERSATION_SCENARIOS.map((sc) => {
          const isSelected = sc.id === activeScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 flex-shrink-0',
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white'
              )}
            >
              <span>{sc.icon}</span>
              <span>{isSomali ? sc.titleSo : sc.titleEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversation Panel */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden flex flex-col h-[calc(100vh-360px)] max-h-[600px] shadow-md">
        {/* Messages Area */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-5"
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isPlaying = playingMsgId === msg.id;

            return (
              <div key={msg.id} className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
                {!isUser && (
                  <div className="flex-shrink-0">
                    <MokeAvatar size="sm" isSpeaking={isPlaying} className="shadow-sm" />
                  </div>
                )}

                <div className={cn('max-w-[85%] sm:max-w-[70%] space-y-2', isUser && 'flex flex-col items-end')}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-none'
                    )}
                  >
                    <p className="font-medium">{msg.text}</p>
                    {!isUser && msg.translation && (
                      <p className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-300">
                        {msg.translation}
                      </p>
                    )}
                  </div>

                  {/* Tutor Actions */}
                  {!isUser && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={cn(
                          'hover:text-blue-400 flex items-center gap-1.5 font-medium transition-colors',
                          isPlaying && 'text-blue-400'
                        )}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? (isSomali ? 'Wuu hadlayaa...' : 'Playing...') : (isSomali ? 'Dhegayso' : 'Listen')}</span>
                      </button>
                      <button
                        onClick={() => onSendToPronunciationLab(msg.text)}
                        className="hover:text-blue-400 flex items-center gap-1.5 font-medium transition-colors ml-auto"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>{isSomali ? 'Ku celi' : 'Practice'}</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Replies */}
                  {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedReplies.map((r, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(r.text)}
                          className="text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/50 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          "{r.text}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Listening State */}
          {isListening && (
            <div className="flex justify-end">
              <div className="bg-blue-950/40 border border-blue-500/30 text-blue-100 rounded-2xl rounded-br-none p-4 max-w-[70%] text-sm space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{isSomali ? 'Wuu dhagaysanayaa...' : 'Listening...'}</span>
                </div>
                <p className="font-semibold text-white">
                  {interimTranscript || (isSomali ? 'Ku hadal...' : 'Speak now...')}
                </p>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessingAudio && (
            <div className="flex justify-end">
              <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl p-3 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>{isSomali ? 'Codkaaga ayaa la qorayaa...' : 'Transcribing...'}</span>
              </div>
            </div>
          )}

          {/* AI Thinking */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <MokeAvatar size="sm" isSpeaking={true} />
              <span>{isSomali ? 'Moke E wuu ka jawaabayaa...' : 'Moke E is answering...'}</span>
            </div>
          )}
        </div>

        {/* Error Banner */}
        {micErrorMessage && (
          <div className="bg-amber-950/40 border-t border-amber-800/30 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 flex-1">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{micErrorMessage}</span>
            </span>
            <button
              onClick={() => setMicErrorMessage(null)}
              className="text-amber-400 hover:text-amber-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-slate-800 bg-slate-900 p-4 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <button
              type="button"
              onClick={handleToggleMic}
              disabled={isProcessingAudio}
              className={cn(
                'p-3 sm:p-3.5 rounded-2xl flex items-center justify-center transition-all flex-shrink-0',
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/30 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95'
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isSomali ? 'Qor ama hadal...' : 'Type or speak...'}
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 sm:p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white border-0 transition-colors flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
