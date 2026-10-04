import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Volume2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, LiveTranscriptItem, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { RobustVoiceRecorder, speakText } from '../utils/speech';

interface TranscriptionStudioProps {
  targetLang: TargetLanguageCode;
  appLang: AppLanguage;
  onSendToPronunciation: (phrase: string) => void;
  onIncrementPractice: () => void;
  onTriggerMicPermissionModal?: () => void;
}

export const TranscriptionStudio: React.FC<TranscriptionStudioProps> = ({
  targetLang,
  appLang,
  onSendToPronunciation,
  onIncrementPractice,
  onTriggerMicPermissionModal,
}) => {
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [transcriptItems, setTranscriptItems] = useState<LiveTranscriptItem[]>([]);
  const [micError, setMicError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const voiceRecorderRef = useRef<RobustVoiceRecorder | null>(null);

  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current) voiceRecorderRef.current.cancel();
    };
  }, []);

  const handleToggleListening = async () => {
    setMicError(null);

    if (isListening) {
      setIsListening(false);
      setIsProcessing(true);

      try {
        if (voiceRecorderRef.current) {
          const result = await voiceRecorderRef.current.stop();
          setInterimText('');
          setIsProcessing(false);

          if (result.text && result.text.trim()) {
            addTranscriptItem(result.text.trim());
          } else {
            setMicError(
              isSomali
                ? 'Cod cad lama maqal. Fadlan ku hadal mar kale.'
                : 'No clear speech detected. Please speak into the mic.'
            );
          }
        }
      } catch (err) {
        setIsProcessing(false);
      }
    } else {
      try {
        const recorder = new RobustVoiceRecorder(
          currentLang.speechCode,
          currentLang.name,
          (interim) => {
            setInterimText(interim);
          },
          (errType) => {
            setMicError(
              errType === 'permission_denied'
                ? isSomali
                  ? 'Fadlan browser-kaaga ka oggolow makarafoonka si aad ugu hadasho.'
                  : 'Please allow microphone access in your browser.'
                : isSomali
                ? 'Makarafoonka lama helin.'
                : 'Microphone not detected.'
            );
            if (onTriggerMicPermissionModal) onTriggerMicPermissionModal();
            setIsListening(false);
          }
        );

        voiceRecorderRef.current = recorder;
        await recorder.start();
        setIsListening(true);
        onIncrementPractice();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const addTranscriptItem = async (text: string) => {
    const newItem: LiveTranscriptItem = {
      id: 'trans-' + Date.now(),
      text,
      speaker: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscriptItems((prev) => [newItem, ...prev]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: `Translate to ${isSomali ? 'Somali' : 'English'}: "${text}"` }],
          targetLanguage: currentLang.name,
          nativeLanguage: isSomali ? 'Somali' : 'English',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const translation = data.translation || data.reply;
        setTranscriptItems((prev) =>
          prev.map((item) => (item.id === newItem.id ? { ...item, translation } : item))
        );
      }
    } catch (e) {}
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          {isSomali ? 'Qoraalka Hadalka (Dictation)' : 'Speech Dictation'}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted">
          {isSomali
            ? 'Hadalkaaga codka ah u rog qoraal toos ah adigoo adeegsanaya makarafoonka.'
            : 'Speak into the mic and have your speech converted to written text.'}
        </p>
      </div>

      {/* Main Dictation Card */}
      <div className="bg-app-surface border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl text-center">
        {/* Big Mic Button */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <button
            onClick={handleToggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-danger text-text-primary ring-8 ring-rose-500/30 animate-pulse scale-105'
                : isProcessing
                ? 'bg-app-elevated text-text-muted'
                : 'bg-primary hover:bg-primary-hover text-text-primary shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          </button>

          <p className="text-sm font-semibold text-text-secondary">
            {isListening
              ? isSomali ? 'Wuu dhagaysanayaa... Markaad dhameyso guji halkan' : 'Listening... Tap when done speaking'
              : isProcessing
              ? isSomali ? 'Qoraalka ayaa la diyaarinayaa...' : 'Transcribing voice...'
              : isSomali ? 'Guji makarafoonka oo hadal' : 'Tap to start speaking'}
          </p>
        </div>

        {/* Live Speaking Text Display */}
        {isListening && (
          <div className="p-4 bg-app-elevated rounded-2xl text-slate-100 text-sm font-medium border border-app-border animate-pulse">
            "{interimText || (isSomali ? 'Ku hadal cod caadi ah...' : 'Speak clearly...')}"
          </div>
        )}

        {/* Mic Error Banner */}
        {micError && (
          <div className="bg-amber-950/60 border border-amber-800/60 text-warning text-xs rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
              <span>{micError}</span>
            </div>
            {onTriggerMicPermissionModal && (
              <button
                onClick={onTriggerMicPermissionModal}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-text-primary font-bold rounded-xl text-xs transition-colors flex-shrink-0"
              >
                {isSomali ? 'Fur Makarafoonka' : 'Enable Mic'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transcriptions List */}
      {transcriptItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {isSomali ? 'Qoraalladii Hore:' : 'Transcriptions:'}
            </span>
            <button
              onClick={() => setTranscriptItems([])}
              className="text-xs text-text-muted hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isSomali ? 'Tirtir Dhammaan' : 'Clear all'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {transcriptItems.map((item) => (
              <div
                key={item.id}
                className="bg-app-surface border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-3 shadow-md"
              >
                <div className="space-y-1.5 flex-1">
                  <span className="text-[11px] text-text-muted block font-mono">
                    {item.timestamp}
                  </span>
                  <p className="text-text-primary font-medium text-sm sm:text-base leading-relaxed">
                    {item.text}
                  </p>
                  {item.translation && (
                    <p className="text-xs sm:text-sm text-text-secondary pt-2 border-t border-slate-800">
                      <span className="text-primary font-semibold mr-1">
                        {isSomali ? 'Turjumaad:' : 'Translation:'}
                      </span>
                      {item.translation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => speakText(item.text, currentLang.speechCode, currentLang.name, 1.0)}
                    className="p-2 text-text-muted hover:text-text-primary rounded-lg bg-app-elevated hover:bg-slate-750 transition-colors"
                    title="Play Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.text, item.id)}
                    className="p-2 text-text-muted hover:text-text-primary rounded-lg bg-app-elevated hover:bg-slate-750 transition-colors"
                    title="Copy"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
