import React from 'react';
import { X, Flame, Activity, TrendingUp, BookOpen, Mic2, Headphones, MessageSquare, Brain, Gauge, ArrowRight } from 'lucide-react';
import { AppLanguage } from '../types';
import { ProgressSummary, SkillKey } from '../utils/progressTracker';

interface LearningProgressModalProps { isOpen: boolean; onClose: () => void; appLang: AppLanguage; progress: ProgressSummary; }

const SKILL_META: Record<SkillKey, { label: string; labelSo: string; icon: React.ElementType }> = {
  speaking: { label: 'Speaking', labelSo: 'Hadalka', icon: MessageSquare },
  listening: { label: 'Listening', labelSo: 'Dhageysiga', icon: Headphones },
  vocabulary: { label: 'Vocabulary', labelSo: 'Erayada', icon: BookOpen },
  grammar: { label: 'Grammar', labelSo: 'Naxwaha', icon: Brain },
  pronunciation: { label: 'Pronunciation', labelSo: 'Dhawaaqa', icon: Mic2 },
  fluency: { label: 'Fluency', labelSo: 'Hadal dabiici ah', icon: Gauge },
};

function getNextFocus(progress: ProgressSummary): SkillKey | null {
  const practiced = (Object.keys(SKILL_META) as SkillKey[]).filter((key) => progress.skills[key].practiceCount > 0);
  if (practiced.length === 0) return null;
  return practiced.reduce((weakest, key) => progress.skills[key].score < progress.skills[weakest].score ? key : weakest, practiced[0]);
}

export const LearningProgressModal: React.FC<LearningProgressModalProps> = ({ isOpen, onClose, appLang, progress }) => {
  const isSomali = appLang === 'so';
  if (!isOpen) return null;
  const nextFocus = getNextFocus(progress);
  const hasActivity = progress.totalCount > 0 || Object.values(progress.skills).some((skill) => skill.practiceCount > 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-app-border bg-app-surface p-5 shadow-2xl sm:p-7">
        <button onClick={onClose} aria-label={isSomali ? 'Xir' : 'Close'} className="absolute right-4 top-4 rounded-xl p-2 text-text-muted transition hover:bg-app-elevated hover:text-text-primary"><X className="h-5 w-5" /></button>
        <header className="pr-10">
          <div className="flex items-center gap-2 text-primary"><TrendingUp className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-[0.16em]">{isSomali ? 'Horumarkaaga' : 'Your progress'}</span></div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">{isSomali ? 'Waxaad baranaysaa waxa aad dhab ahaan isticmaasho.' : 'See what you are actually improving.'}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{isSomali ? 'Dhibcahani waa qiyaaso tababar oo ku salaysan layliyada aad samaysay — ma aha imtixaan rasmi ah.' : 'These are practice estimates based on your activity, not official proficiency scores.'}</p>
        </header>
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[[Flame, isSomali ? 'Streak' : 'Streak', `${progress.streakDays}`, isSomali ? 'maalmood' : 'days'], [Activity, isSomali ? 'Tababar' : 'Practice', `${progress.totalCount}`, isSomali ? 'sessions' : 'sessions'], [TrendingUp, isSomali ? 'Celcelis' : 'Average', `${progress.averageScore || 0}%`, isSomali ? 'qiyaas' : 'estimate'], [BookOpen, isSomali ? 'Weedho' : 'Phrases', `${progress.totalPhrases}`, isSomali ? 'layli' : 'practice']].map(([Icon, label, value, suffix]) => {
            const I = Icon as React.ElementType;
            return <div key={String(label)} className="rounded-2xl border border-app-border bg-app-elevated p-4"><I className="h-4 w-4 text-primary" /><p className="mt-2 text-xs font-semibold text-text-muted">{String(label)}</p><p className="mt-1 text-xl font-black">{String(value)} <span className="text-[10px] font-medium text-text-muted">{String(suffix)}</span></p></div>;
          })}
        </section>
        <section className="mt-5 rounded-2xl border border-app-border bg-app-elevated p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold">{isSomali ? '6-da xirfadood' : 'Your six skills'}</h3><p className="mt-1 text-xs text-text-muted">{isSomali ? 'Meesha ugu hooseysa ayaa mudan ku celcelin badan.' : 'Your lowest practiced skill becomes the next focus.'}</p></div>{nextFocus && <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary">{isSomali ? 'Diiradda xigta' : 'Next focus'}: {isSomali ? SKILL_META[nextFocus].labelSo : SKILL_META[nextFocus].label}</div>}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(SKILL_META) as SkillKey[]).map((skill) => {
              const meta = SKILL_META[skill]; const data = progress.skills[skill]; const Icon = meta.icon; const practiced = data.practiceCount > 0;
              return <div key={skill} className="rounded-2xl border border-app-border bg-app-surface p-4"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><div className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div><div className="min-w-0"><p className="text-sm font-bold">{isSomali ? meta.labelSo : meta.label}</p><p className="text-[10px] text-text-muted">{practiced ? `${data.practiceCount} ${isSomali ? 'layli' : 'practice'}` : (isSomali ? 'Weli lama tababaran' : 'Not practiced yet')}</p></div></div><span className="text-lg font-black">{practiced ? `${data.score}%` : '—'}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-app-elevated"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, data.score)}%` }} /></div></div>;
            })}
          </div>
        </section>
        <section className="mt-5 grid gap-3 rounded-2xl border border-app-border bg-primary/5 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
          <div className="flex gap-3"><div className="rounded-xl bg-primary/10 p-2.5 text-primary"><ArrowRight className="h-4 w-4" /></div><div><h3 className="text-sm font-bold">{nextFocus ? (isSomali ? `Maanta ku celi ${SKILL_META[nextFocus].labelSo}.` : `Practice ${SKILL_META[nextFocus].label.toLowerCase()} next.`) : (isSomali ? 'Bilow wada hadal si Muke-E u barto meelaha aad u baahan tahay.' : 'Start a conversation so Muke-E can learn what you need.')}</h3><p className="mt-1 text-xs leading-5 text-text-secondary">{isSomali ? 'Horumarku wuxuu ka yimaadaa ku celcelin joogto ah, ma aha tirooyin keliya.' : 'Progress comes from repeated practice, not numbers alone.'}</p></div></div>
          <button onClick={onClose} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-white transition hover:opacity-90">{isSomali ? 'Sii wad' : 'Keep learning'}</button>
        </section>
        {!hasActivity && <p className="mt-4 text-center text-xs text-text-muted">{isSomali ? 'Weli wax activity ah ma jirto. Layligaaga koowaad ayaa halkan ka bilaabanaya.' : 'No learning activity yet. Your first practice will start building this view.'}</p>}
      </div>
    </div>
  );
};