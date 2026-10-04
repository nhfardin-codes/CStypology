import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Lock,
  Check,
  Star,
  Trash2,
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'all' },
    { id: 'beginner', label: 'foundations' },
    { id: 'words', label: 'words' },
    { id: 'code', label: 'code' },
    { id: 'quotes', label: 'quotes' },
    { id: 'speed', label: 'speed' },
    { id: 'custom', label: 'custom' },
  ];

  const totalStages = lessons.length;
  const completedStages = Object.values(progression).filter((p) => p.completed).length;
  const totalStars = Object.values(progression).reduce((acc, p) => acc + (p.stars || 0), 0);
  const maxPossibleStars = totalStages * 3;

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchCat = selectedCategory === 'all' ? true : l.category === selectedCategory;
      const matchSearch = searchQuery.trim() === ''
        ? true
        : l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (l.language && l.language.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [lessons, selectedCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 font-mono text-xs select-none">
      <div className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-wider lowercase">curriculum</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">
              <strong className="text-cyan-400 font-normal">{completedStages}</strong>/{totalStages} cleared
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-400 flex items-center gap-1 font-normal">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{totalStars}/{maxPossibleStars}</span>
            </span>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">&gt;=35 wpm gate</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Minimal Filter Input */}
            <div className="flex items-center gap-1 border-b border-slate-700/80 focus-within:border-cyan-400 px-1 py-0.5">
              <Search className="w-3 h-3 text-slate-500" />
              <input
                type="text"
                placeholder="filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-slate-200 placeholder-slate-600 outline-none w-24 sm:w-32 text-xs font-mono"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Category Tabs */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-b border-slate-800/60 bg-slate-950/20 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            const count = cat.id === 'all'
              ? lessons.length
              : lessons.filter((l) => l.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer lowercase ${
                  active
                    ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-slate-400 ml-1 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Minimal Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredLessons.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              no lessons match query
            </div>
          ) : (
            filteredLessons.map((lesson, idx) => {
              const isCurrent = lesson.id === currentLessonId;
              const lessonIdx = lessons.findIndex((l) => l.id === lesson.id);
              const stageNum = lessonIdx !== -1 ? lessonIdx + 1 : idx + 1;

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
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between gap-1.5 ${
                    !isUnlocked
                      ? 'border-slate-800/40 bg-slate-950/20 opacity-40 cursor-not-allowed'
                      : isCurrent
                      ? 'border-cyan-400 bg-cyan-500/10 cursor-pointer shadow-xs'
                      : isCompleted
                      ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                      : 'border-slate-800/80 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                  }`}
                >
                  {/* Top Line: Stage Index, Title, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {String(stageNum).padStart(2, '0')}
                      </span>
                      <span className={`font-medium truncate ${isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-200'}`}>
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                      {!isUnlocked ? (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                        </span>
                      ) : isCompleted ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-mono">
                          <Check className="w-3 h-3" />
                          <span>{prog?.bestWpm} wpm</span>
                          <span className="text-amber-400 flex items-center ml-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-2.5 h-2.5 ${
                                  s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700 fill-slate-800'
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">target 35+</span>
                      )}
                    </div>
                  </div>

                  {/* Clean text snippet without heavy nested box */}
                  <p className="text-[11px] text-slate-400 font-mono truncate leading-normal">
                    {lesson.text.slice(0, 65)}...
                  </p>

                  {/* Bottom Line: Category/Diff & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{lesson.difficulty.toLowerCase()}</span>
                      <span>·</span>
                      <span>{lesson.category}</span>
                      {lesson.language && (
                        <>
                          <span>·</span>
                          <span className="text-cyan-400/80">{lesson.language}</span>
                        </>
                      )}
                    </div>

                    {lesson.category === 'custom' && onDeleteCustomLesson && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomLesson(lesson.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                        title="delete custom lesson"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
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
