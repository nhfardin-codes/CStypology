import { UserSettings, Lesson, TypingStats } from '../types';

const SETTINGS_KEY = 'cstypology_settings_v1';
const CUSTOM_LESSONS_KEY = 'cstypology_custom_lessons_v1';
const MILESTONES_KEY = 'cstypology_all_time_milestones_v1';
const HISTORY_KEY = 'cstypology_history_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  caretStyle: 'bar',
  smoothCaret: true,
  soundTheme: 'clicky-kailh',
  soundVolume: 0.75,
  soundEnabled: true,
  errorSoundEnabled: true,
  errorSoundVolume: 0.6,
  theme: 'slate-dark',
  accentColor: 'cyan',
  fontFamily: 'mono',
  backspaceMode: 'free',
  showKeyboard: true,
  showHandsGuide: false,
  fontSize: 'lg',
  hasCustomKeystrokeAudio: false,
  hasCustomErrorAudio: false,
  spaceJumpsWord: false,
};

export interface AllTimeMilestones {
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  totalTestsCompleted: number;
  totalWordsTyped: number;
  lastUpdated: string;
}

export interface LocalTypingRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  category: string;
  netWpm: number;
  rawWpm: number;
  accuracy: number;
  cpm: number;
  elapsedSeconds: number;
  timestamp: string;
}

export const DEFAULT_MILESTONES: AllTimeMilestones = {
  bestWpm: 0,
  averageWpm: 0,
  averageAccuracy: 100,
  totalTestsCompleted: 0,
  totalWordsTyped: 0,
  lastUpdated: new Date().toISOString(),
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export function loadAllTimeMilestones(): AllTimeMilestones {
  try {
    const raw = localStorage.getItem(MILESTONES_KEY);
    if (!raw) return DEFAULT_MILESTONES;
    return { ...DEFAULT_MILESTONES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MILESTONES;
  }
}

export function saveAllTimeMilestones(milestones: AllTimeMilestones): void {
  try {
    localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
  } catch (e) {
    console.error('Failed to save milestones to localStorage:', e);
  }
}

export function loadLocalHistory(max = 25): LocalTypingRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list: LocalTypingRecord[] = JSON.parse(raw);
    return list.slice(0, max);
  } catch {
    return [];
  }
}

export function recordCompletedTest(
  stats: TypingStats,
  lesson: Lesson
): { updatedMilestones: AllTimeMilestones; newRecord: LocalTypingRecord } {
  const prev = loadAllTimeMilestones();
  const prevCount = prev.totalTestsCompleted || 0;
  const newCount = prevCount + 1;
  const newBestWpm = Math.max(prev.bestWpm || 0, stats.netWpm);
  const newAvgWpm = Math.round(((prev.averageWpm || 0) * prevCount + stats.netWpm) / newCount);
  const newAvgAcc = Math.round(((prev.averageAccuracy || 100) * prevCount + stats.accuracy) / newCount);
  const wordsInThisTest = Math.round(stats.correctChars / 5);
  const newTotalWords = (prev.totalWordsTyped || 0) + wordsInThisTest;
  const timestamp = new Date().toISOString();

  const updatedMilestones: AllTimeMilestones = {
    bestWpm: newBestWpm,
    averageWpm: newAvgWpm,
    averageAccuracy: newAvgAcc,
    totalTestsCompleted: newCount,
    totalWordsTyped: newTotalWords,
    lastUpdated: timestamp,
  };

  saveAllTimeMilestones(updatedMilestones);

  const newRecord: LocalTypingRecord = {
    id: `rec_${Date.now()}`,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    category: lesson.category,
    netWpm: stats.netWpm,
    rawWpm: stats.rawWpm,
    accuracy: stats.accuracy,
    cpm: stats.cpm,
    elapsedSeconds: stats.elapsedSeconds,
    timestamp,
  };

  try {
    const existing = loadLocalHistory(50);
    const updatedHistory = [newRecord, ...existing.filter((r) => r.id !== newRecord.id)].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to save test record history:', e);
  }

  return { updatedMilestones, newRecord };
}

export function loadCustomLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(CUSTOM_LESSONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomLesson(lesson: Lesson): Lesson[] {
  try {
    const existing = loadCustomLessons();
    const updated = [lesson, ...existing.filter((l) => l.id !== lesson.id)];
    localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteCustomLesson(id: string): Lesson[] {
  try {
    const existing = loadCustomLessons();
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
