import { AppLanguage } from '../types';

/**
 * Centralized bilingual copy (Somali + English) for the Muke E app shell.
 * Views keep their own inline domain copy; this covers navigation, states,
 * and shared UI so wording stays consistent across the product.
 */
export function makeStrings(appLang: AppLanguage) {
  const so = appLang === 'so';
  return {
    appName: 'Moke E',
    tagline: so ? 'Barashada Luqadaha & Dhawaaq Saxaha AI' : 'Language Learning & AI Pronunciation Coach',

    nav: {
      conversation: so ? 'Wada Hadal' : 'Conversation',
      pronunciation: so ? 'Sax Dhawaaqa' : 'Pronounce',
      transcription: so ? 'Qoraal Cod' : 'Dictate',
      phrasebook: so ? 'Eraybixinta' : 'Phrasebook',
      progress: so ? 'Horumarka' : 'Progress',
    },

    banner: {
      eyebrow: so ? 'Xirfaddaada Maanta' : 'Your practice today',
      title: so ? 'Aynu sii wadno barashada luqadda' : 'Keep learning with confidence',
      cta: (n: number) => (so ? `Fur Horumarka (${n})` : `Open Progress (${n})`),
    },

    mic: {
      statusGranted: so ? 'Makarafoonka wuu shaqaynayaa' : 'Microphone is ready',
      statusMissing: so ? 'Riix si aad u ogolaato makarafoonka' : 'Tap to allow microphone access',
    },

    settings: {
      title: so ? 'Habaynta' : 'Settings',
      level: so ? 'Heerka Luqadda' : 'Skill level',
      speed: so ? 'Xawaaraha Codka' : 'Voice speed',
      autoplay: so ? 'Toos u yeer codka' : 'Auto-play tutor audio',
      theme: so ? 'Muuqaalka' : 'Appearance',
      themeDark: so ? 'Madow' : 'Dark',
      themeLight: so ? 'Cadaan' : 'Light',
      levels: {
        Beginner: so ? 'Bilaabe' : 'Beginner',
        Intermediate: so ? 'Dhexe' : 'Intermediate',
        Advanced: so ? 'Sare' : 'Advanced',
      },
    },

    offline: {
      message: so
        ? 'Internet-ka lama xidhiidho. Isku xidh mar kale.'
        : 'You appear to be offline. Reconnect to continue.',
      retry: so ? 'Isku day mar kale' : 'Try again',
    },

    footer: {
      free: '100% Free',
      lessonsDone: (n: number) => (so ? `${n} layli la sameeyay` : `${n} sessions completed`),
    },
  } as const;
}

export type Strings = ReturnType<typeof makeStrings>;
