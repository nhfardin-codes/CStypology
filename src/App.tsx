/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Keyboard,
  Settings,
  BookOpen,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Command,
  Sun,
  Moon,
  Github,
  Instagram,
  ExternalLink,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, saveCompletedSession, syncMilestonesWithCloud } from './services/firebase';
import {
  CharacterState,
  TypingStats,
  Lesson,
  UserSettings,
  PracticeCategory,
  LessonProgress,
} from './types';
import { BUILT_IN_LESSONS } from './services/lessons';
import { soundEngine } from './services/soundEngine';
import {
  loadLocalProgression,
  updateLessonCompletion,
  fetchCloudProgression,
} from './services/progression';
import {
  loadSettings,
  saveSettings,
  loadCustomLessons,
  saveCustomLesson,
  deleteCustomLesson,
  loadAllTimeMilestones,
  recordCompletedTest,
  AllTimeMilestones,
} from './services/storage';
import {
  generateWordsPractice,
  generateTimePractice,
  generateQuotePractice,
  generateCodePractice,
} from './services/practiceGenerator';

import { TypingArea } from './components/TypingArea';
import { StatsBar } from './components/StatsBar';
import { PracticeBar } from './components/PracticeBar';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { ResultsModal } from './components/ResultsModal';
import { SettingsModal } from './components/SettingsModal';
import { LessonSelector } from './components/LessonSelector';
import { CustomTextModal } from './components/CustomTextModal';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSavedToCloud, setIsSavedToCloud] = useState(false);

  // Navigation: Lessons vs Practice
  const [activeTab, setActiveTab] = useState<'lessons' | 'practice'>('practice');
  const [practiceCategory, setPracticeCategory] = useState<PracticeCategory>('words');
  const [practiceSubOption, setPracticeSubOption] = useState<string | number>(25);

  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [allLessons, setAllLessons] = useState<Lesson[]>(() => {
    const custom = loadCustomLessons();
    return [...BUILT_IN_LESSONS, ...custom];
  });
  const [currentLesson, setCurrentLesson] = useState<Lesson>(() => generateWordsPractice(25));

  // Typing session states
  const [characters, setCharacters] = useState<CharacterState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Accurate Timer with Complete Pause Freeze (0ms drift)
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState<number | undefined>(undefined);

  // Stats
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [errorMap, setErrorMap] = useState<Record<string, number>>({});

  // Active key for virtual keyboard illumination
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Game-like Lesson Progression State
  const [progression, setProgression] = useState<Record<string, LessonProgress>>(() =>
    loadLocalProgression(allLessons)
  );
  const [stageResult, setStageResult] = useState<{
    stars: number;
    nextLesson: Lesson | null;
    isNewlyUnlocked: boolean;
  } | null>(null);

  // Snapshot of stats when paused so both Time and WPM freeze completely
  const [frozenStats, setFrozenStats] = useState<TypingStats | null>(null);

  // All-time career milestones & WPM count
  const [milestones, setMilestones] = useState<AllTimeMilestones>(loadAllTimeMilestones);

  const timerRef = useRef<number | null>(null);

  // Initialize lesson characters
  const setupLesson = useCallback((lesson: Lesson, countdownSeconds?: number) => {
    const chars: CharacterState[] = lesson.text.split('').map((char) => ({
      char,
      status: 'pending',
    }));
    setCharacters(chars);
    setCurrentIndex(0);
    setIsStarted(false);
    setIsPaused(false);
    setIsCompleted(false);
    setStartTime(null);
    setPausedAt(null);
    setTotalPausedMs(0);
    setElapsedSeconds(0);
    setTargetSeconds(countdownSeconds);
    setTotalTypedChars(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setErrorMap({});
    setIsSavedToCloud(false);
    setStageResult(null);
    setFrozenStats(null);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync progression and all-time milestones from Firestore when authenticated
  useEffect(() => {
    if (user) {
      syncMilestonesWithCloud(user).then((synced) => {
        if (synced) setMilestones(synced);
      });
      fetchCloudProgression(user.uid, allLessons).then((cloudProg) => {
        if (cloudProg) {
          setProgression((prev) => ({ ...prev, ...cloudProg }));
        }
      });
    }
  }, [user, allLessons]);

  // Sync sound engine on settings change
  useEffect(() => {
    soundEngine.setSoundEnabled(settings.soundEnabled);
    soundEngine.setSoundTheme(settings.soundTheme);
    soundEngine.setVolume(settings.soundVolume);
    soundEngine.setErrorSoundEnabled(settings.errorSoundEnabled);
    soundEngine.setErrorVolume(settings.errorSoundVolume);
    saveSettings(settings);
  }, [settings]);

  // Initial load
  useEffect(() => {
    setupLesson(currentLesson);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When test completes: update milestones, save WPM count, advance progression, & sync to Firestore
  useEffect(() => {
    if (isCompleted) {
      // 1. Record WPM session & update all-time career milestones (local + persistent)
      const { updatedMilestones } = recordCompletedTest(currentStats, currentLesson);
      setMilestones(updatedMilestones);

      // 2. If in Lessons mode, advance game progression and unlock next level
      if (activeTab === 'lessons') {
        const result = updateLessonCompletion(
          currentLesson,
          allLessons,
          currentStats,
          progression,
          user?.uid
        );
        setProgression(result.updatedProgression);
        setStageResult({
          stars: result.starsEarned,
          nextLesson: result.nextLesson,
          isNewlyUnlocked: result.isNewlyUnlocked,
        });
      }

      // 3. Cloud save to Firestore if user is authenticated
      if (user) {
        saveCompletedSession(user, currentStats, currentLesson).then((res) => {
          if (res) setIsSavedToCloud(true);
        });
      }
    }
  }, [isCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer interval: strictly frozen while paused!
  useEffect(() => {
    if (isStarted && !isPaused && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        if (startTime) {
          const now = Date.now();
          const activeMs = Math.max(0, (now - startTime) - totalPausedMs);
          const secs = Math.max(1, Math.floor(activeMs / 1000));
          setElapsedSeconds(secs);

          // Time mode countdown finish check
          if (targetSeconds && secs >= targetSeconds) {
            setIsCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isPaused, isCompleted, startTime, totalPausedMs, targetSeconds]);

  // Derived Live Stats Calculation
  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const grossWpm = Math.round(totalTypedChars / 5 / minutes) || 0;
  const uncorrectedErrors = characters.filter((c) => c.status === 'incorrect').length;
  const netWpm = Math.max(0, Math.round((totalTypedChars / 5 - uncorrectedErrors) / minutes)) || 0;
  const accuracy = totalTypedChars > 0 ? Math.max(0, Math.round((correctChars / totalTypedChars) * 100)) : 100;
  const cpm = Math.round(totalTypedChars / minutes) || 0;
  const progressPercent = targetSeconds
    ? Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100))
    : characters.length > 0
    ? Math.round((currentIndex / characters.length) * 100)
    : 0;

  const currentLiveStats: TypingStats = {
    wpm: grossWpm,
    netWpm,
    rawWpm: grossWpm,
    accuracy,
    cpm,
    correctChars,
    incorrectChars,
    totalTypedChars,
    elapsedSeconds,
    targetSeconds,
    progressPercent,
    errorMap,
  };

  // When paused, both time and WPM are completely frozen
  const currentStats: TypingStats = isPaused && frozenStats ? frozenStats : currentLiveStats;

  // Pause / Resume handler that stops both time and WPM
  const handleTogglePause = () => {
    if (!isStarted || isCompleted) return;

    if (!isPaused) {
      // Snapshot current live stats so both Time and WPM freeze immediately
      setFrozenStats(currentLiveStats);
      setIsPaused(true);
      setPausedAt(Date.now());
    } else {
      // Resuming timer without time leak
      if (pausedAt) {
        const pauseDuration = Date.now() - pausedAt;
        setTotalPausedMs((prev) => prev + pauseDuration);
        setPausedAt(null);
      }
      setFrozenStats(null);
      setIsPaused(false);
    }
  };

  // Keystroke input handler
  const handleCharacterInput = (typedChar: string) => {
    if (isCompleted || isPaused) return;

    soundEngine.ensureContext();

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
      setTotalPausedMs(0);
      setPausedAt(null);
    }

    if (currentIndex >= characters.length) return;

    const expectedChar = characters[currentIndex].char;
    const isCorrect = typedChar === expectedChar;
    const isSpace = typedChar === ' ' || expectedChar === ' ';

    // Visual keyboard active key illumination
    setActiveKey(typedChar === ' ' ? ' ' : typedChar);
    setTimeout(() => setActiveKey(null), 120);

    setTotalTypedChars((prev) => prev + 1);

    if (isCorrect) {
      soundEngine.playKeySound(isSpace);
      setCorrectChars((prev) => prev + 1);

      setCharacters((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          status: 'correct',
          typedChar,
        };
        return next;
      });

      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);

      if (nextIdx >= characters.length) {
        setIsCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    } else {
      // Mistake
      soundEngine.playErrorSound();
      setIncorrectChars((prev) => prev + 1);
      setErrorMap((prev) => ({
        ...prev,
        [expectedChar]: (prev[expectedChar] || 0) + 1,
      }));

      if (settings.backspaceMode === 'strict') {
        // Strict lock mode
        setCharacters((prev) => {
          const next = [...prev];
          next[currentIndex] = {
            ...next[currentIndex],
            status: 'incorrect',
            typedChar,
          };
          return next;
        });
      } else {
        // Free mode: advance
        setCharacters((prev) => {
          const next = [...prev];
          next[currentIndex] = {
            ...next[currentIndex],
            status: 'incorrect',
            typedChar,
          };
          return next;
        });

        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);

        if (nextIdx >= characters.length) {
          setIsCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    }
  };

  // Backspace handler with word-level backspace support (Ctrl+Backspace / Alt+Backspace)
  const handleBackspace = (isWord = false) => {
    if (isCompleted || isPaused || currentIndex <= 0) return;

    soundEngine.ensureContext();
    setActiveKey('Backspace');
    setTimeout(() => setActiveKey(null), 120);
    soundEngine.playKeySound(false);

    if (isWord) {
      // Word deletion: backspace to the start of current/previous word
      let targetIdx = currentIndex - 1;
      while (targetIdx > 0 && characters[targetIdx]?.char === ' ') {
        targetIdx--;
      }
      while (targetIdx > 0 && characters[targetIdx - 1]?.char !== ' ') {
        targetIdx--;
      }

      setCharacters((prev) => {
        const next = [...prev];
        for (let i = targetIdx; i < currentIndex; i++) {
          next[i] = { ...next[i], status: 'pending', typedChar: undefined };
        }
        return next;
      });
      setCurrentIndex(targetIdx);
      return;
    }

    // Strict mode resetting current char if incorrect
    if (settings.backspaceMode === 'strict' && characters[currentIndex]?.status === 'incorrect') {
      setCharacters((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          status: 'pending',
          typedChar: undefined,
        };
        return next;
      });
      return;
    }

    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);
    setCharacters((prev) => {
      const next = [...prev];
      next[prevIdx] = {
        ...next[prevIdx],
        status: 'pending',
        typedChar: undefined,
      };
      return next;
    });
  };

  // Practice Mode selection generator
  const handleSelectPractice = (cat: PracticeCategory, sub: string | number) => {
    setPracticeCategory(cat);
    setPracticeSubOption(sub);
    setActiveTab('practice');

    let lesson: Lesson;
    let countdown: number | undefined = undefined;

    switch (cat) {
      case 'time':
        const secs = typeof sub === 'number' ? sub : 30;
        countdown = secs;
        lesson = generateTimePractice(secs);
        break;
      case 'words':
        const count = typeof sub === 'number' ? sub : 25;
        lesson = generateWordsPractice(count);
        break;
      case 'quotes':
        lesson = generateQuotePractice(sub as 'all' | 'short' | 'medium' | 'long');
        break;
      case 'code':
        lesson = generateCodePractice(sub === 'all' ? undefined : (sub as string));
        break;
      case 'zen':
        lesson = {
          id: `practice-zen-${Date.now()}`,
          title: 'Zen Mode (Free Flow)',
          category: 'speed',
          difficulty: 'Easy',
          description: 'Type calmly at your own natural pace without timer pressure.',
          text: 'The art of typing is not haste but smooth continuous rhythm. When fingers move without hesitation, thoughts flow directly into words on screen.',
        };
        break;
      default:
        lesson = generateWordsPractice(25);
    }

    setCurrentLesson(lesson);
    setupLesson(lesson, countdown);
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showLessons || showCustomModal) {
        if (e.key === 'Escape') {
          setShowSettings(false);
          setShowLessons(false);
          setShowCustomModal(false);
        }
        return;
      }

      if (isCompleted) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleNextLesson();
        }
        return;
      }

      // Quick restart via Tab + Enter
      if (e.key === 'Tab') {
        // Tab + Enter quick restart
        const handleTabRestart = (e2: KeyboardEvent) => {
          if (e2.key === 'Enter') {
            e2.preventDefault();
            setupLesson(currentLesson, targetSeconds);
          }
          window.removeEventListener('keydown', handleTabRestart);
        };
        window.addEventListener('keydown', handleTabRestart, { once: true });
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleTogglePause();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showSettings, showLessons, showCustomModal, isCompleted, currentLesson, targetSeconds, setupLesson]);

  // Next lesson navigation (Game progression)
  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < allLessons.length - 1;

  // Pressing logo returns to homepage
  const handleGoHome = () => {
    setActiveTab('practice');
    setPracticeCategory('words');
    setPracticeSubOption(25);
    setShowSettings(false);
    setShowLessons(false);
    setShowProfileModal(false);
    setShowCustomModal(false);
    setIsCompleted(false);
    const homeLesson = generateWordsPractice(25);
    setCurrentLesson(homeLesson);
    setupLesson(homeLesson);
  };

  const handleNextLesson = () => {
    if (activeTab === 'practice') {
      handleSelectPractice(practiceCategory, practiceSubOption);
      return;
    }

    // In Lessons mode: advance to the next level in progression!
    if (stageResult?.nextLesson) {
      setCurrentLesson(stageResult.nextLesson);
      setupLesson(stageResult.nextLesson);
    } else if (hasNextLesson) {
      const next = allLessons[currentLessonIndex + 1];
      setCurrentLesson(next);
      setupLesson(next);
    }
  };

  // Custom text handler
  const handleSaveCustomLesson = (lesson: Lesson) => {
    const updated = saveCustomLesson(lesson);
    setAllLessons([...BUILT_IN_LESSONS, ...updated]);
    setCurrentLesson(lesson);
    setupLesson(lesson);
    setPracticeCategory('custom');
  };

  const handleDeleteCustom = (id: string) => {
    const updated = deleteCustomLesson(id);
    setAllLessons([...BUILT_IN_LESSONS, ...updated]);
    if (currentLesson.id === id) {
      setCurrentLesson(BUILT_IN_LESSONS[0]);
      setupLesson(BUILT_IN_LESSONS[0]);
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const targetChar = characters[currentIndex]?.char || ' ';

  const getThemeClass = () => {
    switch (settings.theme) {
      case 'light-clean':
        return 'bg-slate-50 text-slate-900 scheme-light';
      case 'cyberpunk':
        return 'bg-[#090514] text-pink-100 scheme-dark';
      case 'terminal':
        return 'bg-black text-emerald-400 scheme-dark font-mono';
      case 'sepia':
        return 'bg-[#2b241e] text-[#f4ecd8] scheme-dark';
      case 'slate-dark':
      default:
        return 'bg-slate-950 text-slate-100 scheme-dark';
    }
  };

  return (
    <div
      data-theme={settings.theme}
      className={`min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-200 ${getThemeClass()}`}
    >
      {/* Minimal Top Navbar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-3 py-2.5 mb-2">
        {/* Brand / Logo (Press to return to homepage) */}
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2.5 cursor-pointer group text-left transition-all active:scale-95"
          title="Return to Homepage"
        >
          <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/25 transition-all">
            CS
          </span>
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            CStypology
          </h1>
        </button>

        {/* Minimal Navigation: Practice vs Lessons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('practice');
              handleSelectPractice('words', 25);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lessons');
              setShowLessons(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-cyan-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Lessons</span>
          </button>
        </div>

        {/* Minimal Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Google Sign in / Cloud Profile Button */}
          {user ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors cursor-pointer text-xs"
              title="View All-Time Milestones & WPM History"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover border border-cyan-400"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px]">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <span className="font-semibold text-xs truncate max-w-[80px] sm:max-w-[100px]">
                {user.displayName?.split(' ')[0] || 'Profile'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
              title="Milestones & WPM History"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Milestones</span>
            </button>
          )}

          {/* Theme switcher */}
          <button
            onClick={() => {
              const nextTheme = settings.theme === 'light-clean' ? 'slate-dark' : 'light-clean';
              updateSettings({ theme: nextTheme });
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Toggle Light / Dark mode"
          >
            {settings.theme === 'light-clean' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* The Single Unified Settings Gear */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Practice Container */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center gap-3 sm:gap-4">
        {/* Practice Options Bar (when in Practice tab) */}
        {activeTab === 'practice' && (
          <PracticeBar
            currentCategory={practiceCategory}
            subOption={practiceSubOption}
            onSelectPractice={handleSelectPractice}
            onOpenCustom={() => setShowCustomModal(true)}
          />
        )}

        {/* Real-time Stats & Controls Bar with Milestone PB */}
        <StatsBar
          stats={currentStats}
          isPaused={isPaused}
          isStarted={isStarted}
          settings={settings}
          lessonTitle={currentLesson.title}
          isPracticeMode={activeTab === 'practice'}
          bestWpm={milestones.bestWpm}
          onRestart={() => setupLesson(currentLesson, targetSeconds)}
          onTogglePause={handleTogglePause}
          onToggleSound={() => {
            const next = !settings.soundEnabled;
            updateSettings({ soundEnabled: next });
            soundEngine.setSoundEnabled(next);
          }}
          onToggleKeyboard={() => {
            updateSettings({ showKeyboard: !settings.showKeyboard });
          }}
          onOpenLessons={() => setShowLessons(true)}
          onOpenPractice={() => setActiveTab('practice')}
        />

        {/* Typing Stage with Animated Caret & Atomic Word-Wrapping */}
        <TypingArea
          characters={characters}
          currentIndex={currentIndex}
          caretStyle={settings.caretStyle}
          smoothCaret={settings.smoothCaret}
          fontSize={settings.fontSize}
          isPaused={isPaused}
          isCompleted={isCompleted}
          onKeyPress={handleCharacterInput}
          onBackspace={handleBackspace}
          onResume={() => handleTogglePause()}
        />

        {/* Visual Hands & Virtual Keyboard */}
        {settings.showKeyboard && (
          <div className="w-full transition-all duration-200">
            <VirtualKeyboard
              targetKey={targetChar}
              activeKey={activeKey}
              showFingerGuide={settings.showHandsGuide}
            />
          </div>
        )}
      </main>

      {/* Footer Info & Creator Attribution */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-3 border-t border-slate-800/60 text-xs text-slate-400">
        {/* Creator Attribution (Bottom Left Corner Only) */}
        <div className="flex items-center gap-2.5 order-2 sm:order-1 w-full sm:w-auto justify-start">
          <span className="text-[11px] text-slate-500 font-medium">Created by</span>
          <a
            href="https://github.com/nhfardin-codes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700/80 transition-colors shadow-xs"
            title="GitHub: nhfardin-codes"
          >
            <Github className="w-3.5 h-3.5 text-slate-300" />
            <span>nhfardin-codes</span>
          </a>
          <a
            href="https://instagram.com/thefardinhasan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-pink-500/20 text-pink-400 hover:text-pink-300 text-xs font-mono border border-slate-700/80 hover:border-pink-500/40 transition-colors shadow-xs"
            title="Instagram: @thefardinhasan"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span>@thefardinhasan</span>
          </a>
        </div>

        {/* Shortcuts (Bottom Right Side) */}
        <div className="flex flex-wrap items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-start sm:justify-end">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Esc
            </kbd>
            <span>Pause Time & WPM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Backspace
            </kbd>
            <span>Char</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Ctrl+Bksp
            </kbd>
            <span>Word</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Tab+Enter
            </kbd>
            <span>Restart</span>
          </span>
        </div>
      </footer>

      {/* Modals */}
      {isCompleted && (
        <ResultsModal
          stats={currentStats}
          currentLesson={currentLesson}
          user={user}
          isSavedToCloud={isSavedToCloud}
          isLessonMode={activeTab === 'lessons'}
          starsEarned={stageResult?.stars || 3}
          nextLessonTitle={stageResult?.nextLesson?.title}
          isNewlyUnlocked={stageResult?.isNewlyUnlocked}
          onRestart={() => setupLesson(currentLesson, targetSeconds)}
          onNextLesson={handleNextLesson}
          hasNextLesson={Boolean(stageResult?.nextLesson || hasNextLesson || activeTab === 'practice')}
          onOpenAuth={() => setShowProfileModal(true)}
          onClose={() => setIsCompleted(false)}
        />
      )}

      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUserChange={(u) => setUser(u)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showLessons && (
        <LessonSelector
          lessons={allLessons}
          currentLessonId={currentLesson.id}
          progression={progression}
          onSelectLesson={(lesson) => {
            setActiveTab('lessons');
            setCurrentLesson(lesson);
            setupLesson(lesson);
          }}
          onDeleteCustomLesson={handleDeleteCustom}
          onClose={() => setShowLessons(false)}
        />
      )}

      {showCustomModal && (
        <CustomTextModal
          onSaveAndStart={handleSaveCustomLesson}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
}
