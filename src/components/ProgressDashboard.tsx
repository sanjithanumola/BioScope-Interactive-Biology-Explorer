import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../data/biologyData';
import { UserProgress, SectionId } from '../types/biology';
import { calculateUserLevel } from '../utils/biologyLogic';
import { sound } from '../utils/soundEffects';
import {
  Trophy,
  Flame,
  Sparkles,
  Bookmark,
  Clock,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

interface ProgressDashboardProps {
  progress: UserProgress;
  onNavigate: (section: SectionId) => void;
  onResetProgress: () => void;
  onRemoveBookmark: (id: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  onNavigate,
  onResetProgress,
  onRemoveBookmark,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const userLevel = calculateUserLevel(progress.xp);

  const topics = [
    { key: 'anatomy', name: 'Human Anatomy Explorer', section: 'anatomy' as SectionId },
    { key: 'cell', name: 'Cellular Explorer', section: 'cell' as SectionId },
    { key: 'dna', name: 'DNA & Genetics Lab', section: 'dna' as SectionId },
    { key: 'systems', name: 'Body Systems Lab', section: 'systems' as SectionId },
    { key: 'microscopic', name: 'Microscopic World', section: 'microscopic' as SectionId },
    { key: 'lab', name: 'Virtual Biology Lab', section: 'lab' as SectionId },
  ];

  const handleConfirmReset = () => {
    sound.playError();
    onResetProgress();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <span>My Learning Progress</span>
            <span className="text-xs font-mono font-medium text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Level {userLevel.level}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your biology mastery, unlocked badges, learning streak, bookmarked structures, and test records.
          </p>
        </div>

        {/* Reset Progress Trigger */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900/50 rounded-lg transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">Reset all BioScope learning progress?</p>
              <p className="text-slate-300">This will reset your XP, streaks, achievements, and bookmarks. This action is irreversible.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-3 py-1.5 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      )}

      {/* Level & XP Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl font-mono">
              L{userLevel.level}
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-teal-400 tracking-wider">
                Current Scholar Rank
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {userLevel.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400">Total Experience</span>
              <p className="text-xl font-mono font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>{progress.xp} XP</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Learning Streak</span>
              <p className="text-xl font-mono font-bold text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4" />
                <span>{progress.streakDays} Days</span>
              </p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Level {userLevel.level} Progress</span>
            <span>{userLevel.currentXp} / {userLevel.nextLevelXp} XP ({userLevel.progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-500"
              style={{ width: `${userLevel.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Topic Completion Progress Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Topic Completion Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topics.map((t) => {
            const pct = progress.topicProgress[t.key] || 0;
            return (
              <div
                key={t.key}
                onClick={() => {
                  sound.playClick();
                  onNavigate(t.section);
                }}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:-translate-y-0.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-xs font-mono text-teal-400 font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                  <span>{pct === 100 ? 'Mastered' : 'In Progress'}</span>
                  <span className="text-teal-400 font-medium flex items-center gap-0.5">
                    Jump to module <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unlocked Achievements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Achievements & Badges</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {progress.unlockedAchievements.length} of {ACHIEVEMENTS.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = progress.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-slate-900 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 opacity-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                    <span className="text-[10px] font-mono text-amber-400">+{ach.xpReward} XP</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>
                  {isUnlocked && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarked Items */}
      {progress.bookmarkedItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-teal-400" />
            <span>Bookmarked Structures ({progress.bookmarkedItems.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {progress.bookmarkedItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    sound.playClick();
                    onNavigate(item.section);
                  }}
                  className="cursor-pointer space-y-0.5"
                >
                  <span className="text-[10px] font-mono uppercase text-teal-400">
                    {item.category}
                  </span>
                  <p className="text-xs font-bold text-white hover:text-teal-300">
                    {item.title}
                  </p>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onRemoveBookmark(item.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz History */}
      {progress.quizHistory.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Recent Quiz Assessments</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Assessment Topic</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {progress.quizHistory.slice(0, 5).map((q) => (
                  <tr key={q.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{q.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-white capitalize">{q.topic}</td>
                    <td className="py-2.5 px-3 font-mono">{q.score} / {q.total}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-bold ${q.percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {q.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
