import React, { useState } from 'react';
import { Clock, FileText, Quote, Code, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { PracticeCategory } from '../types';

interface PracticeBarProps {
  currentCategory: PracticeCategory;
  subOption: string | number;
  onSelectPractice: (category: PracticeCategory, subOption: string | number) => void;
  onOpenCustom: () => void;
}

export const PracticeBar: React.FC<PracticeBarProps> = ({
  currentCategory,
  subOption,
  onSelectPractice,
  onOpenCustom,
}) => {
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTimeVal, setCustomTimeVal] = useState<string>('');

  const standardTimes = [15, 30, 60, 120];
  const isCustomTime = typeof subOption === 'number' && !standardTimes.includes(subOption);

  const handleCustomTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customTimeVal, 10);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 3600) {
      onSelectPractice('time', parsed);
      setShowCustomTimeInput(false);
      setCustomTimeVal('');
    }
  };

  return (
    <div className="w-full flex items-center justify-center select-none py-1">
      <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onSelectPractice('time', 30)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'time'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>time</span>
          </button>

          <button
            onClick={() => onSelectPractice('words', 25)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'words'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>words</span>
          </button>

          <button
            onClick={() => onSelectPractice('quotes', 'all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'quotes'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Quote className="w-3 h-3" />
            <span>quote</span>
          </button>

          <button
            onClick={() => onSelectPractice('code', 'all')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'code'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>code</span>
          </button>

          <button
            onClick={() => onSelectPractice('zen', 'zen')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'zen'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>zen</span>
          </button>

          <button
            onClick={onOpenCustom}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
              currentCategory === 'custom'
                ? 'bg-cyan-500/15 text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>custom</span>
          </button>
        </div>

        {/* Sub-option Pills */}
        <div className="flex items-center gap-1 pl-2 ml-1 border-l border-slate-800">
          {currentCategory === 'time' && (
            <div className="flex items-center gap-1">
              {standardTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setShowCustomTimeInput(false);
                    onSelectPractice('time', t);
                  }}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                    subOption === t && !showCustomTimeInput
                      ? 'text-cyan-400 font-bold bg-cyan-500/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}s
                </button>
              ))}

              {/* Display Custom Duration if active and not in standard list */}
              {isCustomTime && !showCustomTimeInput && (
                <button
                  onClick={() => setShowCustomTimeInput(true)}
                  className="px-2 py-0.5 rounded font-mono text-[11px] text-cyan-400 font-bold bg-cyan-500/15 cursor-pointer"
                  title="Active Custom Duration (Click to edit)"
                >
                  {subOption}s
                </button>
              )}

              {/* Custom Time Input or Toggle */}
              {showCustomTimeInput ? (
                <form onSubmit={handleCustomTimeSubmit} className="flex items-center gap-1 ml-0.5">
                  <input
                    type="number"
                    min="5"
                    max="3600"
                    placeholder="sec"
                    autoFocus
                    value={customTimeVal}
                    onChange={(e) => setCustomTimeVal(e.target.value)}
                    className="w-12 px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] outline-none border border-cyan-500/50"
                  />
                  <button
                    type="submit"
                    className="p-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 text-[10px] cursor-pointer"
                    title="Set Custom Duration"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomTimeInput(false)}
                    className="text-slate-500 hover:text-slate-300 text-[10px] px-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowCustomTimeInput(true)}
                  className="px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title="Set custom duration (e.g. 45s, 90s, 300s)"
                >
                  {isCustomTime ? '✎' : 'custom'}
                </button>
              )}
            </div>
          )}

          {currentCategory === 'words' && (
            <div className="flex items-center gap-1">
              {[10, 25, 50, 100].map((w) => (
                <button
                  key={w}
                  onClick={() => onSelectPractice('words', w)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                    subOption === w
                      ? 'text-cyan-400 font-bold bg-cyan-500/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}

          {currentCategory === 'quotes' && (
            <div className="flex items-center gap-1">
              {(['all', 'short', 'medium', 'long'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => onSelectPractice('quotes', q)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize transition-colors cursor-pointer ${
                    subOption === q
                      ? 'text-cyan-400 font-bold bg-cyan-500/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {currentCategory === 'code' && (
            <div className="flex items-center gap-1">
              {['all', 'javascript', 'python', 'html'].map((c) => (
                <button
                  key={c}
                  onClick={() => onSelectPractice('code', c)}
                  className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors cursor-pointer ${
                    subOption === c
                      ? 'text-cyan-400 font-bold bg-cyan-500/15'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c === 'all' ? 'All' : c.slice(0, 4)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
