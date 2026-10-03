import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  RotateCcw,
  Languages,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, ChatMessage, SkillLevel, TargetLanguageCode } from '../types';
import { CONVERSATION_SCENARIOS, SUPPORTED_LANGUAGES } from '../utils/languages';
import { RobustVoiceRecorder, speakText } from '../utils/speech';
import { VoiceCircle } from './VoiceCircle';
import { MokeAvatar } from './MokeAvatar';

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
                isSomali
                  ? 'Makarafoonka lama helin.'
                  : 'Microphone not detected.'
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
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[820px] max-w-4xl mx-auto w-full gap-3">
      {/* Calm Scenario Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-1">
          {isSomali ? 'Mawduuca:' : 'Topic:'}
        </span>
        {CONVERSATION_SCENARIOS.map((sc) => {
          const isSelected = sc.id === activeScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <span>{sc.icon}</span>
              <span>{isSomali ? sc.titleSo : sc.titleEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversation Box */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-xl">
        {/* Messages Feed */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isPlaying = playingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <MokeAvatar size="sm" isSpeaking={isPlaying} className="mt-1 shadow-sm" />
                )}

                <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                  <div
                    className={`rounded-2xl p-4 sm:p-4.5 text-sm sm:text-base leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    <p className="font-medium">{msg.text}</p>

                    {/* Clear Somali / English translation right under tutor text */}
                    {!isUser && msg.translation && (
                      <p className="mt-2.5 pt-2.5 border-t border-slate-700/60 text-xs sm:text-sm text-slate-300">
                        {msg.translation}
                      </p>
                    )}
                  </div>

                  {/* Tutor Audio and Practice actions */}
                  {!isUser && (
                    <div className="flex items-center gap-3 text-xs text-slate-400 px-1">
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        className={`hover:text-blue-400 flex items-center gap-1.5 font-medium transition-colors ${
                          isPlaying ? 'text-blue-400 font-bold' : ''
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? (isSomali ? 'Wuu hadlayaa...' : 'Playing...') : (isSomali ? 'Dhegayso' : 'Listen')}</span>
                      </button>

                      <button
                        onClick={() => onSendToPronunciationLab(msg.text)}
                        className="hover:text-blue-400 flex items-center gap-1.5 font-medium transition-colors ml-auto"
                      >
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>{isSomali ? 'Ku celceli weedhan' : 'Practice this phrase'}</span>
                      </button>
                    </div>
                  )}

                  {/* Clean Suggested replies */}
                  {!isUser && msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {msg.suggestedReplies.map((r, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSendMessage(r.text)}
                          className="text-xs bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl px-3 py-1.5 transition-colors text-left"
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

          {/* Live speech preview */}
          {isListening && (
            <div className="flex justify-end">
              <div className="bg-blue-950/80 border border-blue-500/50 text-blue-100 rounded-2xl rounded-br-none p-4 text-sm max-w-[75%]">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{isSomali ? 'Wuu dhagaysanayaa... (Ku hadal)' : 'Listening... Speak now'}</span>
                </div>
                <p className="font-semibold text-white">
                  {interimTranscript || (isSomali ? 'Ku hadal cod caadi ah...' : 'Speak now...')}
                </p>
              </div>
            </div>
          )}

          {/* Processing Audio state */}
          {isProcessingAudio && (
            <div className="flex justify-end">
              <div className="bg-slate-800 border border-slate-700 text-slate-300 rounded-2xl p-3 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>{isSomali ? 'Codkaaga ayaa la qorayaa...' : 'Transcribing voice...'}</span>
              </div>
            </div>
          )}

          {/* Thinking state */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <MokeAvatar size="sm" isSpeaking={true} />
              <span>{isSomali ? 'Moke E wuu ka jawaabayaa...' : 'Moke E is answering...'}</span>
            </div>
          )}
        </div>

        {/* Mic Error Banner */}
        {micErrorMessage && (
          <div className="bg-amber-950/50 border-t border-amber-800/60 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 flex-1 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{micErrorMessage}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onTriggerMicPermissionModal}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                {isSomali ? 'Fur Makarafoonka' : 'Enable Mic'}
              </button>
              <button onClick={() => setMicErrorMessage(null)} className="text-amber-400 hover:text-white">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Clean, Human-Centric Input & Big Voice Button */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            {/* Big Friendly Mic Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              disabled={isProcessingAudio}
              className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/40 animate-pulse scale-105'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 active:scale-95'
              }`}
              title={
                isListening
                  ? isSomali ? 'Jooji' : 'Stop'
                  : isSomali ? 'Guji oo hadal' : 'Tap to speak'
              }
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? isSomali ? 'Wuu dhagaysanayaa...' : 'Listening in real-time...'
                  : isSomali
                  ? `Qor fariin ama guji makarafoonka...`
                  : `Type message or tap mic to speak...`
              }
              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />

            {/* Send */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-blue-600 hover:text-white disabled:opacity-30 text-slate-300 border border-slate-700 transition-colors"
              title={isSomali ? 'Dir' : 'Send'}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Quick test prompt shortcut */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
            <span>
              {isSomali
                ? 'Guji makarafoonka buluugga ah si aad toos ugu hadasho.'
                : 'Tap the blue mic button to speak naturally.'}
            </span>
            <button
              type="button"
              onClick={() => handleSendMessage(currentLang.samplePhrases[0]?.phrase || 'Hello')}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              ⚡ {isSomali ? 'Tijaabi weedh' : 'Test a phrase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
