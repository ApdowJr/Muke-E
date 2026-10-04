export type TargetLanguageCode =
  | 'en'
  | 'ar'
  | 'so'
  | 'fr'
  | 'es'
  | 'de'
  | 'tr'
  | 'it'
  | 'zh'
  | 'ja'
  | 'sw'
  | 'ko';

export type AppLanguage = 'so' | 'en';

export interface LanguageInfo {
  code: TargetLanguageCode;
  name: string;
  nameSo: string;
  nativeName: string;
  flag: string;
  speechCode: string; // for Web Speech Recognition / Synthesis
  welcomeMessage: string;
  welcomeMessageSo: string;
  samplePhrases: {
    phrase: string;
    translationSo: string;
    translationEn: string;
    phonetic: string;
  }[];
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LearningFocus {
  skill: string;
  weakness: string;
  correction: string;
  practicePrompt: string;
}

export interface LearnerCorrection {
  detected: string;
  natural: string;
  explanation: string;
  focusArea: string;
  practicePrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  text: string;
  translation?: string;
  phonetic?: string;
  feedback?: string;
  correction?: LearnerCorrection;
  suggestedReplies?: { text: string; translation: string }[];
  audioUrl?: string;
  timestamp: number;
}

export interface WordPronunciationFeedback {
  word: string;
  status: 'good' | 'fair' | 'poor';
  ipa: string;
  tip: string;
}

export interface PronunciationResult {
  overallScore: number;
  accuracyGrade: string;
  targetPhonetic: string;
  summaryInSomali: string;
  summaryInEnglish: string;
  words: WordPronunciationFeedback[];
  articulatoryTips: string[];
  recognizedText?: string;
}

export interface PracticeDrill {
  phrase: string;
  translation: string;
  phonetic: string;
  focusArea: string;
  difficulty: string;
}

export interface LiveTranscriptItem {
  id: string;
  text: string;
  translation?: string;
  confidence?: number;
  timestamp: string;
  duration?: string;
  speaker: 'user' | 'system';
}

export type TabType = 'conversation' | 'pronunciation' | 'transcription' | 'phrasebook';
