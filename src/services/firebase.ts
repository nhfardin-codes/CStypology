import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TypingStats, Lesson } from '../types';
import {
  loadAllTimeMilestones,
  saveAllTimeMilestones,
  AllTimeMilestones,
} from './storage';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, check connection.');
    }
  }
}
testConnection();

export interface UserStatsProfile {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  totalTestsCompleted: number;
  bestWpm: number;
  averageWpm: number;
  averageAccuracy: number;
  totalWordsTyped?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedTypingRecord {
  id: string;
  userId: string;
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

// Google Sign-In via popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      await syncMilestonesWithCloud(user);
    }
    return user;
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

// Sign-Out
export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Sync local milestones with Firestore cloud
export async function syncMilestonesWithCloud(user: User): Promise<AllTimeMilestones> {
  const local = loadAllTimeMilestones();
  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const cloud = snapshot.data() as UserStatsProfile;
      // Merge: take maximum best WPM, highest test count, best accuracy
      const mergedBestWpm = Math.max(local.bestWpm || 0, cloud.bestWpm || 0);
      const mergedTotalTests = Math.max(local.totalTestsCompleted || 0, cloud.totalTestsCompleted || 0);
      const mergedAvgWpm = cloud.averageWpm || local.averageWpm || 0;
      const mergedAvgAcc = cloud.averageAccuracy || local.averageAccuracy || 100;
      const mergedWords = (local.totalWordsTyped || 0) + (cloud.totalWordsTyped || 0);

      const mergedMilestones: AllTimeMilestones = {
        bestWpm: mergedBestWpm,
        averageWpm: mergedAvgWpm,
        averageAccuracy: mergedAvgAcc,
        totalTestsCompleted: mergedTotalTests,
        totalWordsTyped: mergedWords,
        lastUpdated: new Date().toISOString(),
      };

      saveAllTimeMilestones(mergedMilestones);

      await setDoc(userRef, {
        userId: user.uid,
        displayName: user.displayName || cloud.displayName || 'Typist',
        email: user.email || cloud.email || '',
        photoURL: user.photoURL || cloud.photoURL,
        totalTestsCompleted: mergedTotalTests,
        bestWpm: mergedBestWpm,
        averageWpm: mergedAvgWpm,
        averageAccuracy: mergedAvgAcc,
        totalWordsTyped: mergedWords,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return mergedMilestones;
    } else {
      // First cloud sync: push local milestones to cloud
      const newProfile: UserStatsProfile = {
        userId: user.uid,
        displayName: user.displayName || 'Typist',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
        totalTestsCompleted: local.totalTestsCompleted || 0,
        bestWpm: local.bestWpm || 0,
        averageWpm: local.averageWpm || 0,
        averageAccuracy: local.averageAccuracy || 100,
        totalWordsTyped: local.totalWordsTyped || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userRef, newProfile);
      return local;
    }
  } catch (err) {
    console.error('Failed to sync milestones with cloud:', err);
    return local;
  }
}

// Save Typing Test Record and update User Profile
export async function saveCompletedSession(
  user: User,
  stats: TypingStats,
  lesson: Lesson
): Promise<SavedTypingRecord | null> {
  try {
    const recordId = `rec_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const record: SavedTypingRecord = {
      id: recordId,
      userId: user.uid,
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

    // 1. Save record under /users/{userId}/records/{recordId}
    const recordRef = doc(db, 'users', user.uid, 'records', recordId);
    await setDoc(recordRef, record);

    // 2. Update aggregate profile in /users/{userId}
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const current = snap.exists() ? (snap.data() as UserStatsProfile) : null;

    const prevCount = current?.totalTestsCompleted || 0;
    const newCount = prevCount + 1;
    const prevBest = current?.bestWpm || 0;
    const newBest = Math.max(prevBest, stats.netWpm);

    const prevAvgWpm = current?.averageWpm || 0;
    const newAvgWpm = Math.round((prevAvgWpm * prevCount + stats.netWpm) / newCount);

    const prevAvgAcc = current?.averageAccuracy || 100;
    const newAvgAcc = Math.round((prevAvgAcc * prevCount + stats.accuracy) / newCount);

    const wordsTyped = Math.round(stats.correctChars / 5);
    const prevWords = current?.totalWordsTyped || 0;

    const updatedProfile: UserStatsProfile = {
      userId: user.uid,
      displayName: user.displayName || current?.displayName || 'Typist',
      email: user.email || current?.email || '',
      photoURL: user.photoURL || current?.photoURL,
      totalTestsCompleted: newCount,
      bestWpm: newBest,
      averageWpm: newAvgWpm,
      averageAccuracy: newAvgAcc,
      totalWordsTyped: prevWords + wordsTyped,
      createdAt: current?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    await setDoc(userRef, updatedProfile, { merge: true });
    return record;
  } catch (error) {
    console.error('Failed to save session to Firestore:', error);
    return null;
  }
}

// Fetch recent records for user
export async function fetchUserRecords(userId: string, max = 25): Promise<SavedTypingRecord[]> {
  try {
    const colRef = collection(db, 'users', userId, 'records');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(max));
    const querySnapshot = await getDocs(q);
    const list: SavedTypingRecord[] = [];
    querySnapshot.forEach((d) => {
      list.push(d.data() as SavedTypingRecord);
    });
    return list;
  } catch (err) {
    console.error('Failed to load user records from Firestore:', err);
    return [];
  }
}

// Fetch user profile stats
export async function fetchUserProfile(userId: string): Promise<UserStatsProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserStatsProfile;
    }
    return null;
  } catch (err) {
    console.error('Failed to load user profile:', err);
    return null;
  }
}
