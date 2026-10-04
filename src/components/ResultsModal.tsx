import React, { useEffect } from 'react';
import {
  RotateCcw,
  ArrowRight,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogIn,
  Star,
  Sparkles,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { TypingStats, Lesson } from '../types';
import { soundEngine } from '../services/soundEngine';

interface ResultsModalProps {
  stats: TypingStats;
  currentLesson: Lesson;
  user: User | null;
  isSavedToCloud?: boolean;
  isLessonMode?: boolean;
  starsEarned?: number;
  nextLessonTitle?: string;
  isNewlyUnlocked?: boolean;
  passed?: boolean;
  onRestart: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
  onOpenAuth: () => void;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  currentLesson,
  user,
  isSavedToCloud,
  isLessonMode,
  starsEarned = 3,
  nextLessonTitle,
  isNewlyUnlocked,
  passed,
  onRestart,
  onNextLesson,
  hasNextLesson,
  onOpenAuth,
  onClose,
}) => {
  // If in lesson mode and speed is below 35 WPM, level is not cleared
  const isSpeedPassed = passed ?? (stats.netWpm >= 35);

  useEffect(() => {
    if (isLessonMode && !isSpeedPassed) {
      soundEngine.playErrorSound();
    } else {
      soundEngine.playLevelUpFanfare();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLessonMode, isSpeedPassed, onRestart]);

  const getSpeedRank = (wpm: number) => {
    if (wpm >= 100) return { title: 'Godspeed Virtuoso', desc: 'Top tier competitive speed!' };
    if (wpm >= 80) return { title: 'Keyboard Master', desc: 'Incredible cadence and accuracy!' };
    if (wpm >= 60) return { title: 'Fast Professional', desc: 'Well above average touch-typing speed!' };
    if (wpm >= 40) return { title: 'Steady Touch Typer', desc: 'Solid foundation and steady rhythm.' };
    if (wpm >= 35) return { title: 'Proficient Typer', desc: 'Cleared the 35 WPM target benchmark!' };
    return { title: 'Developing Rhythm', desc: 'Keep practicing daily to reach the 35 WPM target!' };
  };

  const rank = getSpeedRank(stats.netWpm);
  const sortedErrors = Object.entries(stats.errorMap || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Game Progression Banner */}
        {isLessonMode && (
          isSpeedPassed ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/15 to-emerald-500/20 border border-cyan-500/40 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-cyan-500 text-slate-950 font-black flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Stage Cleared!</span>
                    {isNewlyUnlocked && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" /> Next Level Unlocked
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-cyan-200/80">
                    {hasNextLesson ? (nextLessonTitle ? `Up next: ${nextLessonTitle}` : 'Advancing to next stage') : 'All curriculum stages cleared!'}
                  </p>
                </div>
              </div>

              {/* Earned Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-6 h-6 transition-all duration-300 ${
                      starIdx <= starsEarned
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-bounce'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Target 35 WPM Not Reached</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                      Retry Required
                    </span>
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    You typed at <strong className="text-white font-mono">{stats.netWpm} WPM</strong>. A minimum of 35 WPM is required to pass and unlock the next stage.
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* Top Award Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{rank.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{rank.desc}</p>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 font-mono truncate max-w-[140px]">
            {currentLesson.title}
          </span>
        </div>

        {/* Primary Metric Score Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Net WPM */}
          <div className="flex flex-col p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Net Speed
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isLessonMode && !isSpeedPassed ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                {stats.netWpm}
              </span>
              <span className="text-sm font-bold font-mono text-slate-400">WPM</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
              <span>Raw: {stats.rawWpm}</span>
              <span>·</span>
              <span>Target: 35 WPM</span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex flex-col p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Accuracy
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                  stats.accuracy >= 98
                    ? 'text-emerald-400'
                    : stats.accuracy >= 90
                    ? 'text-cyan-400'
                    : 'text-amber-400'
                }`}
              >
                {stats.accuracy}
              </span>
              <span className="text-sm font-bold font-mono text-slate-400">%</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
              <span>Errors: {stats.incorrectChars}</span>
              <span>·</span>
              <span>Clean: {stats.correctChars}</span>
            </div>
          </div>
        </div>

        {/* Secondary Detailed Metrics */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Characters</span>
            </div>
            <span className="font-mono font-bold text-slate-200 text-sm mt-0.5">
              {stats.correctChars} <span className="text-[10px] text-slate-500">/ {stats.totalTypedChars}</span>
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time</span>
            </div>
            <span className="font-mono font-bold text-slate-200 text-sm mt-0.5">
              {stats.elapsedSeconds}s
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="font-mono font-bold text-cyan-400">CPM</span>
              <span>Keystrokes</span>
            </div>
            <span className="font-mono font-bold text-slate-200 text-sm mt-0.5">
              {stats.cpm}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-cyan-400">CStypology</span>
            <span>·</span>
            <span>{isLessonMode && !isSpeedPassed ? 'Retry <35 WPM' : 'Speed Assessment'}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isLessonMode && !isSpeedPassed ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors border border-slate-700 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={onRestart}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-black transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 stroke-[3]" />
                  <span>Retry Level (Tab)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onRestart}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors border border-slate-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Retry (Tab)</span>
                </button>

                {hasNextLesson ? (
                  <button
                    onClick={onNextLesson}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 text-sm font-black transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                  >
                    <span>{isLessonMode ? 'Next Level (Enter)' : 'Next (Enter)'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition-all cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
