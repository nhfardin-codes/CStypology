import React from 'react';

interface VirtualKeyboardProps {
  targetKey: string;
  activeKey: string | null;
  showFingerGuide: boolean;
}

interface KeyConfig {
  code: string;
  label: string;
  shiftLabel?: string;
  finger: 'lp' | 'lr' | 'lm' | 'li' | 'th' | 'ri' | 'rm' | 'rr' | 'rp';
  width?: string;
}

const FINGER_NAMES: Record<string, string> = {
  lp: 'Left Pinky',
  lr: 'Left Ring',
  lm: 'Left Middle',
  li: 'Left Index',
  th: 'Thumb (Space)',
  ri: 'Right Index',
  rm: 'Right Middle',
  rr: 'Right Ring',
  rp: 'Right Pinky',
};

const FINGER_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  lp: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-rose-500/30' },
  lr: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/30' },
  lm: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/30' },
  li: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/30' },
  th: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/30' },
  ri: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/30' },
  rm: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/30' },
  rr: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/30' },
  rp: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-rose-500/30' },
};

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Number Row
  [
    { code: '`', label: '`', shiftLabel: '~', finger: 'lp' },
    { code: '1', label: '1', shiftLabel: '!', finger: 'lp' },
    { code: '2', label: '2', shiftLabel: '@', finger: 'lr' },
    { code: '3', label: '3', shiftLabel: '#', finger: 'lm' },
    { code: '4', label: '4', shiftLabel: '$', finger: 'li' },
    { code: '5', label: '5', shiftLabel: '%', finger: 'li' },
    { code: '6', label: '6', shiftLabel: '^', finger: 'ri' },
    { code: '7', label: '7', shiftLabel: '&', finger: 'ri' },
    { code: '8', label: '8', shiftLabel: '*', finger: 'rm' },
    { code: '9', label: '9', shiftLabel: '(', finger: 'rr' },
    { code: '0', label: '0', shiftLabel: ')', finger: 'rp' },
    { code: '-', label: '-', shiftLabel: '_', finger: 'rp' },
    { code: '=', label: '=', shiftLabel: '+', finger: 'rp' },
    { code: 'Backspace', label: 'Delete', finger: 'rp', width: 'flex-[1.5]' },
  ],
  // Top Row
  [
    { code: 'Tab', label: 'Tab', finger: 'lp', width: 'flex-[1.4]' },
    { code: 'q', label: 'Q', finger: 'lp' },
    { code: 'w', label: 'W', finger: 'lr' },
    { code: 'e', label: 'E', finger: 'lm' },
    { code: 'r', label: 'R', finger: 'li' },
    { code: 't', label: 'T', finger: 'li' },
    { code: 'y', label: 'Y', finger: 'ri' },
    { code: 'u', label: 'U', finger: 'ri' },
    { code: 'i', label: 'I', finger: 'rm' },
    { code: 'o', label: 'O', finger: 'rr' },
    { code: 'p', label: 'P', finger: 'rp' },
    { code: '[', label: '[', shiftLabel: '{', finger: 'rp' },
    { code: ']', label: ']', shiftLabel: '}', finger: 'rp' },
    { code: '\\', label: '\\', shiftLabel: '|', finger: 'rp' },
  ],
  // Home Row
  [
    { code: 'CapsLock', label: 'Caps', finger: 'lp', width: 'flex-[1.6]' },
    { code: 'a', label: 'A', finger: 'lp' },
    { code: 's', label: 'S', finger: 'lr' },
    { code: 'd', label: 'D', finger: 'lm' },
    { code: 'f', label: 'F', finger: 'li' },
    { code: 'g', label: 'G', finger: 'li' },
    { code: 'h', label: 'H', finger: 'ri' },
    { code: 'j', label: 'J', finger: 'ri' },
    { code: 'k', label: 'K', finger: 'rm' },
    { code: 'l', label: 'L', finger: 'rr' },
    { code: ';', label: ';', shiftLabel: ':', finger: 'rp' },
    { code: "'", label: "'", shiftLabel: '"', finger: 'rp' },
    { code: 'Enter', label: 'Return', finger: 'rp', width: 'flex-[1.8]' },
  ],
  // Bottom Row
  [
    { code: 'ShiftLeft', label: 'Shift', finger: 'lp', width: 'flex-[2.1]' },
    { code: 'z', label: 'Z', finger: 'lp' },
    { code: 'x', label: 'X', finger: 'lr' },
    { code: 'c', label: 'C', finger: 'lm' },
    { code: 'v', label: 'V', finger: 'li' },
    { code: 'b', label: 'B', finger: 'li' },
    { code: 'n', label: 'N', finger: 'ri' },
    { code: 'm', label: 'M', finger: 'ri' },
    { code: ',', label: ',', shiftLabel: '<', finger: 'rm' },
    { code: '.', label: '.', shiftLabel: '>', finger: 'rr' },
    { code: '/', label: '/', shiftLabel: '?', finger: 'rp' },
    { code: 'ShiftRight', label: 'Shift', finger: 'rp', width: 'flex-[2.1]' },
  ],
  // Space Row
  [
    { code: 'Control', label: 'Ctrl', finger: 'lp', width: 'flex-[1.2]' },
    { code: 'Alt', label: 'Alt', finger: 'lp', width: 'flex-[1.2]' },
    { code: ' ', label: 'Space', finger: 'th', width: 'flex-[6.5]' },
    { code: 'AltGraph', label: 'Alt', finger: 'rp', width: 'flex-[1.2]' },
    { code: 'ControlRight', label: 'Ctrl', finger: 'rp', width: 'flex-[1.2]' },
  ],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  targetKey,
  activeKey,
  showFingerGuide,
}) => {
  const normalizedTarget = targetKey.toLowerCase();
  const normalizedActive = activeKey ? activeKey.toLowerCase() : null;

  // Find target finger for guide
  let activeFinger = 'th';
  if (targetKey === ' ' || targetKey === 'Space') {
    activeFinger = 'th';
  } else if (targetKey === '\n') {
    activeFinger = 'rp';
  } else {
    for (const row of KEYBOARD_ROWS) {
      for (const k of row) {
        if (
          k.code.toLowerCase() === normalizedTarget ||
          k.label.toLowerCase() === normalizedTarget ||
          (k.shiftLabel && k.shiftLabel === targetKey)
        ) {
          activeFinger = k.finger;
          break;
        }
      }
    }
  }

  const isKeyTarget = (k: KeyConfig) => {
    if (targetKey === ' ' && k.code === ' ') return true;
    if (targetKey === '\n' && k.code === 'Enter') return true;
    if (k.code.toLowerCase() === normalizedTarget) return true;
    if (k.label.toLowerCase() === normalizedTarget) return true;
    if (k.shiftLabel && k.shiftLabel === targetKey) return true;
    return false;
  };

  const isKeyActive = (k: KeyConfig) => {
    if (!normalizedActive) return false;
    if (normalizedActive === ' ' && k.code === ' ') return true;
    if (normalizedActive === 'enter' && k.code === 'Enter') return true;
    if (normalizedActive === 'backspace' && k.code === 'Backspace') return true;
    return k.code.toLowerCase() === normalizedActive || k.label.toLowerCase() === normalizedActive;
  };

  return (
    <div className="keyboard-tray w-full max-w-4xl mx-auto flex flex-col gap-2 p-3.5 bg-slate-900/70 rounded-xl border border-slate-800/80 shadow-inner select-none transition-all">
      {/* Finger placement guide badge */}
      {showFingerGuide && (
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-slate-500 font-medium">Target Key:</span>
            <span className="inline-flex items-center justify-center font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 min-w-6">
              {targetKey === ' ' ? 'Space ␣' : targetKey === '\n' ? '↵ Enter' : targetKey}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-slate-500 font-medium">Suggested Finger:</span>
            <span className="text-xs font-semibold text-slate-200">
              {FINGER_NAMES[activeFinger] || 'Any'}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Matrix */}
      <div className="flex flex-col gap-1.5 w-full">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 w-full">
            {row.map((k) => {
              const target = isKeyTarget(k);
              const active = isKeyActive(k);
              const colorInfo = FINGER_COLORS[k.finger];
              const flexWidth = k.width || 'flex-1';

              let keyStyle = 'keycap-default bg-slate-800/80 text-slate-300 border-slate-700/60';
              if (active) {
                keyStyle = 'bg-cyan-500 text-slate-950 border-cyan-300 scale-[0.96] shadow-[0_0_12px_rgba(6,182,212,0.8)] font-bold';
              } else if (target) {
                keyStyle = 'bg-cyan-500/25 text-cyan-300 border-cyan-400 animate-pulse ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold';
              } else {
                keyStyle = `keycap-default ${colorInfo.bg} text-slate-300 ${colorInfo.border} hover:border-slate-500/60`;
              }

              return (
                <div
                  key={k.code}
                  className={`${flexWidth} h-10 sm:h-11 rounded-md border flex flex-col items-center justify-center transition-all duration-75 text-xs sm:text-sm font-mono cursor-default relative overflow-hidden ${keyStyle}`}
                >
                  {k.shiftLabel && (
                    <span className="text-[10px] text-slate-400 absolute top-0.5 right-1.5 opacity-70 leading-none">
                      {k.shiftLabel}
                    </span>
                  )}
                  <span className={k.shiftLabel ? 'mt-1 font-medium' : 'font-medium'}>
                    {k.label}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
