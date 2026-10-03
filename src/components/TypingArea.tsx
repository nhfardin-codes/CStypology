import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { CharacterState, CaretStyle } from '../types';
import { AnimatedCaret } from './AnimatedCaret';

interface TypingAreaProps {
  characters: CharacterState[];
  currentIndex: number;
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  fontSize: 'md' | 'lg' | 'xl';
  isPaused: boolean;
  isCompleted: boolean;
  onKeyPress: (char: string) => void;
  onBackspace: (isWord?: boolean) => void;
  onResume: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  characters,
  currentIndex,
  caretStyle,
  smoothCaret,
  fontSize,
  isPaused,
  isCompleted,
  onKeyPress,
  onBackspace,
  onResume,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const charSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [caretRect, setCaretRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const [isFocused, setIsFocused] = useState(true);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [lastTypedTime, setLastTypedTime] = useState(Date.now());

  // Focus hidden input
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      setIsFocused(true);
    }
  }, []);

  // Group characters into atomic words so words NEVER split across lines
  const words = useMemo(() => {
    const list: { chars: { item: CharacterState; index: number }[]; isNewline?: boolean }[] = [];
    let currentWord: { item: CharacterState; index: number }[] = [];

    characters.forEach((item, index) => {
      if (item.char === '\n') {
        if (currentWord.length > 0) {
          list.push({ chars: currentWord });
          currentWord = [];
        }
        list.push({ chars: [{ item, index }], isNewline: true });
      } else if (item.char === ' ') {
        // Space stays with the word so the word + trailing space wrap atomically
        currentWord.push({ item, index });
        list.push({ chars: currentWord });
        currentWord = [];
      } else {
        currentWord.push({ item, index });
      }
    });

    if (currentWord.length > 0) {
      list.push({ chars: currentWord });
    }

    return list;
  }, [characters]);

  // Recalculate Caret position based on currentIndex span
  const updateCaretPosition = useCallback(() => {
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      const targetSpan = charSpanRefs.current[currentIndex];

      // If reached end, measure after last character
      if (!targetSpan && currentIndex > 0 && charSpanRefs.current[currentIndex - 1]) {
        const prevSpan = charSpanRefs.current[currentIndex - 1];
        if (prevSpan) {
          const pRect = prevSpan.getBoundingClientRect();
          setCaretRect({
            left: pRect.right - containerRect.left + container.scrollLeft,
            top: pRect.top - containerRect.top + container.scrollTop,
            width: 2,
            height: pRect.height,
          });
          return;
        }
      }

      if (targetSpan) {
        const spanRect = targetSpan.getBoundingClientRect();
        const left = spanRect.left - containerRect.left + container.scrollLeft;
        const top = spanRect.top - containerRect.top + container.scrollTop;

        setCaretRect({
          left,
          top,
          width: spanRect.width || 12,
          height: spanRect.height || 32,
        });

        // Smooth auto-scroll container so current line stays in view
        const relativeTop = spanRect.top - containerRect.top;
        if (relativeTop < 20) {
          container.scrollTo({ top: container.scrollTop + relativeTop - 30, behavior: 'smooth' });
        } else if (relativeTop > container.clientHeight - 60) {
          container.scrollTo({
            top: container.scrollTop + relativeTop - container.clientHeight / 2,
            behavior: 'smooth',
          });
        }
      }
    });
  }, [currentIndex]);

  useEffect(() => {
    updateCaretPosition();
    setLastTypedTime(Date.now());
  }, [currentIndex, characters, updateCaretPosition]);

  // Handle window resize to re-align caret
  useEffect(() => {
    const handleResize = () => {
      updateCaretPosition();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCaretPosition]);

  // Initial focus
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompleted || isPaused) return;

    // Detect Caps Lock modifier
    setCapsLockOn(e.getModifierState('CapsLock'));

    // Handle Word Backspace (Ctrl+Backspace or Alt+Backspace) vs single Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const isWord = e.ctrlKey || e.altKey;
      onBackspace(isWord);
      return;
    }

    // Handle Enter (newlines)
    if (e.key === 'Enter') {
      e.preventDefault();
      onKeyPress('\n');
      return;
    }

    // Handle standard typing characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onKeyPress(e.key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'md':
        return 'text-lg sm:text-xl leading-relaxed sm:leading-loose tracking-wider';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-relaxed sm:leading-loose tracking-wide';
      case 'lg':
      default:
        return 'text-xl sm:text-2xl leading-relaxed sm:leading-loose tracking-wide';
    }
  };

  return (
    <div
      onClick={focusInput}
      className="relative w-full rounded-2xl bg-slate-900/90 dark:bg-slate-950/80 border border-slate-800 shadow-xl overflow-hidden cursor-text transition-all min-h-[220px] max-h-[360px] flex flex-col justify-center"
    >
      {/* Hidden input for physical keyboard & mobile soft keyboards */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute -left-[9999px] top-0 w-1 h-1 pointer-events-none"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* CapsLock Warning Badge */}
      {capsLockOn && (
        <div className="absolute top-3 right-4 z-30 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold animate-pulse shadow-md">
          ⇪ CAPS LOCK ON
        </div>
      )}

      {/* Text Container with Monospace Font */}
      <div
        ref={containerRef}
        className={`relative w-full p-6 sm:p-8 overflow-y-auto max-h-[340px] font-mono select-none outline-none ${getFontSizeClass()}`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Animated Caret overlay */}
        <AnimatedCaret
          styleType={caretStyle}
          smooth={smoothCaret}
          rect={caretRect}
          isFocused={isFocused}
          isPaused={isPaused}
          lastTypedTime={lastTypedTime}
        />

        {/* Word-grouped stream: words will wrap atomically to the next line without splitting */}
        <div className="flex flex-wrap items-baseline gap-x-0 gap-y-1.5">
          {words.map((word, wIdx) => {
            if (word.isNewline) {
              const idx = word.chars[0].index;
              const item = word.chars[0].item;
              return (
                <React.Fragment key={`nl-${idx}`}>
                  <span
                    ref={(el) => {
                      charSpanRefs.current[idx] = el;
                    }}
                    className={`inline-block px-1 font-sans text-xs opacity-40 ${
                      item.status === 'incorrect' ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    ↵
                  </span>
                  <div className="basis-full h-2" />
                </React.Fragment>
              );
            }

            return (
              <span
                key={`w-${wIdx}`}
                className="inline-flex items-baseline whitespace-nowrap"
              >
                {word.chars.map(({ item, index: idx }) => {
                  let colorClass = 'text-slate-500 typing-char-pending'; // pending
                  let extraDecoration = '';

                  if (item.status === 'correct') {
                    colorClass = 'text-slate-100 font-semibold typing-char-correct';
                  } else if (item.status === 'incorrect') {
                    colorClass = 'text-rose-400 bg-rose-500/20 rounded-xs font-semibold typing-char-incorrect';
                    extraDecoration = 'underline decoration-rose-500 decoration-2 underline-offset-4';
                  }

                  const isCurrent = idx === currentIndex;

                  return (
                    <span
                      key={idx}
                      ref={(el) => {
                        charSpanRefs.current[idx] = el;
                      }}
                      className={`relative inline-block transition-colors duration-75 ${colorClass} ${extraDecoration} ${
                        isCurrent ? 'bg-cyan-500/10 rounded-xs' : ''
                      }`}
                      style={{
                        minWidth: item.char === ' ' ? '0.45em' : 'auto',
                      }}
                    >
                      {item.char === ' ' ? (
                        item.status === 'incorrect' ? (
                          <span className="inline-block px-0.5 text-rose-400 font-bold">␣</span>
                        ) : (
                          '\u00A0'
                        )
                      ) : (
                        item.char
                      )}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 transition-all">
          <div className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium text-sm flex items-center gap-2 shadow-lg">
            <span>Practice Paused — Timer Stopped</span>
          </div>
          <button
            onClick={onResume}
            className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-md hover:shadow-cyan-500/25 cursor-pointer"
          >
            Click or Press Space to Resume
          </button>
        </div>
      )}

      {/* Focus Prompt Banner (when user clicks outside) */}
      {!isFocused && !isPaused && !isCompleted && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-25 cursor-pointer">
          <div className="px-4 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-medium animate-pulse shadow-lg">
            Click here or press any key to focus & type
          </div>
        </div>
      )}
    </div>
  );
};
