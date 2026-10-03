import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AppLanguage } from '../types';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLang: AppLanguage;
  onPermissionGranted: () => void;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  isOpen,
  onClose,
  appLang,
  onPermissionGranted,
}) => {
  const isSomali = appLang === 'so';
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testAudioLevel, setTestAudioLevel] = useState<number>(0);
  const [isTestingMic, setIsTestingMic] = useState(false);

  // Check initial permission status if browser supports query
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setStatus('granted');
          } else if (permissionStatus.state === 'denied') {
            setStatus('denied');
          } else {
            setStatus('idle');
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              setStatus('granted');
              onPermissionGranted();
            } else if (permissionStatus.state === 'denied') {
              setStatus('denied');
            }
          };
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const requestPermission = async () => {
    setStatus('requesting');
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Permission successfully granted!
      setStatus('granted');
      onPermissionGranted();

      // Run quick audio level meter to confirm mic is active
      setIsTestingMic(true);
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const interval = setInterval(() => {
        (analyser as any).getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setTestAudioLevel(Math.min(100, Math.round(avg * 1.5)));
      }, 100);

      // Stop test after 3 seconds
      setTimeout(() => {
        clearInterval(interval);
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close().catch(() => {});
        setIsTestingMic(false);
      }, 3500);
    } catch (err: any) {
      console.warn('Microphone permission request error:', err);
      setStatus('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          isSomali
            ? 'Ogolaanshaha makarafoonka waa la diiday ama browser-ka ayaa xidhay.'
            : 'Microphone permission was denied or blocked by the browser.'
        );
      } else {
        setErrorMessage(
          isSomali
            ? 'Qalabka makarafoonka lama helin ama qalab kale ayaa isticmaalaya.'
            : 'No microphone found or another application is using it.'
        );
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                {isSomali ? 'Ogolaanshaha Makarafoonka' : 'Microphone Permission'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isSomali ? 'Furo codka si aad Moke E ula hadasho' : 'Enable voice input to speak with Moke E'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content based on status */}
        {status === 'granted' ? (
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {isSomali ? 'Makarafoonku Si Guul Leh Ayuu U Furan Yahay!' : 'Microphone Access Granted!'}
              </h4>
              <p className="text-xs text-emerald-300 mt-1">
                {isSomali
                  ? 'Hadda waxaad si toos ah codkaaga ugula hadli kartaa Moke E!'
                  : 'You can now speak directly to Moke E in any language!'}
              </p>
            </div>

            {/* Live sound level bar */}
            {isTestingMic && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{isSomali ? 'Tijaabada codkaaga:' : 'Microphone test:'}</span>
                  <span className="text-emerald-400 font-bold">{testAudioLevel}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100 rounded-full"
                    style={{ width: `${Math.max(8, testAudioLevel)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors mt-2"
            >
              {isSomali ? 'Bilow Hadalka Hadda' : 'Start Speaking Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isSomali
                ? 'Moke E wuxuu u baahan yahay ogolaanshaha makarafoonka si uu codkaaga u maqlo, qoraal uga dhigo, dhawaaqaagana kuugu saxo.'
                : 'Moke E needs microphone permission to hear your voice, transcribe your speech, and evaluate your pronunciation.'}
            </p>

            {/* Primary Action Button to trigger browser prompt */}
            <button
              onClick={requestPermission}
              disabled={status === 'requesting'}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>
                {status === 'requesting'
                  ? isSomali ? 'Fadlan dooro "Allow" daaqadda browser-ka...' : 'Please select "Allow" in browser prompt...'
                  : isSomali ? 'Riix Halkan Si Aad U Furto Makarafoonka' : 'Click Here to Grant Permission'}
              </span>
            </button>

            {/* Step-by-step guidance if browser blocked it */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                {isSomali ? 'Haddii daaqaddu soo bixi weyso ama ay xidhan tahay:' : 'If blocked or no popup appears:'}
              </span>

              <ol className="space-y-2 text-slate-400 pl-4 list-decimal">
                <li>
                  <strong className="text-slate-300">
                    {isSomali ? 'Barta ciwaanka (Address Bar):' : 'In your address bar:'}
                  </strong>{' '}
                  {isSomali
                    ? 'Guji calaamadda qufulka 🔒 ama makarafoonka ee ku taal geeska bidix/midig.'
                    : 'Click the lock 🔒 or camera/mic icon on the browser address bar.'}
                </li>
                <li>
                  <strong className="text-slate-300">
                    {isSomali ? 'Dooro "Allow" (Oggolow):' : 'Select "Allow":'}
                  </strong>{' '}
                  {isSomali
                    ? 'Qaybta "Microphone" u beddel "Allow" ama "Oggolow".'
                    : 'Change "Microphone" setting to "Allow".'}
                </li>
                <li>
                  <strong className="text-slate-300">
                    {isSomali ? 'Dib u cusboonaysii:' : 'Reload or Recheck:'}
                  </strong>{' '}
                  {isSomali
                    ? 'Kadib guji badhanka hoose si aad dib ugu xaqiijiso.'
                    : 'Then click the button below to recheck.'}
                </li>
              </ol>

              <button
                onClick={requestPermission}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isSomali ? 'Dib U Hubi Ogolaanshaha' : 'Recheck Permission'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
