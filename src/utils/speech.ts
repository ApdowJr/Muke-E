// Robust Speech Recognition, Audio Recording & Synthesis for Moke E

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface VoiceRecordResult {
  text: string;
  audioBlob: Blob | null;
  audioBase64: string | null;
  mimeType: string;
}

export class RobustVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recognition: any = null;
  private webSpeechFinalText: string = '';
  private webSpeechInterimText: string = '';
  public isRecording = false;

  constructor(
    private langCode: string,
    private targetLanguageName: string,
    private onInterim: (text: string) => void,
    private onError: (err: string) => void
  ) {}

  public setLanguage(code: string, name: string) {
    this.langCode = code;
    this.targetLanguageName = name;
    if (this.recognition) {
      this.recognition.lang = code;
    }
  }

  async start(): Promise<MediaStream> {
    this.audioChunks = [];
    this.webSpeechFinalText = '';
    this.webSpeechInterimText = '';

    // 1. Request microphone access
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      console.warn('Microphone permission denied or device unavailable:', err);
      this.onError(err.name === 'NotAllowedError' ? 'permission_denied' : 'mic_unavailable');
      throw err;
    }

    // 2. Setup MediaRecorder with best supported mimeType
    const mimeCandidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      '',
    ];
    let chosenMime = '';
    for (const m of mimeCandidates) {
      if (!m || MediaRecorder.isTypeSupported(m)) {
        chosenMime = m;
        break;
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(
        this.stream,
        chosenMime ? { mimeType: chosenMime } : undefined
      );

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250);
      this.isRecording = true;
    } catch (recorderErr) {
      console.warn('MediaRecorder init error:', recorderErr);
    }

    // 3. Simultaneously start Web Speech recognition for instant interim display
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = this.langCode;

        rec.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              this.webSpeechFinalText += ' ' + transcript;
            } else {
              interim += transcript;
            }
          }
          this.webSpeechInterimText = interim;
          this.onInterim((this.webSpeechFinalText + ' ' + interim).trim());
        };

        rec.onerror = (e: any) => {
          // If WebSpeech errors (e.g. "network" or "no-speech" in iframes), ignore silently;
          // MediaRecorder will still provide the audio blob for Gemini server transcription!
          console.debug('WebSpeech non-fatal error:', e.error);
        };

        rec.onend = () => {
          // recognition ended
        };

        rec.start();
        this.recognition = rec;
      } catch (speechErr) {
        console.debug('Web Speech recognition not available or blocked in this frame', speechErr);
      }
    }

    return this.stream;
  }

  async stop(): Promise<VoiceRecordResult> {
    this.isRecording = false;

    // Stop Web Speech
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

    // Stop MediaRecorder and collect audio
    let audioBlob: Blob | null = null;
    let base64Audio: string | null = null;
    let mimeType = 'audio/webm';

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        if (!this.mediaRecorder) return resolve();
        this.mediaRecorder.onstop = () => resolve();
        try {
          this.mediaRecorder.stop();
        } catch (e) {
          resolve();
        }
      });
      mimeType = this.mediaRecorder.mimeType || 'audio/webm';
    }

    if (this.audioChunks.length > 0) {
      audioBlob = new Blob(this.audioChunks, { type: mimeType });
      base64Audio = await blobToBase64(audioBlob);
    }

    // Stop all microphone tracks
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Decide transcription text:
    let recognizedText = (this.webSpeechFinalText || this.webSpeechInterimText).trim();

    // If Web Speech yielded empty text, but we have audio, transcribe with server Gemini!
    if (!recognizedText && base64Audio) {
      try {
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType,
            targetLanguage: this.targetLanguageName,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.transcript) {
            recognizedText = data.transcript.trim();
          }
        }
      } catch (transcribeErr) {
        console.warn('Fallback server transcription error:', transcribeErr);
      }
    }

    return {
      text: recognizedText,
      audioBlob,
      audioBase64: base64Audio,
      mimeType,
    };
  }

  public cancel() {
    this.isRecording = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Text-to-Speech Helper with authentic native audio streams and fallback
let currentAudioElement: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  langCode: string = 'en-US',
  targetLanguageName: string = 'English',
  rate: number = 1.0
): Promise<void> {
  // Cancel any currently playing speech
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const cleanText = text.trim();
  if (!cleanText) return;

  // 1. Play Authentic Native Audio via Server Proxy
  try {
    const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langCode)}`;
    const audio = new Audio(ttsUrl);
    currentAudioElement = audio;
    audio.playbackRate = rate;

    const playPromise = new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        currentAudioElement = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudioElement = null;
        reject(new Error('Audio playback error'));
      };
    });

    await audio.play();
    return await playPromise;
  } catch (err) {
    // 2. Fallback to Browser SpeechSynthesis with pre-warmed native voices
    return speakWithBrowser(cleanText, langCode, rate);
  }
}

function speakWithBrowser(text: string, langCode: string, rate: number = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = rate;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const clean = langCode.toLowerCase();
        const base = clean.split('-')[0];

        // 1. Exact locale match (e.g. ar-SA, fr-FR, es-ES, it-IT, de-DE)
        let matched = voices.find((v) => v.lang.toLowerCase() === clean);

        // 2. Base language match
        if (!matched) {
          matched = voices.find((v) => v.lang.toLowerCase().startsWith(base));
        }

        // 3. For Somali: if no 'so' voice exists, prefer East African / Romance voice with pure vowels
        if (!matched && base === 'so') {
          matched = voices.find((v) => v.lang.startsWith('sw') || v.lang.startsWith('it'));
        }

        if (matched) {
          utterance.voice = matched;
        }
      }
    };

    pickVoice();
    if (!utterance.voice && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
