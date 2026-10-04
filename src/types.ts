export type CaretStyle = 'bar' | 'glow-bar' | 'block' | 'underline' | 'box';

export type SoundTheme =
  | 'clicky-kailh'
  | 'clicky-clack'
  | 'cherry-blue'
  | 'cherry-brown'
  | 'gateron-black'
  | 'holy-panda'
  | 'thocky'
  | 'typewriter'
  | 'digital-pop'
  | 'laptop'
  | 'custom'
  | 'off';

export type AppTheme =
  | 'slate-dark'
  | 'light-clean'
  | 'cyberpunk'
  | 'terminal'
  | 'sepia'
  | 'dracula'
  | 'nord'
  | 'monokai';

export type AccentColor = 'cyan' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky';

export type FontFamily = 'mono' | 'jetbrains' | 'fira' | 'sans';

export type BackspaceMode = 'free' | 'strict';

export type PracticeCategory = 'time' | 'words' | 'quotes' | 'code' | 'zen' | 'custom';

export interface Lesson {
  id: string;
  title: string;
  category: 'beginner' | 'words' | 'quotes' | 'code' | 'speed' | 'custom';
  language?: string; // for code exercises: js, ts, python, html, css, rust, go, sql, cpp
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  text: string;
  targetWpm?: number;
}

export interface CharacterState {
  char: string;
  status: 'pending' | 'correct' | 'incorrect';
  typedChar?: string;
}

export interface TypingStats {
  wpm: number;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  cpm: number;
  correctChars: number;
  incorrectChars: number;
  totalTypedChars: number;
  elapsedSeconds: number;
  targetSeconds?: number;
  progressPercent: number;
  errorMap: Record<string, number>;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  stars: number; // 0 to 3
  unlocked: boolean;
  completedAt?: string;
}

export interface UserSettings {
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  soundTheme: SoundTheme;
  soundVolume: number; // 0 to 1
  soundEnabled: boolean;
  errorSoundEnabled: boolean;
  errorSoundVolume: number; // 0 to 1
  theme: AppTheme;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  backspaceMode: BackspaceMode;
  showKeyboard: boolean;
  showHandsGuide: boolean;
  fontSize: 'md' | 'lg' | 'xl';
  hasCustomKeystrokeAudio: boolean;
  hasCustomErrorAudio: boolean;
  spaceJumpsWord: boolean;
}
