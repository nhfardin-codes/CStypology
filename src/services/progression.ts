import { Lesson, TypingStats, LessonProgress } from '../types';
import { BUILT_IN_LESSONS } from './lessons';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PROGRESS_STORAGE_KEY = 'cstypology_lesson_progression_v1';

export function calculateStars(stats: TypingStats, targetWpm = 30): number {
  if (stats.accuracy >= 96 && stats.netWpm >= targetWpm) {
    return 3;
  }
  if (stats.accuracy >= 90 && stats.netWpm >= Math.max(15, targetWpm * 0.75)) {
    return 2;
  }
  return 1;
}

export function getInitialProgression(allLessons: Lesson[]): Record<string, LessonProgress> {
  const result: Record<string, LessonProgress> = {};
  allLessons.forEach((lesson, index) => {
    result[lesson.id] = {
      lessonId: lesson.id,
      completed: false,
      bestWpm: 0,
      bestAccuracy: 0,
      stars: 0,
      // The first lesson (and custom lessons) are unlocked initially
      unlocked: index === 0 || lesson.category === 'custom',
    };
  });
  return result;
}

export function loadLocalProgression(allLessons: Lesson[]): Record<string, LessonProgress> {
  const base = getInitialProgression(allLessons);
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export function saveLocalProgression(progress: Record<string, LessonProgress>): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progression to localStorage:', err);
  }
}

export async function fetchCloudProgression(
  userId: string,
  allLessons: Lesson[]
): Promise<Record<string, LessonProgress> | null> {
  try {
    const docRef = doc(db, 'users', userId, 'records', '_progression_summary');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const base = getInitialProgression(allLessons);
      return { ...base, ...(data.levels || {}) };
    }
  } catch (err) {
    console.error('Failed to fetch cloud progression:', err);
  }
  return null;
}

export async function saveCloudProgression(
  userId: string,
  progression: Record<string, LessonProgress>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'records', '_progression_summary');
    await setDoc(docRef, {
      userId,
      levels: progression,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error('Failed to sync progression to Firestore:', err);
  }
}

export function updateLessonCompletion(
  currentLesson: Lesson,
  allLessons: Lesson[],
  stats: TypingStats,
  currentProgression: Record<string, LessonProgress>,
  userId?: string
): {
  updatedProgression: Record<string, LessonProgress>;
  starsEarned: number;
  nextLesson: Lesson | null;
  isNewlyUnlocked: boolean;
} {
  const targetWpm = currentLesson.targetWpm || 30;
  const starsEarned = calculateStars(stats, targetWpm);
  const currentRecord = currentProgression[currentLesson.id] || {
    lessonId: currentLesson.id,
    completed: false,
    bestWpm: 0,
    bestAccuracy: 0,
    stars: 0,
    unlocked: true,
  };

  const updatedCurrent: LessonProgress = {
    ...currentRecord,
    completed: true,
    unlocked: true,
    bestWpm: Math.max(currentRecord.bestWpm, stats.netWpm),
    bestAccuracy: Math.max(currentRecord.bestAccuracy, stats.accuracy),
    stars: Math.max(currentRecord.stars, starsEarned),
    completedAt: new Date().toISOString(),
  };

  const updated: Record<string, LessonProgress> = {
    ...currentProgression,
    [currentLesson.id]: updatedCurrent,
  };

  // Find next lesson to unlock
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  let nextLesson: Lesson | null = null;
  let isNewlyUnlocked = false;

  if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
    nextLesson = allLessons[currentIndex + 1];
    const nextRecord = updated[nextLesson.id] || {
      lessonId: nextLesson.id,
      completed: false,
      bestWpm: 0,
      bestAccuracy: 0,
      stars: 0,
      unlocked: false,
    };

    if (!nextRecord.unlocked) {
      isNewlyUnlocked = true;
    }

    updated[nextLesson.id] = {
      ...nextRecord,
      unlocked: true,
    };
  }

  // Save to local storage
  saveLocalProgression(updated);

  // Sync to Firestore if user is authenticated
  if (userId) {
    saveCloudProgression(userId, updated);
  }

  return {
    updatedProgression: updated,
    starsEarned,
    nextLesson,
    isNewlyUnlocked,
  };
}
