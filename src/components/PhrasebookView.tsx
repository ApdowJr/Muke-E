import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';
import { AppLanguage, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import { speakText } from '../utils/speech';

interface PhrasebookViewProps {
  targetLang: TargetLanguageCode;
  appLang: AppLanguage;
  onSendToPronunciation: (phrase: string) => void;
  onIncrementPractice: () => void;
}

interface PhraseItem {
  id: string;
  category: string;
  categorySo: string;
  phrase: string;
  translationSo: string;
  translationEn: string;
  phonetic: string;
  level: string;
}

export const PhrasebookView: React.FC<PhrasebookViewProps> = ({
  targetLang,
  appLang,
  onSendToPronunciation,
  onIncrementPractice,
}) => {
  const currentLang = SUPPORTED_LANGUAGES[targetLang];
  const isSomali = appLang === 'so';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Curated comprehensive phrases for the language
  const phrases: PhraseItem[] = [
    {
      id: 'p1',
      category: 'Greetings',
      categorySo: 'Salaamaha & Isbarashada',
      phrase: currentLang.samplePhrases[0]?.phrase || 'Hello, nice to meet you.',
      translationSo: currentLang.samplePhrases[0]?.translationSo || 'Salaan, farxad bay ii tahay inaan ku barto.',
      translationEn: currentLang.samplePhrases[0]?.translationEn || 'Hello, nice to meet you.',
      phonetic: currentLang.samplePhrases[0]?.phonetic || '/həˈloʊ naɪs tuː miːt juː/',
      level: 'A1 Bilaabe',
    },
    {
      id: 'p2',
      category: 'Travel',
      categorySo: 'Socdaalka & Garoomada',
      phrase: currentLang.samplePhrases[1]?.phrase || 'Could you please help me find the hotel?',
      translationSo: currentLang.samplePhrases[1]?.translationSo || 'Fadlan ma iga caawin kartaa inaan helo hudheelka?',
      translationEn: currentLang.samplePhrases[1]?.translationEn || 'Could you please help me find the hotel?',
      phonetic: currentLang.samplePhrases[1]?.phonetic || '/kʊd juː pliːz hɛlp miː/',
      level: 'A2 Aasaasi',
    },
    {
      id: 'p3',
      category: 'Dining',
      categorySo: 'Cuntada & Maqaayadda',
      phrase: currentLang.samplePhrases[2]?.phrase || 'I would like to see the menu, please.',
      translationSo: currentLang.samplePhrases[2]?.translationSo || 'Waxaan jeclaan lahaa inaan arko liiska cuntada (menu), fadlan.',
      translationEn: currentLang.samplePhrases[2]?.translationEn || 'I would like to see the menu, please.',
      phonetic: currentLang.samplePhrases[2]?.phonetic || '/aɪ wʊd laɪk tuː siː ðə ˈmɛnjuː pliːz/',
      level: 'A2 Aasaasi',
    },
    {
      id: 'p4',
      category: 'Shopping',
      categorySo: 'Suuqa & Qiimaha',
      phrase: currentLang.samplePhrases[3]?.phrase || 'How much does this cost altogether?',
      translationSo: currentLang.samplePhrases[3]?.translationSo || 'Immisa ayuu kan guud ahaan joogaa?',
      translationEn: currentLang.samplePhrases[3]?.translationEn || 'How much does this cost altogether?',
      phonetic: currentLang.samplePhrases[3]?.phonetic || '/haʊ mʌtʃ dʌz ðɪs kɔːst/',
      level: 'B1 Dhexe',
    },
    {
      id: 'p5',
      category: 'Emergency',
      categorySo: 'Xaaladaha Degdegga ah',
      phrase: 'Can you call a doctor or an ambulance, please?',
      translationSo: 'Fadlan ma ii wici kartaa dhaqtar ama gaadhiga gurmadka degdegga ah (ambulance)?',
      translationEn: 'Can you call a doctor or an ambulance, please?',
      phonetic: '/kæn juː kɔːl ə ˈdɒktər ɔːr ən ˈæmbjələns pliːz/',
      level: 'A2 Aasaasi',
    },
    {
      id: 'p6',
      category: 'Business',
      categorySo: 'Ganacsiga & Shaqada',
      phrase: 'Let us schedule a meeting to discuss this project tomorrow morning.',
      translationSo: 'Aan ballansanno kulan aan kaga wada hadalno mashruucan berri subax.',
      translationEn: 'Let us schedule a meeting to discuss this project tomorrow morning.',
      phonetic: '/lɛt ʌs ˈskɛdʒuːl ə ˈmiːtɪŋ tuː dɪˈskʌs ðɪs ˈprɒdʒɛkt/',
      level: 'B2 Sare',
    },
  ];

  const categories = [
    { id: 'all', nameSo: 'Dhammaan', nameEn: 'All Categories' },
    { id: 'Greetings', nameSo: 'Salaamaha', nameEn: 'Greetings' },
    { id: 'Travel', nameSo: 'Socdaalka', nameEn: 'Travel' },
    { id: 'Dining', nameSo: 'Cuntada', nameEn: 'Dining' },
    { id: 'Shopping', nameSo: 'Suuqa', nameEn: 'Shopping' },
    { id: 'Emergency', nameSo: 'Degdeg', nameEn: 'Emergency' },
    { id: 'Business', nameSo: 'Ganacsi', nameEn: 'Business' },
  ];

  const filteredPhrases = phrases.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      p.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.translationSo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.translationEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handlePlayAudio = async (text: string, id: string) => {
    setPlayingId(id);
    onIncrementPractice();
    try {
      await speakText(text, currentLang.speechCode, currentLang.name, 1.0);
    } finally {
      setPlayingId(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMastered = (id: string) => {
    setMastered((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isSomali ? 'Buugga Erayada & Oraahyada' : 'Phrasebook & Vocab Cards'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit',sans-serif]">
              {isSomali
                ? `Oraahyada Muhiimka ah ee ${currentLang.nameSo} (${currentLang.flag})`
                : `Essential ${currentLang.name} Phrases (${currentLang.flag})`}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
              {isSomali
                ? 'Baro weedhaha ugu muhiimsan, dhegayso dhawaaqooda saxda ah, hal gujina ugu dir qaybta saxidda dhawaaqa.'
                : 'Master everyday phrases with native pronunciation audio and one-click direct transfer to the Pronunciation Coach.'}
            </p>
          </div>

          {/* 100% Free Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center self-start sm:self-auto">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
              ✨ {isSomali ? '100% BILAASH AH' : '100% FREE FOREVER'}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {isSomali ? 'Dhammaan luqadaha & tababarku waa bilaash' : 'All languages & drills unlocked'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isSomali
                  ? `Ka raadi oraahyada ${currentLang.nameSo} ama Soomaali...`
                  : `Search phrases in ${currentLang.name} or English...`
              }
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? cat.nameSo : cat.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phrase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPhrases.map((p) => {
          const isPlaying = playingId === p.id;
          const isFav = favorites.has(p.id);
          const isDone = mastered.has(p.id);

          return (
            <div
              key={p.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:border-slate-700 ${
                isDone ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {isSomali ? p.categorySo : p.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.level}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMastered(p.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDone ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isSomali ? 'U calaamadee in la bartay' : 'Mark as mastered'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(p.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isSomali ? 'Ku dar kuwa aad jeceshahay' : 'Favorite'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Phrase Content */}
                <div className="mt-3 space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {p.phrase}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {isSomali ? p.translationSo : p.translationEn}
                  </p>
                  <p className="text-xs font-mono text-cyan-400/90 pt-1">
                    🗣️ {p.phonetic}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handlePlayAudio(p.phrase, p.id)}
                  disabled={isPlaying}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className={`w-4 h-4 text-cyan-400 ${isPlaying ? 'animate-bounce' : ''}`} />
                  <span>{isSomali ? 'Dhegayso' : 'Listen'}</span>
                </button>

                <button
                  onClick={() => onSendToPronunciation(p.phrase)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>{isSomali ? 'Sax Dhawaaqeeda' : 'Practice Pronunciation'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
