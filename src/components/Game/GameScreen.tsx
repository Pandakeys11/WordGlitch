'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Level, GameWord, GameScore, GameSession } from '@/types/game';
import LetterGlitch, { LetterGlitchHandle } from './LetterGlitch';
import GameHUD from './GameHUD';
import WordList from './WordList';
import HangmanMiniGame from './HangmanMiniGame';
import GameOverModal from './GameOverModal';
import { initializeLevel, generateWords, calculateFinalScore } from '@/lib/game/gameEngine';
import { calculateComboMultiplier, calculateScore } from '@/lib/game/scoring';
import { getDifficultyMultiplier } from '@/lib/colorPalettes';
import {
  getComboMessage,
  shouldResetCombo,
  type ComboState
} from '@/lib/game/comboSystem';
import {
  createComboNotification,
  createStreakNotification,
  createBonusNotification,
  type AchievementNotification
} from '@/lib/game/achievementNotifications';
import { checkChallengeCompletion } from '@/lib/game/dailyChallenges';
import NotificationToast from './NotificationToast';
import { WordManager } from '@/lib/game/wordManager';
import { updateStats, saveScore, loadProfile } from '@/lib/storage/gameStorage';
import { syncCurrencyWithTotalScore } from '@/lib/currency';
import { unlockLevel } from '@/lib/game/levelSystem';
import { ACHIEVEMENTS } from '@/lib/constants';
import { saveAchievement, hasAchievement, loadSettings, saveSettings } from '@/lib/storage/gameStorage';
import { getPalette, DEFAULT_PALETTE_ID, ColorPalette, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
import { getTextSizingForDifficulty } from '@/lib/game/difficulty';
import { getMandatoryPaletteDifficulty, hasMandatoryPalette } from '@/lib/constants';
import { getPaletteForLevel } from '@/lib/game/levelProgression';
import { LockIcon } from '@/components/UI/GameIcons';
import styles from './GameScreen.module.css';

interface GameScreenProps {
  level: number;
  onMenu: () => void;
  onLevelComplete: (newLevel: number) => void;
}

export default function GameScreen({ level, onMenu, onLevelComplete }: GameScreenProps) {
  const [currentLevel, setCurrentLevel] = useState<Level>(initializeLevel(level));
  const [words, setWords] = useState<GameWord[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [comboState, setComboState] = useState<ComboState>({
    currentCombo: 0,
    maxCombo: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastWordFoundTime: 0,
    comboMultiplier: 1.0,
    streakBonus: 0,
  });
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState<GameScore | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctFinds, setCorrectFinds] = useState(0);
  const [cumulativeTotalTime, setCumulativeTotalTime] = useState<number>(0);
  const [cumulativeTotalScore, setCumulativeTotalScore] = useState<number>(0);
  const [showHangman, setShowHangman] = useState<boolean>(false);
  const [hangmanCompleted, setHangmanCompleted] = useState<boolean>(false);
  const [hangmanRevealedWords, setHangmanRevealedWords] = useState<string[]>([]);
  const [hangmanWords, setHangmanWords] = useState<GameWord[]>([]); // Store exact words used in Hangman

  // Initialize refs to match initial state
  const attemptsRef = useRef<number>(0);
  const correctFindsRef = useRef<number>(0);
  const hangmanCompletedRef = useRef<boolean>(false);
  const hangmanWordsRef = useRef<GameWord[]>([]);


  // Get initial palette based on level progression
  const getInitialPalette = (): ColorPalette => {
    // Use the level progression system to determine the palette
    return getPaletteForLevel(level);
  };

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(getInitialPalette);
  const [paletteLocked, setPaletteLocked] = useState(true); // Always locked now - determined by level

  const glitchRef = useRef<LetterGlitchHandle>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordManagerRef = useRef<WordManager | null>(null);
  const wordUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  // Helper function to calculate responsive exclusion zones
  const getExclusionZones = useCallback(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    let topExclusion = 120; // Default desktop (for GameHUD)
    let bottomExclusion = 200; // Default desktop (for WordList)

    // Increase bottom exclusion when hangman is active (it takes more space)
    const hangmanActive = showHangman && !hangmanCompleted;
    if (hangmanActive) {
      bottomExclusion = 280; // More space for hangman + word list
    }

    if (width <= 360) {
      // Small mobile devices
      topExclusion = 80;
      bottomExclusion = hangmanActive ? 200 : 120;
    } else if (width <= 480) {
      // Mobile devices
      topExclusion = 90;
      bottomExclusion = hangmanActive ? 240 : 140;
    } else if (width <= 768) {
      // Tablet devices
      topExclusion = 100;
      bottomExclusion = hangmanActive ? 260 : 180;
    }

    // Add safe area insets
    const safeAreaTop = typeof window !== 'undefined'
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0', 10) || 0
      : 0;
    const safeAreaBottom = typeof window !== 'undefined'
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0', 10) || 0
      : 0;

    return {
      top: topExclusion + safeAreaTop,
      bottom: bottomExclusion + safeAreaBottom,
    };
  }, [showHangman, hangmanCompleted]);

  // Check if hangman mini-game should be shown (every 10 levels: 10, 20, 30, 40, 50, 60, etc.)
  const shouldShowHangman = React.useMemo(() => {
    // Show hangman only on levels that are multiples of 10 (10, 20, 30, 40, 50, 60, etc.)
    return level >= 10 && level % 10 === 0;
  }, [level]);

  // Initialize game
  useEffect(() => {
    // Check if hangman should be shown
    const showHangmanGame = shouldShowHangman;
    setShowHangman(showHangmanGame);
    setHangmanCompleted(false);
    setHangmanRevealedWords([]);
    setHangmanWords([]); // Reset hangman words on level init


    // Determine the palette to use for this level using level progression
    const paletteToUse = getPaletteForLevel(level);

    // Update palette if it changed
    if (currentPalette.id !== paletteToUse.id) {
      setCurrentPalette(paletteToUse);
      // Save the palette to settings for consistency
      const settings = loadSettings();
      saveSettings({ ...settings, colorPalette: paletteToUse.id });
    }


    // Reset all game state when level changes
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAttempts(0);
    setCorrectFinds(0);
    attemptsRef.current = 0;
    correctFindsRef.current = 0;
    setGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setFinalScore(null);
    setCumulativeTotalTime(0); // Will be calculated when level completes
    setCumulativeTotalScore(0); // Will be calculated when level completes

    const levelConfig = initializeLevel(level);
    setCurrentLevel(levelConfig);

    // Get dynamic text sizing based on palette difficulty and level (updates every 10 levels on boss levels)
    const textSizing = getTextSizingForDifficulty(
      paletteToUse.difficulty,
      level,
      paletteToUse.textSizeMultiplier
    );
    const charWidth = textSizing.charWidth;
    const charHeight = textSizing.charHeight;

    // Get canvas dimensions (approximate) - use window size or defaults
    const cols = Math.floor((window.innerWidth || 800) / charWidth);
    const rows = Math.floor((window.innerHeight || 600) / charHeight);

    // Calculate responsive UI exclusion zones using helper function
    const exclusionZones = getExclusionZones();
    const topExclusionRows = Math.ceil(exclusionZones.top / charHeight);
    const bottomExclusionRows = Math.ceil(exclusionZones.bottom / charHeight);

    const generatedWords = generateWords(
      levelConfig,
      cols * charWidth,
      rows * charHeight,
      topExclusionRows,
      bottomExclusionRows,
      charWidth,
      charHeight,
      paletteToUse.difficulty
    );

    // Initialize word manager with level and dynamic sizing
    wordManagerRef.current = new WordManager(
      generatedWords,
      cols * charWidth,
      rows * charHeight,
      topExclusionRows,
      bottomExclusionRows,
      level,
      paletteToUse.difficulty,
      charWidth,
      charHeight
    );

    setWords(generatedWords);

    // Set timer if level has time limit
    if (levelConfig.timeLimit) {
      setTimeRemaining(levelConfig.timeLimit);
    } else {
      setTimeRemaining(undefined);
    }

    // Initialize session
    sessionRef.current = {
      level,
      startTime: Date.now(),
      words: generatedWords,
      score: {
        wordsFound: 0,
        totalPoints: 0,
        timeBonus: 0,
        comboMultiplier: 1,
        accuracy: 100,
        finalScore: 0,
      },
      combo: 0,
      maxCombo: 0,
      attempts: 0,
      correctFinds: 0,
    };

    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = null;
    setElapsedTime(0);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wordUpdateRef.current) {
        clearInterval(wordUpdateRef.current);
      }
    };
  }, [level, getExclusionZones]);

  // Sync WordManager dimensions with actual canvas dimensions
  useEffect(() => {
    if (!wordManagerRef.current || !glitchRef.current) return;

    const syncDimensions = () => {
      const dimensions = glitchRef.current?.getCanvasDimensions();
      if (!dimensions || !wordManagerRef.current) return;

      // Calculate responsive UI exclusion zones
      const exclusionZones = getExclusionZones();
      // Get dynamic text sizing based on current palette difficulty and level
      const textSizing = getTextSizingForDifficulty(
        currentPalette.difficulty,
        level,
        currentPalette.textSizeMultiplier
      );
      const charHeight = textSizing.charHeight;
      const topExclusionRows = Math.ceil(exclusionZones.top / charHeight);
      const bottomExclusionRows = Math.ceil(exclusionZones.bottom / charHeight);

      // Update WordManager with actual canvas dimensions
      wordManagerRef.current.updateDimensions(
        dimensions.width,
        dimensions.height,
        topExclusionRows,
        bottomExclusionRows
      );
    };

    // Sync immediately and on resize
    syncDimensions();
    const resizeHandler = () => syncDimensions();
    window.addEventListener('resize', resizeHandler);
    const syncInterval = setInterval(syncDimensions, 500); // Sync every 500ms as backup

    return () => {
      window.removeEventListener('resize', resizeHandler);
      clearInterval(syncInterval);
    };
  }, [level]);

  // Word scramble effect for levels 15+ (random rare scrambles)
  useEffect(() => {
    if (isPaused || gameOver || level < 15) return;

    // Random scramble effect - rare but impactful
    // Trigger randomly with 3% chance every 3 seconds
    const scrambleInterval = setInterval(() => {
      if (isPaused || gameOver) return;

      // 3% chance to trigger scramble
      if (Math.random() < 0.03) {
        glitchRef.current?.triggerWordScramble(500); // 500ms scramble duration
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(scrambleInterval);
  }, [level, isPaused, gameOver]);

  // Word visibility update loop
  useEffect(() => {
    if (isPaused || gameOver || !wordManagerRef.current) return;

    // Force first word to appear immediately for better UX
    const forceFirstWord = () => {
      if (wordManagerRef.current) {
        // Sync dimensions first
        const dimensions = glitchRef.current?.getCanvasDimensions();
        if (dimensions && wordManagerRef.current) {
          const exclusionZones = (() => {
            const width = window.innerWidth || 800;
            let topExclusion = 120;
            let bottomExclusion = 200;
            if (width <= 360) {
              topExclusion = 80;
              bottomExclusion = 120;
            } else if (width <= 480) {
              topExclusion = 90;
              bottomExclusion = 140;
            } else if (width <= 768) {
              topExclusion = 100;
              bottomExclusion = 180;
            }
            return { top: topExclusion, bottom: bottomExclusion };
          })();
          // Get dynamic text sizing based on current palette difficulty and level
          const textSizing = getTextSizingForDifficulty(
            currentPalette.difficulty,
            level,
            currentPalette.textSizeMultiplier
          );
          const charHeight = textSizing.charHeight;
          const topExclusionRows = Math.ceil(exclusionZones.top / charHeight);
          const bottomExclusionRows = Math.ceil(exclusionZones.bottom / charHeight);
          wordManagerRef.current.updateDimensions(
            dimensions.width,
            dimensions.height,
            topExclusionRows,
            bottomExclusionRows
          );
        }

        // Try to force at least one word to appear
        const updatedWords = wordManagerRef.current.updateWords();
        const visibleCount = updatedWords.filter(w => w.isVisible && !w.found).length;

        // If no words visible after update, force one to appear
        if (visibleCount === 0 && updatedWords.length > 0) {
          // Use the forceWordAppearance method - try many times
          for (let i = 0; i < 30; i++) {
            if (wordManagerRef.current.forceWordAppearance()) {
              const forced = wordManagerRef.current.updateWords();
              setWords(forced);
              return;
            }
          }
        }
        setWords(updatedWords);
      }
    };

    // First word appears very quickly (200ms)
    const initialTimeout = setTimeout(() => {
      forceFirstWord();
    }, 200);

    // Also try again after 500ms if first attempt failed
    const secondTimeout = setTimeout(() => {
      if (wordManagerRef.current) {
        const currentWords = wordManagerRef.current.updateWords();
        const visibleCount = currentWords.filter(w => w.isVisible && !w.found).length;
        if (visibleCount === 0 && currentWords.length > 0) {
          // Force appearance with multiple attempts
          for (let i = 0; i < 20; i++) {
            if (wordManagerRef.current.forceWordAppearance()) {
              const forced = wordManagerRef.current.updateWords();
              setWords(forced);
              break;
            }
          }
        }
      }
    }, 500);

    // Update every 100ms for smooth timing
    wordUpdateRef.current = setInterval(() => {
      if (wordManagerRef.current) {
        // Update combo multiplier for faster word appearances at higher combos
        wordManagerRef.current.setComboMultiplier(combo);

        const updatedWords = wordManagerRef.current.updateWords();
        const visibleCount = updatedWords.filter(w => w.isVisible && !w.found).length;

        // After hangman completes, WordManager already has only hangman words
        // So we can use updatedWords directly, but add a safety check
        const wordsToSet = updatedWords;

        setWords(wordsToSet);

        // If no words visible, immediately try to force one (more aggressively)
        if (visibleCount === 0 && wordsToSet.length > 0 && !wordsToSet.every(w => w.found)) {
          // Try to force appearance immediately - try many times
          for (let i = 0; i < 20; i++) {
            if (wordManagerRef.current.forceWordAppearance()) {
              const forced = wordManagerRef.current.updateWords();
              setWords(forced);
              break;
            }
          }
        }
      }
    }, 100);

    return () => {
      if (wordUpdateRef.current) {
        clearInterval(wordUpdateRef.current);
      }
      clearTimeout(initialTimeout);
      clearTimeout(secondTimeout);
    };
  }, [isPaused, gameOver, hangmanCompleted, combo, level, currentPalette]);

  // Restart word appearance system when hangman completes
  useEffect(() => {
    if (hangmanCompleted && wordManagerRef.current && !isPaused && !gameOver) {
      // Force word appearance immediately after hangman completes
      const triggerWordAppearance = () => {
        if (wordManagerRef.current) {
          // Sync dimensions first to ensure WordManager has valid canvas size
          const dimensions = glitchRef.current?.getCanvasDimensions();
          if (dimensions && wordManagerRef.current) {
            const exclusionZones = getExclusionZones();
            const textSizing = getTextSizingForDifficulty(
              currentPalette.difficulty,
              level,
              currentPalette.textSizeMultiplier
            );
            const charHeight = textSizing.charHeight;
            const topExclusionRows = Math.ceil(exclusionZones.top / charHeight);
            const bottomExclusionRows = Math.ceil(exclusionZones.bottom / charHeight);
            wordManagerRef.current.updateDimensions(
              dimensions.width,
              dimensions.height,
              topExclusionRows,
              bottomExclusionRows
            );
          }

          // Reset WordManager's internal state to encourage immediate word appearance
          wordManagerRef.current.onWordFound(); // Clear scheduled appearances

          // Update words first to sync state
          let updatedWords = wordManagerRef.current.updateWords();
          const visibleCount = updatedWords.filter(w => w.isVisible && !w.found).length;

          // If no words visible, force appearance aggressively
          if (visibleCount === 0 && updatedWords.length > 0 && !updatedWords.every(w => w.found)) {
            // Try to force word appearance many times
            for (let i = 0; i < 50; i++) {
              if (wordManagerRef.current.forceWordAppearance()) {
                break;
              }
            }

            // Update words again after forcing
            updatedWords = wordManagerRef.current.updateWords();
          }

          // Update words state - this will trigger LetterGlitch to update
          setWords(updatedWords);
        }
      };

      // Trigger immediately
      triggerWordAppearance();

      // Also trigger after short delays to ensure it works
      const timeout1 = setTimeout(triggerWordAppearance, 100);
      const timeout2 = setTimeout(triggerWordAppearance, 300);
      const timeout3 = setTimeout(triggerWordAppearance, 600);
      const timeout4 = setTimeout(triggerWordAppearance, 1000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
        clearTimeout(timeout4);
      };
    }
  }, [hangmanCompleted, isPaused, gameOver, level, currentPalette]);

  // Elapsed time timer (always running)
  useEffect(() => {
    if (gameOver) return;

    if (isPaused) {
      if (pauseStartRef.current === null) {
        pauseStartRef.current = Date.now();
      }
      return;
    } else {
      // Resume: add paused duration to pausedTimeRef
      if (pauseStartRef.current !== null) {
        pausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }

    const elapsedTimer = setInterval(() => {
      setElapsedTime((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
    }, 100);

    return () => {
      clearInterval(elapsedTimer);
    };
  }, [isPaused, gameOver]);

  // Timer countdown
  useEffect(() => {
    if (isPaused || gameOver || timeRemaining === undefined) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === undefined) return undefined;
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          handleGameOver(false);
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, gameOver, timeRemaining]);

  // Check for victory - only count real words (exclude fake words)
  // Store hangman words when hangman becomes active - use useMemo to get current hangman words
  const currentHangmanWords = useMemo(() => {
    if (showHangman && !hangmanCompleted) {
      return words.filter(w => !w.found && !w.isFake);
    }
    return hangmanWords; // Return stored words if hangman completed or not active
  }, [showHangman, hangmanCompleted, words, hangmanWords]);

  // Store hangman words when hangman first becomes active
  useEffect(() => {
    if (showHangman && !hangmanCompleted && hangmanWords.length === 0 && currentHangmanWords.length > 0) {
      // Capture the exact words that will be used in Hangman
      setHangmanWords(currentHangmanWords);
      hangmanWordsRef.current = currentHangmanWords;
    }
  }, [showHangman, hangmanCompleted, currentHangmanWords, hangmanWords.length]);

  // Update refs when hangman state changes
  useEffect(() => {
    hangmanCompletedRef.current = hangmanCompleted;
    hangmanWordsRef.current = hangmanWords;
  }, [hangmanCompleted, hangmanWords]);

  // Also check that hangman is completed if it's active
  // Check for level completion - all words found
  useEffect(() => {
    const realWords = words.filter(w => !w.isFake);

    // On Hangman levels (10, 20, 30, etc.), must complete Hangman first
    if (showHangman && !hangmanCompleted) {
      return; // Can't complete level until hangman challenge is done
    }

    // Check if all real words are found - level complete!
    if (realWords.length > 0 && realWords.every(w => w.found) && !gameOver) {
      handleGameOver(true);
    }
  }, [words, gameOver, showHangman, hangmanCompleted]);

  const handleWordFound = useCallback((word: string, isCorrectClick: boolean) => {
    if (!wordManagerRef.current) return;

    // Always increment attempts exactly once for every click
    const newAttempts = attemptsRef.current + 1;
    attemptsRef.current = newAttempts;
    setAttempts(newAttempts);

    // Check if this is a fake word click (marked with "FAKE:" prefix)
    if (word.startsWith('FAKE:')) {
      // Fake word clicked - this is a penalty/miss
      // Could add visual feedback here (e.g., screen shake, red flash)
      // For now, just count as an attempt (already done above)
      return;
    }

    // If it's not a correct click, it's a miss - but don't reset combo
    // Combo is based on total words found, not consecutive finds
    if (!isCorrectClick || !word) {
      return;
    }

    // For correct clicks, validate and process the word
    // Use functional update to get latest words state
    setWords(prevWords => {
      // Find the word in current state
      const currentWord = prevWords.find(w => w.word === word && !w.found);
      if (!currentWord || !wordManagerRef.current?.isWordClickable(currentWord)) {
        // Word not found or not clickable - this was a miss (attempt already counted)
        // Don't reset combo - it's based on total words found, not consecutive
        return prevWords; // Return unchanged
      }

      // Mark word as found in WordManager first (synchronous update)
      // This also triggers faster next word appearance
      const wasFound = wordManagerRef.current.markWordFound(word);
      if (!wasFound) {
        // Word couldn't be marked as found - this was a miss (attempt already counted)
        // Don't reset combo - it's based on total words found, not consecutive
        return prevWords; // Return unchanged
      }

      // Valid correct click - increment correctFinds (attempts already incremented above)
      const newCorrectFinds = correctFindsRef.current + 1;
      correctFindsRef.current = newCorrectFinds;
      setCorrectFinds(newCorrectFinds);

      // Calculate combo based on total words found (starts after 3 words)
      // Combo = wordsFound - 3 (so 0 for first 3 words, then 1, 2, 3, etc.)
      const wordsFoundAfterMarking = prevWords.filter(w => w.found).length + 1; // +1 because we're about to mark this word as found
      const newCombo = Math.max(0, wordsFoundAfterMarking - 3); // Combo starts after 3 words

      // Calculate time since last word was found (for speed bonus)
      const now = Date.now();
      const lastFoundWord = prevWords
        .filter(w => w.found && w.foundAt)
        .sort((a, b) => (b.foundAt || 0) - (a.foundAt || 0))[0];
      const timeSinceLastWord = lastFoundWord && lastFoundWord.foundAt
        ? (now - lastFoundWord.foundAt) / 1000 // Convert to seconds
        : undefined;

      // Update combo state with new system
      setComboState(prev => {
        const shouldReset = shouldResetCombo(prev.lastWordFoundTime);
        const updatedCombo = shouldReset ? 1 : prev.currentCombo + 1;

        // Check for combo milestones
        const comboMessage = getComboMessage(updatedCombo);
        if (comboMessage && (updatedCombo === 2 || updatedCombo === 3 || updatedCombo === 5 ||
          updatedCombo === 7 || updatedCombo === 10 || updatedCombo === 15 ||
          updatedCombo === 20 || updatedCombo === 25 || updatedCombo === 30)) {
          setNotifications(prev => [...prev, createComboNotification(updatedCombo)]);
        }

        return {
          currentCombo: updatedCombo,
          maxCombo: Math.max(prev.maxCombo, updatedCombo),
          currentStreak: prev.currentStreak,
          longestStreak: prev.longestStreak,
          lastWordFoundTime: now,
          comboMultiplier: calculateComboMultiplier(updatedCombo,
            attemptsRef.current > 0 ? (correctFindsRef.current / attemptsRef.current) * 100 : 100,
            timeSinceLastWord || 0
          ),
          streakBonus: prev.streakBonus,
        };
      });

      setCombo(newCombo);
      setMaxCombo(prevMax => Math.max(prevMax, newCombo));

      // Calculate score with performance-based system
      const basePoints = currentWord.points;
      const timeBonus = timeRemaining ? Math.floor(timeRemaining * 3) : 0;
      const difficultyMultiplier = getDifficultyMultiplier(currentPalette.difficulty);

      // Calculate current accuracy for performance bonuses
      const currentAccuracy = attemptsRef.current > 0
        ? (correctFindsRef.current / attemptsRef.current) * 100
        : 100;

      // Use performance-based scoring (includes accuracy and speed bonuses)
      const scoreResult = calculateScore(
        currentWord,
        timeRemaining,
        newCombo,
        attemptsRef.current,
        correctFindsRef.current,
        currentPalette.difficulty,
        timeSinceLastWord
      );

      const wordScore = scoreResult.finalScore;

      // Add bonus notifications if significant
      if (scoreResult.comboBonus && scoreResult.comboBonus > 50) {
        setNotifications(prev => [...prev, createBonusNotification('combo', scoreResult.comboBonus || 0)]);
      }

      // Update daily challenges
      const completedChallenges = checkChallengeCompletion('words', wordsFoundAfterMarking);
      completedChallenges.forEach(challenge => {
        setNotifications(prev => [...prev, {
          id: `challenge-${challenge.id}-${Date.now()}`,
          type: 'achievement',
          title: challenge.title,
          message: `Challenge complete! +${challenge.reward} currency`,
          icon: '🎯',
          color: '#ffd700',
          duration: 3000,
          priority: 4,
        }]);
      });

      // Update score
      setScore(prev => prev + wordScore);

      // Trigger glitch effect
      glitchRef.current?.triggerIntenseGlitch(undefined, 200);

      // Return updated words array immediately
      const updatedWords = prevWords.map(w =>
        w.word === word && !w.found
          ? { ...w, found: true, foundAt: Date.now(), isVisible: false }
          : w
      );

      // After hangman completes, WordManager already has only hangman words
      // So updatedWords should already be filtered, but add safety check
      // Don't filter here as it might cause issues - WordManager is the source of truth
      return updatedWords;
    });
  }, [timeRemaining, currentPalette.difficulty]);

  const handleGameOver = (victory: boolean) => {
    // Check if hangman is active and not completed - prevent level completion
    if (showHangman && !hangmanCompleted) {
      // Don't allow level completion until hangman is done
      setNotifications(prev => [...prev, {
        id: `hangman-required-${Date.now()}`,
        type: 'achievement',
        title: 'Complete Hangman First!',
        message: 'You must complete the hangman challenge to finish this level.',
        icon: '🎯',
        color: '#ffaa00',
        duration: 3000,
        priority: 4,
      }]);
      setIsVictory(false);
      setGameOver(false);
      setIsPaused(false);
      return;
    }


    setIsVictory(victory);
    setGameOver(true);
    setIsPaused(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate level time (elapsed time in seconds)
    const levelTime = (Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000;

    // Use ref values to ensure we have the most up-to-date attempts and correctFinds
    // Refs are updated synchronously before state, so they're always current
    let currentAttempts = attemptsRef.current;
    let currentCorrectFinds = correctFindsRef.current;

    // If refs are 0 but we have found words, use state values as fallback
    // This handles edge cases where refs might not be initialized yet
    if (currentAttempts === 0 && words.some(w => w.found)) {
      currentAttempts = attempts;
      currentCorrectFinds = correctFinds;
    }

    // Final safety check: ensure attempts is at least equal to found words
    // (you can't find words without attempting)
    const foundWordsCount = words.filter(w => w.found).length;
    if (currentAttempts < foundWordsCount) {
      // This shouldn't happen, but if it does, set minimum attempts
      currentAttempts = foundWordsCount;
      currentCorrectFinds = foundWordsCount;
    }

    // Calculate accuracy: correctFinds / attempts * 100
    // Ensure we have valid values for calculation
    const calculatedAccuracy = currentAttempts > 0
      ? (currentCorrectFinds / currentAttempts) * 100
      : 100;

    // Calculate final combo based on words found (starts after 3 words)
    const wordsFound = words.filter(w => w.found).length;
    const finalCombo = Math.max(0, wordsFound - 3);

    const final = calculateFinalScore(
      words,
      timeRemaining,
      finalCombo, // Pass calculated combo based on words found (0 for first 3, then 1, 2, 3, etc.)
      currentAttempts,
      currentCorrectFinds,
      levelTime,
      currentPalette.difficulty,
      level // Pass level for level-based multipliers
    );

    // Override accuracy with calculated value to ensure it's correct
    final.accuracy = calculatedAccuracy;

    setFinalScore(final);

    // Update session
    if (sessionRef.current) {
      sessionRef.current.endTime = Date.now();
      sessionRef.current.score = final;
      sessionRef.current.combo = finalCombo; // Use calculated combo based on words found
      sessionRef.current.maxCombo = finalCombo; // Max combo is the same as current combo (based on total words)
      sessionRef.current.attempts = currentAttempts;
      sessionRef.current.correctFinds = currentCorrectFinds;

      // Calculate total cumulative time and score: existing totals + current level
      // This ensures we show the correct totals even before profile is updated
      const { loadProfile } = require('@/lib/storage/gameStorage');
      const profile = loadProfile();
      const existingTotalTime = profile?.totalPlayTime || 0;
      const existingTotalScore = profile?.totalScore || 0;

      // Use consistent rounding for time (round to nearest second for accuracy)
      const roundedLevelTime = Math.round(levelTime);
      const totalTime = existingTotalTime + roundedLevelTime;
      const totalScore = existingTotalScore + final.finalScore;

      // Store cumulative totals for display in modal
      setCumulativeTotalTime(totalTime);
      setCumulativeTotalScore(totalScore);

      // Save to storage (this will update totalPlayTime for next level)
      updateStats(sessionRef.current);
      saveScore({
        id: Date.now().toString(),
        score: final.finalScore,
        level: currentLevel.level,
        wordsFound: final.wordsFound,
        timestamp: Date.now(),
        accuracy: final.accuracy,
        levelTime: final.levelTime, // Include level time for ranking
      });

      // Sync currency with updated total score (20:1 ratio)
      const updatedProfile = loadProfile();
      if (updatedProfile) {
        syncCurrencyWithTotalScore(updatedProfile.totalScore);
      }

      // Unlock next level if victory
      if (victory) {
        unlockLevel(level + 1, final.finalScore);
      }

      // Check achievements
      checkAchievements(final, victory);
    }
  };

  const checkAchievements = (score: GameScore, victory: boolean) => {
    const { loadProfile: loadProfileData } = require('@/lib/storage/gameStorage');
    const profile = loadProfileData();
    const totalWords = profile?.totalWordsFound || 0;
    const newTotal = totalWords + score.wordsFound;

    // First word
    if (!hasAchievement('first_word') && score.wordsFound > 0) {
      saveAchievement({ ...ACHIEVEMENTS.first_word, unlockedAt: Date.now() });
    }

    // Word count achievements
    if (newTotal >= 10 && !hasAchievement('ten_words')) {
      saveAchievement({ ...ACHIEVEMENTS.ten_words, unlockedAt: Date.now() });
    }
    if (newTotal >= 50 && !hasAchievement('fifty_words')) {
      saveAchievement({ ...ACHIEVEMENTS.fifty_words, unlockedAt: Date.now() });
    }
    if (newTotal >= 100 && !hasAchievement('hundred_words')) {
      saveAchievement({ ...ACHIEVEMENTS.hundred_words, unlockedAt: Date.now() });
    }

    // Perfect accuracy
    if (victory && score.accuracy >= 100 && !hasAchievement('perfect_accuracy')) {
      saveAchievement({ ...ACHIEVEMENTS.perfect_accuracy, unlockedAt: Date.now() });
    }

    // Speed demon
    if (victory && sessionRef.current) {
      const duration = (sessionRef.current.endTime! - sessionRef.current.startTime) / 1000;
      if (duration < 30 && !hasAchievement('speed_demon')) {
        saveAchievement({ ...ACHIEVEMENTS.speed_demon, unlockedAt: Date.now() });
      }
    }

    // Combo master - check if player found 13+ words (combo of 10+)
    // Combo = wordsFound - 3, so combo >= 10 means wordsFound >= 13
    const wordsFound = words.filter(w => w.found).length;
    const finalCombo = Math.max(0, wordsFound - 3);
    if (finalCombo >= 10 && !hasAchievement('combo_master')) {
      saveAchievement({ ...ACHIEVEMENTS.combo_master, unlockedAt: Date.now() });
    }

    // Level achievements
    if (level >= 10 && !hasAchievement('level_10')) {
      saveAchievement({ ...ACHIEVEMENTS.level_10, unlockedAt: Date.now() });
    }
    if (level >= 25 && !hasAchievement('level_25')) {
      saveAchievement({ ...ACHIEVEMENTS.level_25, unlockedAt: Date.now() });
    }
    if (level >= 50 && !hasAchievement('level_50')) {
      saveAchievement({ ...ACHIEVEMENTS.level_50, unlockedAt: Date.now() });
    }
    if (level >= 100 && !hasAchievement('level_100')) {
      saveAchievement({ ...ACHIEVEMENTS.level_100, unlockedAt: Date.now() });
    }
  };


  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleContinue = () => {
    if (isVictory) {
      const nextLevel = level + 1;
      // Unlock next level if not already unlocked
      unlockLevel(nextLevel, finalScore?.finalScore || 0);
      // Advance to next level
      onLevelComplete(nextLevel);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleHome = () => {
    // Pause the game if not already paused
    if (!isPaused) {
      setIsPaused(true);
    }
    // Navigate to menu
    onMenu();
  };

  const handleRestart = () => {
    // Reset to level 1
    onLevelComplete(1);
  };

  const handlePaletteChange = (paletteId: string) => {
    // Palette changes are disabled - palettes are determined by level progression
    // This function is kept for compatibility but does nothing
    return;
  };

  const foundWords = words.filter(w => w.found).length;

  // Notification queue management
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      // Sort by priority and show highest priority notification
      const sorted = [...notifications].sort((a, b) => b.priority - a.priority);
      setCurrentNotification(sorted[0]);
      setNotifications(sorted.slice(1));
    }
  }, [notifications, currentNotification]);

  const handleNotificationDismiss = useCallback(() => {
    setCurrentNotification(null);
  }, []);

  return (
    <div className={styles.gameScreen}>
      {currentNotification && (
        <NotificationToast
          notification={currentNotification}
          onDismiss={handleNotificationDismiss}
        />
      )}
      <LetterGlitch
        ref={glitchRef}
        level={currentLevel}
        words={words}
        onWordFound={handleWordFound}
        isPaused={isPaused}
        timeRemaining={timeRemaining}
        palette={currentPalette}
        isHangmanActive={showHangman && !hangmanCompleted}
        hangmanRevealedWords={hangmanRevealedWords}
      />
      <GameHUD
        score={score}
        level={currentLevel.level}
        combo={combo}
        elapsedTime={elapsedTime}
        timeRemaining={timeRemaining}
        wordsFound={foundWords}
        totalWords={words.length}
        onPause={handlePause}
        onHome={handleHome}
        onRestart={handleRestart}
        currentPaletteId={currentPalette.id}
        isPaused={isPaused}
        isGameOver={gameOver}
      />

      <div className={styles.wordListContainer}>
        <WordList
          words={
            // After hangman completes, only show the words that were in hangman
            // This ensures "Find These Words" shows the exact same words that were in Hangman
            hangmanCompleted && hangmanWords.length > 0
              ? words.filter(w => {
                // Include words that were in hangman (found or not found)
                const wasInHangman = hangmanWords.some(hw => hw.word === w.word);
                return wasInHangman;
              })
              : words
          }
          palette={currentPalette}
          isPaused={isPaused}
          showHangman={showHangman && !hangmanCompleted}
          hangmanRevealedWords={hangmanRevealedWords}
        />
        {showHangman && !hangmanCompleted && (
          <HangmanMiniGame
            words={currentHangmanWords.filter(w => !w.found)}
            palette={currentPalette}
            onComplete={(success) => {
              if (success) {
                // On win, reveal all words that were in hangman and mark hangman as complete
                // Use the stored hangman words to ensure we're revealing the correct words
                const hangmanWordStrings = hangmanWords.length > 0
                  ? hangmanWords.map(w => w.word)
                  : words.filter(w => !w.found && !w.isFake).map(w => w.word);
                setHangmanRevealedWords(hangmanWordStrings);
                setHangmanCompleted(true);

                // Filter words to only include hangman words (preserve found state)
                // Make sure we only include real words (not fake words) that were in hangman
                const hangmanWordsOnly = words.filter(w => {
                  // Only include real words (not fake)
                  if (w.isFake) return false;

                  // Check if word was in hangman
                  const wasInHangman = hangmanWords.length > 0
                    ? hangmanWords.some(hw => hw.word === w.word)
                    : hangmanWordStrings.includes(w.word);
                  return wasInHangman;
                });

                // Ensure we have words to work with
                if (hangmanWordsOnly.length === 0) {
                  console.warn('No hangman words found after filtering');
                  return;
                }

                // Update WordManager with only hangman words and restart word appearance system
                if (hangmanWordsOnly.length > 0) {
                  // Get current canvas dimensions - ensure canvas is ready
                  const dimensions = glitchRef.current?.getCanvasDimensions();

                  if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
                    const exclusionZones = getExclusionZones();

                    // Get dynamic text sizing based on current palette difficulty and level
                    const currentSizing = getTextSizingForDifficulty(
                      currentPalette.difficulty,
                      level,
                      currentPalette.textSizeMultiplier
                    );

                    // Validate dimensions before creating WordManager
                    const canvasWidth = dimensions.width;
                    const canvasHeight = dimensions.height;
                    const charWidth = currentSizing.charWidth;
                    const charHeight = currentSizing.charHeight;
                    const topExclusionRows = Math.max(0, Math.ceil(exclusionZones.top / charHeight));
                    const bottomExclusionRows = Math.max(0, Math.ceil(exclusionZones.bottom / charHeight));

                    // Create new WordManager with only hangman words
                    // This resets word visibility states, so we need to force appearance immediately
                    const newWordManager = new WordManager(
                      hangmanWordsOnly,
                      canvasWidth,
                      canvasHeight,
                      topExclusionRows,
                      bottomExclusionRows,
                      level,
                      currentPalette.difficulty,
                      charWidth,
                      charHeight
                    );

                    // Set the new WordManager
                    wordManagerRef.current = newWordManager;

                    // Reset WordManager's internal state to encourage immediate word appearance
                    newWordManager.onWordFound(); // Clear scheduled appearances

                    // Force first word to appear immediately - try many times
                    let wordAppeared = false;
                    for (let i = 0; i < 50; i++) {
                      if (newWordManager.forceWordAppearance()) {
                        wordAppeared = true;
                        break;
                      }
                    }

                    // Update words - this will include the forced word if successful
                    let updatedWords = newWordManager.updateWords();

                    // If still no word appeared, try one more aggressive attempt
                    if (!wordAppeared || updatedWords.filter(w => w.isVisible && !w.found).length === 0) {
                      // Reset and try again
                      newWordManager.onWordFound();
                      for (let i = 0; i < 100; i++) {
                        if (newWordManager.forceWordAppearance()) {
                          break;
                        }
                      }
                      updatedWords = newWordManager.updateWords();
                    }

                    // Set words state immediately - this triggers LetterGlitch to update
                    setWords([...updatedWords]); // Create new array to ensure React detects change

                    // Also set up retries to ensure words appear
                    setTimeout(() => {
                      if (wordManagerRef.current === newWordManager) {
                        let currentWords = newWordManager.updateWords();
                        const visibleCount = currentWords.filter(w => w.isVisible && !w.found).length;
                        if (visibleCount === 0 && currentWords.length > 0 && !currentWords.every(w => w.found)) {
                          newWordManager.onWordFound();
                          for (let i = 0; i < 50; i++) {
                            if (newWordManager.forceWordAppearance()) {
                              break;
                            }
                          }
                          currentWords = newWordManager.updateWords();
                          setWords([...currentWords]); // Create new array
                        }
                      }
                    }, 200);

                    // Additional retry after longer delay
                    setTimeout(() => {
                      if (wordManagerRef.current === newWordManager) {
                        let currentWords = newWordManager.updateWords();
                        const visibleCount = currentWords.filter(w => w.isVisible && !w.found).length;
                        if (visibleCount === 0 && currentWords.length > 0 && !currentWords.every(w => w.found)) {
                          newWordManager.onWordFound();
                          for (let i = 0; i < 50; i++) {
                            if (newWordManager.forceWordAppearance()) {
                              break;
                            }
                          }
                          currentWords = newWordManager.updateWords();
                          setWords([...currentWords]); // Create new array
                        }
                      }
                    }, 600);
                  } else {
                    // Canvas not ready, retry after a short delay
                    setTimeout(() => {
                      // Retry the onComplete logic
                      if (wordManagerRef.current && hangmanWordsOnly.length > 0) {
                        const retryDimensions = glitchRef.current?.getCanvasDimensions();
                        if (retryDimensions && retryDimensions.width > 0 && retryDimensions.height > 0) {
                          // Re-run the WordManager creation logic
                          // Get dynamic text sizing based on current palette difficulty and level
                          const currentSizing = getTextSizingForDifficulty(
                            currentPalette.difficulty,
                            level,
                            currentPalette.textSizeMultiplier
                          );
                          const exclusionZones = getExclusionZones();
                          const charWidth = currentSizing.charWidth;
                          const charHeight = currentSizing.charHeight;
                          const topExclusionRows = Math.max(0, Math.ceil(exclusionZones.top / charHeight));
                          const bottomExclusionRows = Math.max(0, Math.ceil(exclusionZones.bottom / charHeight));

                          const newWordManager = new WordManager(
                            hangmanWordsOnly,
                            retryDimensions.width,
                            retryDimensions.height,
                            topExclusionRows,
                            bottomExclusionRows,
                            level,
                            currentPalette.difficulty,
                            charWidth,
                            charHeight
                          );

                          wordManagerRef.current = newWordManager;
                          newWordManager.onWordFound();

                          for (let i = 0; i < 50; i++) {
                            if (newWordManager.forceWordAppearance()) {
                              break;
                            }
                          }

                          const updatedWords = newWordManager.updateWords();
                          setWords([...updatedWords]);
                        } else {
                          // Still not ready, just set words (they'll be updated when canvas is ready)
                          setWords(hangmanWordsOnly);
                        }
                      }
                    }, 300);

                    // Set words immediately anyway (they'll be updated when canvas is ready)
                    setWords(hangmanWordsOnly);
                  }
                } else {
                  // No words, just set empty array
                  setWords([]);
                }

                // Bonus points for completing hangman
                setScore(prev => prev + 500);
                setNotifications(prev => [...prev, {
                  id: `hangman-win-${Date.now()}`,
                  type: 'achievement',
                  title: 'Hangman Master!',
                  message: '+500 bonus points! Words revealed!',
                  icon: '🎯',
                  color: '#81c784',
                  duration: 3000,
                  priority: 3,
                }]);
              } else {
                // On lose, restart the level
                setNotifications(prev => [...prev, {
                  id: `hangman-lose-${Date.now()}`,
                  type: 'achievement',
                  title: 'Hangman Failed',
                  message: 'Level restarted! Try again.',
                  icon: '💀',
                  color: '#ef5350',
                  duration: 3000,
                  priority: 4,
                }]);
                // Restart level after a short delay
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              }
            }}
            onWordsRevealed={(revealedWords) => {
              // Track which words are fully revealed
              setHangmanRevealedWords(revealedWords);
            }}
          />
        )}
      </div>
      {gameOver && finalScore && (
        <GameOverModal
          score={finalScore}
          level={currentLevel.level}
          onContinue={handleContinue}
          onRetry={handleRetry}
          onMenu={onMenu}
          isVictory={isVictory}
          palette={currentPalette}
          cumulativeTotalTime={cumulativeTotalTime}
          cumulativeTotalScore={cumulativeTotalScore}
        />
      )}
      {isPaused && !gameOver && (
        <div className={styles.pauseOverlay}>
          <div
            className={styles.pauseModal}
            style={{
              borderColor: `rgba(${parseInt(currentPalette.uiColors.primary.slice(1, 3), 16)}, ${parseInt(currentPalette.uiColors.primary.slice(3, 5), 16)}, ${parseInt(currentPalette.uiColors.primary.slice(5, 7), 16)}, 0.3)`,
            }}
          >
            <h2>Paused</h2>
            <button
              className={styles.resumeButton}
              onClick={handlePause}
              style={{
                background: `linear-gradient(135deg, ${currentPalette.uiColors.primary} 0%, ${currentPalette.uiColors.secondary} 100%)`,
              }}
            >
              Resume
            </button>
            <button className={styles.menuButton} onClick={onMenu}>
              Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

