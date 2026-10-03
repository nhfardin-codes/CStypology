import React from 'react';
import {
  RotateCcw,
  Pause,
  Play,
  Volume2,
  VolumeX,
  Keyboard,
  Trophy,
  Zap,
} from 'lucide-react';
import { TypingStats, UserSettings } from '../types';

interface StatsBarProps {
  stats: TypingStats;
  isPaused: boolean;
  isStarted: boolean;
  settings: UserSettings;
  lessonTitle: string;
  isPracticeMode?: boolean;
  bestWpm?: number;
  onRestart: () => void;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onToggleKeyboard: () => void;
  onOpenLessons: () => void;
  onOpenPractice: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  isPaused,
  isStarted,
  settings,
  lessonTitle,
  isPracticeMode,
  bestWpm = 0,
  onRestart,
  onTogglePause,
  onToggleSound,
  onToggleKeyboard,
  onOpenLessons,
  onOpenPractice,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const displayTime = stats.targetSeconds
    ? Math.max(0, stats.targetSeconds - stats.elapsedSeconds)
    : stats.elapsedSeconds;

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Minimal Context Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        {/* Left: Mode / Lesson title + Personal Best Milestone */}
        <div className="flex items-center gap-3">
          <button
            onClick={isPracticeMode ? onOpenPractice : onOpenLessons}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors font-medium cursor-pointer"
            title="Switch Lesson or Practice Mode"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{lessonTitle}</span>
          </button>

          {/* All-time milestone badge */}
          {bestWpm > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px] font-semibold"
              title="All-Time Personal Best Net WPM"
            >
              <Trophy className="w-3 h-3" />
              <span>PB {bestWpm} WPM</span>
            </span>
          )}
        </div>

        {/* Right: Minimal Quick Action Icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Restart (Tab + Enter)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePause}
            disabled={!isStarted}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              !isStarted
                ? 'opacity-30 cursor-not-allowed text-slate-600'
                : isPaused
                ? 'text-amber-400 bg-amber-500/20 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
            title="Pause Time & WPM (Esc)"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleSound}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'text-cyan-400 hover:bg-cyan-500/10'
                : 'text-slate-500 hover:bg-slate-800/80'
            }`}
            title={settings.soundEnabled ? 'Click to Mute' : 'Click to Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleKeyboard}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              settings.showKeyboard
                ? 'text-cyan-400 hover:bg-cyan-500/10'
                : 'text-slate-500 hover:bg-slate-800/80'
            }`}
            title={settings.showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sleek Minimal Stats Strip */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-xs">
        {/* Net Speed */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Speed
            </span>
            {isPaused && (
              <span className="text-[9px] font-mono font-bold text-amber-400 px-1 py-0.2 rounded bg-amber-500/15">
                PAUSED
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-tight">
              {stats.netWpm}
            </span>
            <span className="text-xs font-mono text-slate-500">wpm</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {isPaused ? 'Speed paused' : `raw ${stats.rawWpm} · ${stats.cpm} cpm`}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Accuracy
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                stats.accuracy >= 98
                  ? 'text-emerald-400'
                  : stats.accuracy >= 90
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
            >
              {stats.accuracy}
            </span>
            <span className="text-xs font-mono text-slate-500">%</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {stats.incorrectChars === 0 ? '0 errors' : `${stats.incorrectChars} error${stats.incorrectChars > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Time */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {stats.targetSeconds ? 'Countdown' : 'Time'}
            </span>
            {isPaused && (
              <span className="text-[9px] font-mono font-bold text-amber-400 px-1 py-0.2 rounded bg-amber-500/15">
                STOPPED
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-3xl sm:text-4xl font-black font-mono text-slate-200 tracking-tight">
              {formatTime(displayTime)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {stats.progressPercent}% completed
          </span>
        </div>
      </div>
    </div>
  );
};
