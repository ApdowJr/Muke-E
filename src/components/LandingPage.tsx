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

const steps = [
  { id: 'goal', title: 'Choose your goal', body: 'Pick the language, level, and real-world situation you want to handle.', icon: Languages },
  { id: 'practice', title: 'Practice with AI', body: 'Learn through guided exercises, adaptive practice, and natural conversation.', icon: Sparkles },
  { id: 'remember', title: 'Improve & remember', body: 'Review what matters, strengthen weak skills, and keep moving forward.', icon: Trophy },
];

const scenarios = [
  { id: 'airport', title: 'Airport', prompt: 'Check in, ask for your gate, and handle a travel question.' },
  { id: 'restaurant', title: 'Restaurant', prompt: 'Order naturally, ask about the menu, and pay the bill.' },
  { id: 'hotel', title: 'Hotel', prompt: 'Check in, solve a room problem, and ask for help.' },
  { id: 'interview', title: 'Job interview', prompt: 'Introduce yourself and answer practical interview questions.' },
  { id: 'doctor', title: 'Doctor', prompt: 'Describe symptoms and understand simple instructions.' },
  { id: 'everyday', title: 'Everyday', prompt: 'Have a relaxed conversation about daily life.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ appLang, targetLang, onStartLearning, onSetTargetLang }) => {
  const [activeStep, setActiveStep] = useState('practice');
  const [scenario, setScenario] = useState('restaurant');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('light') === false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSomali = appLang === 'so';
  const language = SUPPORTED_LANGUAGES[targetLang];
  const activeScenario = useMemo(() => scenarios.find(item => item.id === scenario) ?? scenarios[0], [scenario]);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('light', !nextDark);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <header className="sticky top-0 z-50 border-b border-app-border bg-app-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 text-left" aria-label="Muke-E home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-elevation-md"><Sparkles className="h-5 w-5" /></span>
            <span><span className="block font-display text-base font-extrabold tracking-tight">Muke-E</span><span className="hidden text-[10px] font-semibold uppercase tracking-[.14em] text-text-muted sm:block">Learn. Speak. Remember.</span></span>
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <button onClick={() => scrollTo('how-it-works')} className="text-sm font-semibold text-text-secondary transition hover:text-text-primary">Learn</button>
            <button onClick={() => scrollTo('experience')} className="text-sm font-semibold text-text-secondary transition hover:text-text-primary">Practice</button>
            <button onClick={() => scrollTo('conversation')} className="text-sm font-semibold text-text-secondary transition hover:text-text-primary">Speak</button>
            <button onClick={() => scrollTo('progress')} className="text-sm font-semibold text-text-secondary transition hover:text-text-primary">Progress</button>
            <button onClick={() => scrollTo('languages')} className="text-sm font-semibold text-text-secondary transition hover:text-text-primary">Languages</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="hidden h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-secondary hover:text-text-primary sm:flex">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <select value={targetLang} onChange={e => onSetTargetLang(e.target.value as TargetLanguageCode)} aria-label="Target language" className="hidden max-w-32 rounded-xl border border-app-border bg-app-surface px-2.5 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary sm:block">
              {Object.values(SUPPORTED_LANGUAGES).map(item => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}
            </select>
            <button onClick={onStartLearning} className="hidden rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-elevation-sm transition hover:-translate-y-0.5 hover:bg-primary-hover sm:inline-flex">Start learning</button>
            <button onClick={() => setMobileOpen(v => !v)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-app-border bg-app-surface md:hidden" aria-expanded={mobileOpen} aria-label="Open menu"><ChevronDown className={`h-4 w-4 transition ${mobileOpen ? 'rotate-180' : ''}`} /></button>
          </div>
        </div>
        {mobileOpen && <div className="border-t border-app-border bg-app-surface px-4 py-4 md:hidden"><div className="mx-auto grid max-w-7xl gap-2">
          {['how-it-works','experience','conversation','progress','languages'].map((id, index) => <button key={id} onClick={() => scrollTo(id)} className="rounded-xl px-3 py-3 text-left text-sm font-semibold text-text-secondary hover:bg-app-elevated">{['Learn','Practice','Speak','Progress','Languages'][index]}</button>)}
          <button onClick={onStartLearning} className="mt-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Start learning</button>
        </div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:pb-28">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-surface px-3 py-1.5 text-xs font-bold text-text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-success" /> AI language coach · {language.name}</div>
              <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-7xl">Learn every language.<br /><span className="text-primary">Speak with confidence.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">{isSomali ? 'Baro luqad cusub, ku celceli wada sheekaysi dhab ah, hagaaji dhawaaqa, oo dhis kalsooni.' : 'Practice real conversations, improve your pronunciation, and build a learning path that adapts to you.'}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={onStartLearning} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-elevation-md transition hover:-translate-y-0.5 hover:bg-primary-hover">Start learning <ArrowRight className="h-4 w-4" /></button>
                <button onClick={() => scrollTo('how-it-works')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-6 text-sm font-bold text-text-primary hover:bg-app-elevated"><Play className="h-4 w-4 text-primary" /> See how it works</button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-text-muted"><span>✓ CEFR learning path</span><span>✓ Voice practice</span><span>✓ Adaptive review</span></div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-primary/10 blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-app-border bg-app-surface p-3 shadow-elevation-lg">
                <div className="rounded-[1.4rem] border border-app-border bg-app-bg p-5 sm:p-6">
                  <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-text-muted">Today's learning</p><p className="mt-1 text-sm font-bold">{language.flag} {language.name} · A2</p></div><span className="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success">On track</span></div>
                  <div className="mt-6 rounded-2xl border border-app-border bg-app-surface p-4"><p className="text-xs font-bold text-text-muted">Scenario</p><p className="mt-1 text-sm font-bold">Ordering at a restaurant</p><div className="mt-4 rounded-xl bg-primary/10 p-4"><p className="text-xs font-semibold text-primary">AI Coach</p><p className="mt-2 text-base font-semibold">“I'd like a table for two, please.”</p></div><button onClick={onStartLearning} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white"><Mic2 className="h-4 w-4" /> Speak now</button></div>
                  <div className="mt-3 grid grid-cols-3 gap-2"><div className="rounded-xl border border-app-border p-3"><p className="text-[10px] text-text-muted">Streak</p><p className="mt-1 text-sm font-bold">7 days</p></div><div className="rounded-xl border border-app-border p-3"><p className="text-[10px] text-text-muted">Level</p><p className="mt-1 text-sm font-bold">A2</p></div><div className="rounded-xl border border-app-border p-3"><p className="text-[10px] text-text-muted">Goal</p><p className="mt-1 text-sm font-bold">10 min</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-app-border bg-app-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">How Muke-E works</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">One learning system. Four simple steps.</h2></div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => { const Icon = step.icon; const active = activeStep === step.id; return <button key={step.id} onClick={() => setActiveStep(step.id)} className={`rounded-2xl border p-6 text-left transition ${active ? 'border-primary/40 bg-primary/10 shadow-elevation-sm' : 'border-app-border bg-app-bg hover:-translate-y-0.5 hover:bg-app-elevated'}`}>
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-primary">0{index + 1}</span><Icon className="h-5 w-5 text-primary" /></div><h3 className="mt-7 text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-text-secondary">{step.body}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">{active ? 'Selected' : 'Explore'} <ArrowRight className="h-3 w-3" /></span>
              </button> })}
            </div>
            <div className="mt-5 rounded-2xl border border-app-border bg-app-bg p-5"><p className="text-sm font-bold">{steps.find(s => s.id === activeStep)?.title}</p><p className="mt-1 text-sm text-text-secondary">{steps.find(s => s.id === activeStep)?.body}</p></div>
          </div>
        </section>

        <section id="experience" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">The learning experience</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Learn. Practice. Speak. Progress.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary">Every part of Muke-E connects to the next so practice does not feel like a collection of disconnected exercises.</p><button onClick={onStartLearning} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">Open the learning app <ArrowRight className="h-4 w-4" /></button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[['Learn','CEFR lessons and real-world goals.',BookOpen],['Practice','Adaptive vocabulary, grammar and pronunciation.',Check],['Speak','Natural conversations with an AI coach.',Mic2],['Progress','Evidence, review and your next step.',Trophy]].map(([title,body,Icon]) => { const I = Icon as React.ElementType; return <button key={String(title)} onClick={onStartLearning} className="group rounded-2xl border border-app-border bg-app-surface p-5 text-left transition hover:-translate-y-0.5 hover:border-primary/30"><I className="h-5 w-5 text-primary" /><p className="mt-5 text-base font-bold">{String(title)}</p><p className="mt-1 text-sm leading-6 text-text-secondary">{String(body)}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-text-muted group-hover:text-primary">Open <ArrowRight className="h-3 w-3" /></span></button> })}
            </div>
          </div>
        </section>

        <section id="conversation" className="bg-app-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">AI conversation</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Talk like you're already there.</h2><p className="mt-4 text-sm leading-6 text-text-secondary">Choose a situation. Muke-E takes you into the conversation instead of asking you to memorize isolated sentences.</p></div>
            <div className="mt-10 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">{scenarios.map(item => <button key={item.id} onClick={() => setScenario(item.id)} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${scenario === item.id ? 'border-primary bg-primary/10 text-primary' : 'border-app-border bg-app-bg text-text-secondary hover:bg-app-elevated'}`}>{item.title}</button>)}</div>
              <div className="rounded-2xl border border-app-border bg-app-bg p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-primary">Practice scenario</p><h3 className="mt-1 text-xl font-bold">{activeScenario.title}</h3></div><Volume2 className="h-5 w-5 text-text-muted" /></div><p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">{activeScenario.prompt}</p><div className="mt-6 rounded-xl border border-app-border bg-app-surface p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">AI Coach</p><p className="mt-2 text-base font-semibold">“Hi! How can I help you today?”</p></div><button onClick={onStartLearning} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Try this conversation <ArrowRight className="h-4 w-4" /></button></div>
            </div>
          </div>
        </section>

        <section id="progress" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Personal learning</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your learning adapts to you.</h2><p className="mt-4 text-sm leading-6 text-text-secondary">Your CEFR level, practice history, weak skills and review needs should shape what you do next—not a generic lesson list.</p><button onClick={onStartLearning} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-5 py-3 text-sm font-bold">See your progress <ArrowRight className="h-4 w-4 text-primary" /></button></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['A2','CEFR level'],['7','day streak'],['82%','practice avg'],['3','review due']].map(([value,label]) => <div key={label} className="rounded-2xl border border-app-border bg-app-surface p-5"><p className="font-display text-2xl font-extrabold">{value}</p><p className="mt-1 text-xs text-text-muted">{label}</p></div>)}</div>
          </div>
        </section>

        <section id="languages" className="border-y border-app-border bg-app-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Languages</p><h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Learn the language you actually need.</h2></div><button onClick={onStartLearning} className="inline-flex items-center gap-2 text-sm font-bold text-primary">Explore in Muke-E <ArrowRight className="h-4 w-4" /></button></div>
            <div className="mt-8 flex flex-wrap gap-2">{Object.values(SUPPORTED_LANGUAGES).map(item => <button key={item.code} onClick={() => onSetTargetLang(item.code)} className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${targetLang === item.code ? 'border-primary bg-primary text-white' : 'border-app-border bg-app-bg text-text-secondary hover:border-primary/30 hover:text-text-primary'}`}>{item.flag} {item.name}</button>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-white sm:px-12 sm:py-16"><div className="relative max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/70">Start today</p><h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Your next language starts here.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/80">Build a habit around real communication—not endless disconnected exercises.</p><button onClick={onStartLearning} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary">Start learning free <ArrowRight className="h-4 w-4" /></button></div></div>
        </section>
      </main>

      <footer className="border-t border-app-border"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span className="font-bold text-text-primary">Muke-E</span><span>Learn. Speak. Remember.</span><button onClick={onStartLearning} className="font-bold text-primary">Open learning app →</button></div></footer>
    </div>
  );
};
