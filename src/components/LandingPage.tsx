import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, Languages, Mic2, Moon, Play, Sparkles, Sun, Trophy, Volume2 } from 'lucide-react';
import { AppLanguage, TargetLanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

interface LandingPageProps {
  appLang: AppLanguage;
  targetLang: TargetLanguageCode;
  onStartLearning: () => void;
  onSetTargetLang: (lang: TargetLanguageCode) => void;
}

const scenarios = [
  { id: 'airport', title: 'Airport', prompt: 'Check in, ask for your gate, and handle a travel question.' },
  { id: 'restaurant', title: 'Restaurant', prompt: 'Order naturally, ask about the menu, and pay the bill.' },
  { id: 'hotel', title: 'Hotel', prompt: 'Check in, solve a room problem, and ask for help.' },
  { id: 'interview', title: 'Job interview', prompt: 'Introduce yourself and answer practical interview questions.' },
  { id: 'doctor', title: 'Doctor', prompt: 'Describe symptoms and understand simple instructions.' },
  { id: 'everyday', title: 'Everyday', prompt: 'Have a relaxed conversation about daily life.' },
];

const steps = [
  ['01', 'Choose your goal', 'Set your language, CEFR level, and the situations that matter to you.'],
  ['02', 'Practice with AI', 'Move between guided lessons, voice practice, and natural conversation.'],
  ['03', 'Improve & remember', 'Weak skills return in new contexts until your evidence gets stronger.'],
];

export const LandingPage: React.FC<LandingPageProps> = ({ appLang, targetLang, onStartLearning, onSetTargetLang }) => {
  const [scenario, setScenario] = useState('restaurant');
  const [dark, setDark] = useState(() => !document.documentElement.classList.contains('light'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSomali = appLang === 'so';
  const language = SUPPORTED_LANGUAGES[targetLang];
  const activeScenario = useMemo(() => scenarios.find(item => item.id === scenario) ?? scenarios[0], [scenario]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <header className="sticky top-0 z-50 border-b border-app-border bg-app-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3" aria-label="Muke-E home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-elevation-sm"><Sparkles className="h-4 w-4" /></span>
            <span><span className="block font-display text-base font-extrabold tracking-tight">Muke-E</span><span className="hidden text-[10px] font-semibold uppercase tracking-[.14em] text-text-muted sm:block">Learn. Speak. Remember.</span></span>
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-semibold text-text-secondary hover:text-text-primary">Learn</button>
            <button onClick={() => scrollTo('experience')} className="text-sm font-semibold text-text-secondary hover:text-text-primary">Practice</button>
            <button onClick={() => scrollTo('conversation')} className="text-sm font-semibold text-text-secondary hover:text-text-primary">Speak</button>
            <button onClick={() => scrollTo('progress')} className="text-sm font-semibold text-text-secondary hover:text-text-primary">Progress</button>
            <button onClick={() => scrollTo('languages')} className="text-sm font-semibold text-text-secondary hover:text-text-primary">Languages</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="hidden h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-secondary sm:flex">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <select value={targetLang} onChange={e => onSetTargetLang(e.target.value as TargetLanguageCode)} aria-label="Target language" className="hidden max-w-32 rounded-xl border border-app-border bg-app-surface px-2.5 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary sm:block">
              {Object.values(SUPPORTED_LANGUAGES).map(item => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}
            </select>
            <button onClick={onStartLearning} className="hidden rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-elevation-sm transition hover:-translate-y-0.5 hover:bg-primary-hover sm:inline-flex">Start learning</button>
            <button onClick={() => setMobileOpen(v => !v)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-surface md:hidden" aria-expanded={mobileOpen} aria-label="Open menu"><ChevronDown className={`h-4 w-4 transition ${mobileOpen ? 'rotate-180' : ''}`} /></button>
          </div>
        </div>
        {mobileOpen && <div className="border-t border-app-border bg-app-surface px-5 py-4 md:hidden"><div className="grid gap-2">
          {['how-it-works','experience','conversation','progress','languages'].map((id, i) => <button key={id} onClick={() => scrollTo(id)} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-text-secondary hover:bg-app-elevated">{['Learn','Practice','Speak','Progress','Languages'][i]}</button>)}
          <button onClick={onStartLearning} className="mt-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Start learning free</button>
        </div></div>}
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:pt-24">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-primary">AI language coach · {language.name}</p>
            <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">Learn every language.<br /><span className="text-primary">Speak with confidence.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">{isSomali ? 'Baro luqad cusub, ku hadal xaalado dhab ah, hagaaji dhawaaqa, oo dhis kalsooni.' : 'A focused learning system that combines CEFR lessons, real conversation, pronunciation practice, and review that remembers what matters.'}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={onStartLearning} className="rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-elevation-md transition hover:-translate-y-0.5 hover:bg-primary-hover">Start learning free <ArrowRight className="ml-2 inline h-4 w-4" /></button>
              <button onClick={() => scrollTo('how-it-works')} className="rounded-full border border-app-border bg-app-surface px-6 py-3.5 text-sm font-bold text-text-primary"><Play className="mr-2 inline h-4 w-4 text-primary" />See how it works</button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-text-muted"><span className="rounded-full bg-app-elevated px-3 py-2">CEFR-aligned</span><span className="rounded-full bg-app-elevated px-3 py-2">Voice practice</span><span className="rounded-full bg-app-elevated px-3 py-2">Adaptive review</span></div>
          </div>

          <div className="rounded-[28px] border border-app-border bg-app-surface p-3 shadow-elevation-lg">
            <div className="rounded-[22px] bg-primary/10 p-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Today's path</p><p className="mt-1 text-xl font-bold">{language.name} · A1</p></div><span className="rounded-full bg-app-surface px-3 py-1.5 text-xs font-bold text-text-secondary">12 min</span></div>
              <div className="mt-5 rounded-2xl border border-app-border bg-app-surface p-5 shadow-elevation-sm">
                <div className="flex items-center justify-between text-xs font-semibold text-text-muted"><span>Lesson 04</span><span>Speaking</span></div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight">At the restaurant</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">Practice ordering naturally, asking a question, and responding without translating.</p>
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-app-bg p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white"><Play className="h-4 w-4 fill-current" /></span><div className="flex-1"><div className="h-1.5 rounded-full bg-app-elevated"><div className="h-1.5 w-2/5 rounded-full bg-primary" /></div></div><span className="text-xs font-semibold text-text-muted">00:18</span></div>
                <button onClick={onStartLearning} className="mt-4 w-full rounded-xl bg-text-primary py-3 text-sm font-bold text-app-bg">Continue lesson</button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs"><div className="rounded-xl bg-app-surface p-3"><b className="block text-base">A1</b><span className="text-text-muted">Level</span></div><div className="rounded-xl bg-app-surface p-3"><b className="block text-base">6</b><span className="text-text-muted">Skills</span></div><div className="rounded-xl bg-app-surface p-3"><b className="block text-base">3</b><span className="text-text-muted">Reviews</span></div></div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-app-border bg-app-surface/60">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-primary">One learning loop</p><h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">A system built around what you can actually do.</h2></div>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map(([number,title,body]) => <article key={number} className="rounded-3xl border border-app-border bg-app-bg p-6 transition hover:-translate-y-1 hover:shadow-elevation-md"><span className="text-xs font-black text-primary">{number}</span><h3 className="mt-10 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{body}</p></article>)}
            </div>
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-primary">The learning experience</p><h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Learn. Practice. Speak. Progress.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-text-secondary">Every part of Muke-E connects to the next so practice feels like one learning system, not disconnected exercises.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['Learn','CEFR lessons and real-world goals.',BookOpen],['Practice','Adaptive vocabulary, grammar and pronunciation.',Check],['Speak','Natural conversations with an AI coach.',Mic2],['Progress','Evidence, review and your next step.',Trophy]].map(([title,body,Icon]) => { const I = Icon as React.ElementType; return <button key={String(title)} onClick={onStartLearning} className="group rounded-2xl border border-app-border bg-app-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30"><I className="h-5 w-5 text-primary" /><p className="mt-5 text-base font-bold">{String(title)}</p><p className="mt-1 text-sm leading-6 text-text-secondary">{String(body)}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-text-muted group-hover:text-primary">Open <ArrowRight className="h-3 w-3" /></span></button> })}
            </div>
          </div>
        </section>

        <section id="conversation" className="border-y border-app-border bg-text-primary text-app-bg">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-primary">AI conversation</p><h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Practice the moments you care about.</h2><p className="mt-5 text-sm leading-7 opacity-65">Pick a situation and start talking. Muke-E keeps the conversation at your level and turns useful corrections into future practice.</p></div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{scenarios.map(item => <button key={item.id} onClick={() => setScenario(item.id)} className={`rounded-2xl border p-5 text-left transition ${scenario === item.id ? 'border-primary bg-primary/15' : 'border-white/10 bg-white/5 hover:border-white/20'}`}><span className="text-xs font-bold opacity-45">SCENARIO</span><h3 className="mt-3 text-base font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 opacity-60">{item.prompt}</p></button>)}</div>
            <div className="mt-5 rounded-3xl bg-app-surface p-6 text-text-primary sm:p-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">AI roleplay ready</p><h3 className="mt-2 text-2xl font-bold">{activeScenario.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">{activeScenario.prompt}</p></div><button onClick={onStartLearning} className="shrink-0 rounded-full bg-text-primary px-5 py-3 text-sm font-bold text-app-bg">Start speaking <ArrowRight className="ml-1 inline h-4 w-4" /></button></div></div>
          </div>
        </section>

        <section id="progress" className="border-b border-app-border bg-primary/10">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-primary">Progress with evidence</p><h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Know what to practice next.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-text-secondary">Your dashboard connects curriculum, practice outcomes, weaknesses, and review. No mystery score pretending to be fluency.</p></div>
            <div className="rounded-3xl border border-app-border bg-app-surface p-6 shadow-elevation-md"><div className="flex items-center justify-between"><span className="text-sm font-bold">Learning evidence</span><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">CEFR path</span></div><div className="mt-6 space-y-5">{[['Speaking','Practice'],['Listening','Practice'],['Vocabulary','Practice'],['Pronunciation','Practice']].map(([label,value]) => <div key={label}><div className="mb-2 flex justify-between text-xs font-semibold"><span>{label}</span><span className="text-text-muted">{value} evidence</span></div><div className="h-2 rounded-full bg-app-elevated"><div className="h-2 w-2/3 rounded-full bg-primary" /></div></div>)}</div><p className="mt-6 text-xs leading-5 text-text-muted">Practice evidence helps choose the next useful task. It is not a formal proficiency test.</p></div>
          </div>
        </section>

        <section id="languages" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-primary">Languages</p><h2 className="mt-4 font-display text-4xl font-extrabold tracking-[-.04em] sm:text-5xl">Learn the language you actually need.</h2></div><Languages className="hidden h-8 w-8 text-primary sm:block" /></div>
          <div className="mt-8 flex flex-wrap gap-2">{Object.values(SUPPORTED_LANGUAGES).map(item => <button key={item.code} onClick={() => onSetTargetLang(item.code)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${targetLang === item.code ? 'border-primary bg-primary text-white' : 'border-app-border bg-app-surface text-text-secondary hover:border-primary/30'}`}>{item.flag} {item.name}</button>)}</div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="rounded-[2rem] bg-primary px-6 py-14 text-white sm:px-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Your next language starts here</p><h2 className="mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-[-.05em] sm:text-6xl">Less studying about language. More using it.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/75">Start with a goal, speak early, and let the system build your next practice from what you actually need.</p><button onClick={onStartLearning} className="mt-8 rounded-full bg-white px-7 py-4 text-sm font-bold text-primary">Start learning free <ArrowRight className="ml-1 inline h-4 w-4" /></button></div>
        </section>
      </main>

      <footer className="border-t border-app-border"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8"><span className="font-bold text-text-primary">Muke-E</span><span>Learn. Speak. Remember.</span><button onClick={onStartLearning} className="font-bold text-primary">Open learning app →</button></div></footer>
    </div>
  );
};
