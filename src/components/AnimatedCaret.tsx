import React, { useEffect, useState } from 'react';
import { CaretStyle } from '../types';

interface AnimatedCaretProps {
  styleType: CaretStyle;
  smooth: boolean;
  rect: { left: number; top: number; width: number; height: number } | null;
  isFocused: boolean;
  isPaused: boolean;
  lastTypedTime: number;
}

export const AnimatedCaret: React.FC<AnimatedCaretProps> = ({
  styleType,
  smooth,
  rect,
  isFocused,
  isPaused,
  lastTypedTime,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // If user has not typed in the last 500ms, start subtle breathing blink
  useEffect(() => {
    setIsBlinking(false);
    const timer = setTimeout(() => {
      setIsBlinking(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [lastTypedTime]);

  if (!rect || !isFocused || isPaused) {
    return null;
  }

  // Hardware-accelerated GPU transition for fluid motion
  const transitionStyle = smooth
    ? 'transform 70ms cubic-bezier(0.18, 0.89, 0.32, 1.15), width 60ms ease, height 60ms ease, opacity 150ms ease'
    : 'none';

  let caretClass = '';
  let inlineStyles: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    transition: transitionStyle,
    willChange: 'transform, width, height, opacity',
  };

  switch (styleType) {
    case 'bar':
      caretClass = 'bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.7)]';
      inlineStyles = {
        ...inlineStyles,
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        width: '2.5px',
        height: `${rect.height}px`,
      };
      break;

    case 'glow-bar':
      caretClass = 'bg-emerald-400 rounded-full shadow-[0_0_14px_rgba(52,211,153,0.95)]';
      inlineStyles = {
        ...inlineStyles,
        transform: `translate3d(${rect.left - 0.5}px, ${rect.top}px, 0)`,
        width: '3.5px',
        height: `${rect.height}px`,
      };
      break;

    case 'block':
      caretClass = 'bg-cyan-500/35 border-b-2 border-cyan-400 rounded-xs shadow-[0_0_8px_rgba(6,182,212,0.3)]';
      inlineStyles = {
        ...inlineStyles,
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        width: `${Math.max(rect.width, 10)}px`,
        height: `${rect.height}px`,
      };
      break;

    case 'underline':
      caretClass = 'bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]';
      inlineStyles = {
        ...inlineStyles,
        transform: `translate3d(${rect.left}px, ${rect.top + rect.height - 3}px, 0)`,
        width: `${Math.max(rect.width, 10)}px`,
        height: '3px',
      };
      break;

    case 'box':
      caretClass = 'border-2 border-cyan-400 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.45)] bg-cyan-400/10';
      inlineStyles = {
        ...inlineStyles,
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        width: `${Math.max(rect.width, 10)}px`,
        height: `${rect.height}px`,
      };
      break;
  }

  return (
    <div
      style={inlineStyles}
      className={`z-20 ${caretClass} ${isBlinking ? 'animate-pulse' : 'opacity-100'}`}
      aria-hidden="true"
    />
  );
};
