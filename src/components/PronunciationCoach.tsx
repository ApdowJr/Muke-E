import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { AppLanguage, PronunciationResult, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { RobustVoiceRecorder, speakText } from '../utils/speech';
import { cn } from '../utils/cn';

interface PronunciationCoachProps {
  targetLang: TargetLanguageCode;
  appLang: AppLanguage;
  initialPhrase?: string;
  onIncrementPractice: (score?: number) => void;
  onTriggerMicPermissionModal?: () => void;
}

export const PronunciationCoach: React.FC<PronunciationCoachProps> = ({
  targetLang,
  appLang,
  initialPhrase = '',
  onIncrementPractice,
  onTriggerMicPermissionModal,
}) => {
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [selectedPhrase, setSelectedPhrase] = useState(
    initialPhrase || currentLang.samplePhrases[0]?.phrase || 'Hello, how are you?'
  );
  const [customInput, setCustomInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationResult | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const voiceRecorderRef = useRef<RobustVoiceRecorder | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialPhrase) {
      setSelectedPhrase(initialPhrase);
      setEvaluationResult(null);
      setUserAudioUrl(null);
    }
  }, [initialPhrase]);

  useEffect(() => {
    if (!initialPhrase) {
      setSelectedPhrase(currentLang.samplePhrases[0]?.phrase || 'Hello');
      setPhraseIndex(0);
      setEvaluationResult(null);
      setUserAudioUrl(null);
    }
  }, [targetLang]);

  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current) voiceRecorderRef.current.cancel();
    };
  }, []);

  const handlePlayNative = async (speed: number = 1.0) => {
    setIsPlayingNative(true);
    try {
      await speakText(selectedPhrase, currentLang.speechCode, currentLang.name, speed);
    } finally {
      setIsPlayingNative(false);
    }
  };

  const handleNextPhrase = () => {
    const nextIdx = (phraseIndex + 1) % currentLang.samplePhrases.length;
    setPhraseIndex(nextIdx);
    setSelectedPhrase(currentLang.samplePhrases[nextIdx].phrase);
    setEvaluationResult(null);
    setUserAudioUrl(null);
    setMicError(null);
  };

  const handleStartRecording = async () => {
    setMicError(null);
    setUserAudioUrl(null);
    setEvaluationResult(null);

    try {
      const recorder = new RobustVoiceRecorder(
        currentLang.speechCode,
        currentLang.name,
        () => {},
        (errType) => {
          setMicError(
            errType === 'permission_denied'
              ? isSomali
                ? 'Fadlan browser-kaaga ka oggolow makarafoonka si aad ugu hadasho.'
                : 'Please allow microphone access in your browser.'
              : isSomali
              ? 'Makarafoonka lama helin.'
              : 'Microphone device not found.'
          );
          if (onTriggerMicPermissionModal) onTriggerMicPermissionModal();
          setIsRecording(false);
        }
      );

      voiceRecorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setIsEvaluating(true);

    try {
      if (voiceRecorderRef.current) {
        const result = await voiceRecorderRef.current.stop();

        if (result.audioBlob) {
          setUserAudioUrl(URL.createObjectURL(result.audioBlob));
        }

        const spoken = (result.text || '').trim();
        await evaluatePronunciation(spoken, result.audioBase64 || undefined, result.mimeType);
      }
    } catch (err) {
      setIsEvaluating(false);
    }
  };

  const evaluatePronunciation = async (spokenText: string, audioBase64?: string, mimeType?: string) => {
    try {
      const res = await fetch('/api/pronunciation-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetText: selectedPhrase,
          spokenText: spokenText,
          targetLanguage: currentLang.name,
          nativeLanguage: isSomali ? 'Somali' : 'English',
          audioBase64: audioBase64 || null,
          mimeType: mimeType || 'audio/webm',
        }),
      });

      if (!res.ok) throw new Error('Evaluation error');
      const data: PronunciationResult = await res.json();
      setEvaluationResult(data);

      if (data.overallScore !== undefined) {
        onIncrementPractice(data.overallScore);
      }
    } catch (e) {
      console.warn('Evaluation fallback');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePlayUserAudio = () => {
    if (!userAudioUrl) return;
    if (isPlayingUser && userAudioRef.current) {
      userAudioRef.current.pause();
      setIsPlayingUser(false);
      return;
    }
    const audio = new Audio(userAudioUrl);
    userAudioRef.current = audio;
    setIsPlayingUser(true);
    audio.onended = () => setIsPlayingUser(false);
    audio.play().catch(() => setIsPlayingUser(false));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {isSomali ? 'Saxidda Dhawaaqa' : 'Pronunciation Practice'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          {isSomali
            ? 'Dhegayso weedha, ku celi codkaaga, oo hel qiimayn dhab ah.'
            : 'Listen to the phrase, repeat it aloud, and receive authentic feedback.'}
        </p>
      </div>

      {/* Main Practice Panel */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden flex flex-col shadow-md">
        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Target Phrase Section */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {isSomali ? 'Ku Celi Weedhan:' : 'Pronounce this:'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mt-2">
                "{selectedPhrase}"
              </h3>
            </div>

            {/* Listen Button */}
            <button
              onClick={() => handlePlayNative(1.0)}
              disabled={isPlayingNative}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors border',
                isPlayingNative
                  ? 'bg-blue-600/20 border-blue-500/30 text-blue-300'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
              )}
            >
              <Volume2 className={cn('w-4 h-4', isPlayingNative && 'animate-bounce text-blue-400')} />
              <span>{isPlayingNative ? (isSomali ? 'Wuu yeerayaa...' : 'Playing...') : (isSomali ? 'Dhegayso' : 'Listen')}</span>
            </button>
          </div>

          {/* Primary Microphone Action */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isEvaluating}
              className={cn(
                'w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all font-semibold text-base shadow-lg',
                isRecording
                  ? 'bg-rose-600 text-white ring-8 ring-rose-500/30 animate-pulse scale-105'
                  : isEvaluating
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-105 active:scale-95'
              )}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff className="w-10 h-10 sm:w-12 sm:h-12" /> : <Mic className="w-10 h-10 sm:w-12 sm:h-12" />}
            </button>

            <p className="text-sm sm:text-base font-semibold text-slate-200 text-center">
              {isRecording
                ? isSomali
                  ? 'Wuu duubayaa... Markaad dhameyso guji halkan'
                  : 'Recording... Tap when finished'
                : isEvaluating
                ? isSomali
                  ? 'Waxaa socda qiimaynta..'
                  : 'Evaluating your pronunciation...'
                : isSomali
                ? 'Guji makarafoonka oo ku celi'
                : 'Tap mic and repeat aloud'}
            </p>
          </div>

          {/* Error Banner */}
          {micError && (
            <div className="bg-amber-950/40 border border-amber-800/30 text-amber-200 text-xs rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{micError}</span>
              </div>
              {onTriggerMicPermissionModal && (
                <button
                  onClick={onTriggerMicPermissionModal}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex-shrink-0"
                >
                  {isSomali ? 'Fur' : 'Enable'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Recording Playback */}
        {userAudioUrl && !isRecording && (
          <div className="border-t border-slate-800 px-6 sm:px-8 py-4">
            <button
              onClick={handlePlayUserAudio}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-colors"
            >
              {isPlayingUser ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSomali ? 'Dhegayso sidaad u tiri' : 'Play your recording'}</span>
            </button>
          </div>
        )}

        {/* Evaluation Result */}
        {evaluationResult && !isEvaluating && (
          <div className="border-t border-slate-800 p-6 sm:p-8 space-y-5 text-left">
            {/* Score Display */}
            <div className={cn(
              'rounded-xl p-4 sm:p-5 border space-y-3',
              evaluationResult.overallScore >= 90
                ? 'bg-emerald-950/30 border-emerald-500/30'
                : evaluationResult.overallScore >= 75
                ? 'bg-blue-950/30 border-blue-500/30'
                : evaluationResult.overallScore >= 50
                ? 'bg-amber-950/30 border-amber-500/30'
                : 'bg-rose-950/30 border-rose-500/30'
            )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {isSomali ? 'Natiijada:' : 'Score:'}
                  </p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">
                    {isSomali ? evaluationResult.summaryInSomali : evaluationResult.summaryInEnglish}
                  </p>
                </div>
                <div className={cn(
                  'text-3xl sm:text-4xl font-black px-4 py-2 rounded-lg border',
                  evaluationResult.overallScore >= 90
                    ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40'
                    : evaluationResult.overallScore >= 75
                    ? 'text-blue-400 bg-blue-950/40 border-blue-500/40'
                    : evaluationResult.overallScore >= 50
                    ? 'text-amber-400 bg-amber-950/40 border-amber-500/40'
                    : 'text-rose-400 bg-rose-950/40 border-rose-500/40'
                )}
                >
                  {evaluationResult.overallScore}%
                </div>
              </div>

              {evaluationResult.recognizedText && (
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                  <span className="font-semibold text-slate-300">
                    {isSomali ? 'Waxa la maqlay: ' : 'Heard: '}
                  </span>
                  "{evaluationResult.recognizedText}"
                </p>
              )}
            </div>

            {/* Word-by-word Breakdown */}
            {evaluationResult.words && evaluationResult.words.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {isSomali ? 'Erayada:' : 'Word Breakdown:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {evaluationResult.words.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => speakText(w.word, currentLang.speechCode, currentLang.name, 0.85)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1',
                        w.status === 'good'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                          : w.status === 'fair'
                          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-900/40'
                      )}
                      title={w.tip || ''}
                    >
                      <span>{w.word}</span>
                      <Volume2 className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Next Phrase Button */}
            <button
              onClick={handleNextPhrase}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-blue-600/20"
            >
              <span>{isSomali ? 'Weedha Xigta' : 'Next Phrase'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Phrase Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={isSomali ? 'Ama qor weedh aad adigu rabto...' : 'Or enter a custom phrase...'}
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
        <button
          onClick={() => {
            if (customInput.trim()) {
              setSelectedPhrase(customInput.trim());
              setCustomInput('');
              setEvaluationResult(null);
              setUserAudioUrl(null);
            }
          }}
          disabled={!customInput.trim()}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors"
        >
          {isSomali ? 'Dooro' : 'Set'}
        </button>
      </div>
    </div>
  );
};
