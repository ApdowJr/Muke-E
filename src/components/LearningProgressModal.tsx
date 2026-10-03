import React, { useState } from 'react';
import {
  X,
  Flame,
  Trophy,
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AppLanguage } from '../types';
import { ProgressSummary } from '../utils/progressTracker';

interface LearningProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLang: AppLanguage;
  progress: ProgressSummary;
}

export const LearningProgressModal: React.FC<LearningProgressModalProps> = ({
  isOpen,
  onClose,
  appLang,
  progress,
}) => {
  const isSomali = appLang === 'so';
  const [activeChartTab, setActiveChartTab] = useState<'activity' | 'accuracy'>('activity');

  if (!isOpen) return null;

  // Format data for Recharts
  const chartData = progress.weeklyData.map((d) => ({
    name: isSomali ? d.daySo.slice(0, 3) : d.day,
    fullName: isSomali ? d.daySo : d.day,
    practiceCount: d.practiceCount,
    accuracy: d.accuracy,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-6 text-left relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isSomali ? 'Horumarkaaga Waxbarasho' : 'Learning Progress'}
              </h3>
              <p className="text-xs text-slate-400">
                {isSomali ? 'Kormeer tirada tababarka iyo horumarkaaga' : 'Track your practice streaks and accuracy'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Streak Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {isSomali ? 'Streak-ga' : 'Streak'}
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {progress.streakDays}{' '}
              <span className="text-xs font-normal text-slate-400">
                {isSomali ? 'bari' : 'days'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isSomali ? `Ugu fiican: ${progress.bestStreak}` : `Best: ${progress.bestStreak}`}
            </p>
          </div>

          {/* Total Practice Count Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {isSomali ? 'Wadarta' : 'Total'}
              </span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {progress.totalCount}
            </div>
            <p className="text-[10px] text-slate-400">
              {isSomali ? 'layli la qabtay' : 'practices done'}
            </p>
          </div>

          {/* Average Pronunciation Score Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {isSomali ? 'Dhawaaqa' : 'Accuracy'}
              </span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {progress.averageScore}%
            </div>
            <p className="text-[10px] text-slate-400">
              {isSomali ? 'celcelis saxnaan' : 'avg accuracy'}
            </p>
          </div>

          {/* Phrases Mastered Card */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">
                {isSomali ? 'Weedho' : 'Phrases'}
              </span>
              <Trophy className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {progress.totalPhrases}
            </div>
            <p className="text-[10px] text-slate-400">
              {isSomali ? 'la bartay' : 'mastered'}
            </p>
          </div>
        </div>

        {/* Recharts Visual Section */}
        <div className="bg-slate-850/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          {/* Chart Toggle Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>
                {activeChartTab === 'activity'
                  ? isSomali ? 'Dhaqdhaqaaqa Todobaadka (Tirada Layliyada)' : 'Weekly Practice Activity (Count)'
                  : isSomali ? 'Heerka Saxnaanta Dhawaaqa (%)' : 'Pronunciation Accuracy Trend (%)'}
              </span>
            </span>

            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveChartTab('activity')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeChartTab === 'activity'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? 'Layliyada' : 'Sessions'}
              </button>
              <button
                onClick={() => setActiveChartTab('accuracy')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeChartTab === 'accuracy'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isSomali ? 'Dhawaaqa' : 'Accuracy'}
              </button>
            </div>
          </div>

          {/* Recharts Chart Container */}
          <div className="w-full h-48 sm:h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === 'activity' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -22, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [
                      `${value} ${isSomali ? 'layli' : 'practices'}`,
                      isSomali ? 'Dhaqdhaqaaq' : 'Activity',
                    ]}
                    labelFormatter={(label) => {
                      const item = chartData.find((d) => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Bar
                    dataKey="practiceCount"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis
                    domain={[60, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value}%`, isSomali ? 'Saxnaanta' : 'Accuracy']}
                    labelFormatter={(label) => {
                      const item = chartData.find((d) => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#accuracyGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Encouragement Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {isSomali
                ? 'Sii wad maalin kasta si aad streak-gaaga u ilaaliso!'
                : 'Keep practicing daily to protect your streak!'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-blue-600/20"
          >
            {isSomali ? 'Waayahay' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
