import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Code2, Quote, Zap, Trash2, Lock, CheckCircle2, Star, Trophy } from 'lucide-react';
import { Lesson, LessonProgress } from '../types';

interface LessonSelectorProps {
  lessons: Lesson[];
  currentLessonId: string;
  progression?: Record<string, LessonProgress>;
  onSelectLesson: (lesson: Lesson) => void;
  onDeleteCustomLesson?: (id: string) => void;
  onClose: () => void;
}

export const LessonSelector: React.FC<LessonSelectorProps> = ({
  lessons,
  currentLessonId,
  progression = {},
  onSelectLesson,
  onDeleteCustomLesson,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Levels', icon: BookOpen },
    { id: 'beginner', label: 'Beginner & Rows', icon: Sparkles },
    { id: 'words', label: 'Common Words', icon: Zap },
    { id: 'quotes', label: 'Famous Quotes', icon: Quote },
    { id: 'code', label: 'Code Syntax', icon: Code2 },
    { id: 'custom', label: 'Custom Lessons', icon: BookOpen },
  ];

  const filteredLessons = lessons.filter((l) =>
    selectedCategory === 'all' ? true : l.category === selectedCategory
  );

  // Overall progression stats
  const totalStages = lessons.length;
  const completedStages = Object.values(progression).filter((p) => p.completed).length;
  const totalStars = Object.values(progression).reduce((acc, p) => acc + (p.stars || 0), 0);
  const maxPossibleStars = totalStages * 3;
  const progressPercent = Math.round((completedStages / Math.max(1, totalStages)) * 100);

  const getDifficultyBadge = (diff: 'Easy' | 'Medium' | 'Hard') => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Lesson Progression Campaign</h2>
              <p className="text-xs text-slate-400">Clear each level in sequence to unlock higher tiers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-medium">
              Stages Cleared: <strong className="text-cyan-400">{completedStages}</strong> / {totalStages}
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{totalStars}</span>
              <span className="text-slate-500">/ {maxPossibleStars}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-44">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-slate-800 overflow-x-auto bg-slate-950/40">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lesson Cards List */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLessons.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
              No lessons found in this category yet.
            </div>
          ) : (
            filteredLessons.map((lesson, idx) => {
              const isCurrent = lesson.id === currentLessonId;
              const lessonIdx = lessons.findIndex((l) => l.id === lesson.id);
              const stageNum = lessonIdx !== -1 ? lessonIdx + 1 : idx + 1;

              // Check if unlocked (first level is always unlocked)
              const prog = progression[lesson.id];
              const isUnlocked = prog?.unlocked ?? (lessonIdx === 0 || lesson.category === 'custom');
              const isCompleted = prog?.completed ?? false;
              const stars = prog?.stars ?? 0;

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectLesson(lesson);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 text-left transition-all relative ${
                    !isUnlocked
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                      : isCurrent
                      ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-500/30 cursor-pointer'
                      : isCompleted
                      ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer'
                  }`}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[11px] font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                          Stage {stageNum}
                        </span>
                        <h3 className="text-sm font-bold text-white tracking-tight truncate">
                          {lesson.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isUnlocked ? (
                          <span className="p-1 rounded bg-slate-800 text-slate-500">
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-700 fill-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        ) : null}

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyBadge(
                            lesson.difficulty
                          )}`}
                        >
                          {lesson.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      {isCompleted && prog ? (
                        <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Best: {prog.bestWpm} WPM ({prog.bestAccuracy}%)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {lesson.targetWpm ? `Target: ${lesson.targetWpm} WPM` : `${lesson.text.length} chars`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.category === 'custom' && onDeleteCustomLesson && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustomLesson(lesson.id);
                          }}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete custom lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isUnlocked ? (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[11px] font-bold text-cyan-400 font-mono">
                          ● Current
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[11px] font-medium text-emerald-400 hover:underline">
                          Replay
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-cyan-400 hover:underline">
                          Play Stage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
