'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Level, GameWord, GameScore, GameSession } from '@/types/game';
import LetterGlitch, { LetterGlitchHandle } from './LetterGlitch';
import GameHUD from './GameHUD';
import WordList from './WordList';
import GameOverModal from './GameOverModal';
import { initializeLevel, generateWords, calculateFinalScore } from '@/lib/game/gameEngine';
import { calculateComboMultiplier } from '@/lib/game/scoring';
import { getDifficultyMultiplier } from '@/lib/colorPalettes';
import { WordManager } from '@/lib/game/wordManager';
import { updateStats, saveScore, loadProfile } from '@/lib/storage/gameStorage';
import { syncCurrencyWithTotalScore } from '@/lib/antFarm/currency';
import { unlockLevel } from '@/lib/game/levelSystem';
import { ACHIEVEMENTS } from '@/lib/constants';
import { saveAchievement, hasAchievement, loadSettings, saveSettings } from '@/lib/storage/gameStorage';
import { getPalette, DEFAULT_PALETTE_ID, ColorPalette, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
import { getTextSizingForDifficulty } from '@/lib/game/difficulty';
import { getMandatoryPaletteDifficulty, hasMandatoryPalette } from '@/lib/constants';
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
  
  // Initialize refs to match initial state
  const attemptsRef = useRef<number>(0);
  const correctFindsRef = useRef<number>(0);
  // Check if this level requires a mandatory palette
  const mandatoryDifficulty = getMandatoryPaletteDifficulty(level);
  const [isMandatoryLevel, setIsMandatoryLevel] = useState(hasMandatoryPalette(level));
  const [mandatoryPaletteDifficulty, setMandatoryPaletteDifficulty] = useState<PaletteDifficulty | null>(mandatoryDifficulty);
  
  // Get initial palette - if mandatory, use first palette of required difficulty
  const getInitialPalette = (): ColorPalette => {
    if (mandatoryDifficulty) {
      // Find first palette with required difficulty
      const requiredPalette = COLOR_PALETTES.find(p => p.difficulty === mandatoryDifficulty);
      if (requiredPalette) {
        return requiredPalette;
      }
    }
    // Otherwise use saved preference
    const settings = loadSettings();
    return getPalette(settings.colorPalette || DEFAULT_PALETTE_ID);
  };

  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(getInitialPalette);
  const [paletteLocked, setPaletteLocked] = useState(isMandatoryLevel);

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
    let topExclusion = 120; // Default desktop
    let bottomExclusion = 200; // Default desktop
    
    if (width <= 360) {
      // Small mobile devices
      topExclusion = 80;
      bottomExclusion = 120;
    } else if (width <= 480) {
      // Mobile devices
      topExclusion = 90;
      bottomExclusion = 140;
    } else if (width <= 768) {
      // Tablet devices
      topExclusion = 100;
      bottomExclusion = 180;
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
  }, []);

  // Initialize game
  useEffect(() => {
    // Check mandatory palette requirement for this level
    const mandatory = getMandatoryPaletteDifficulty(level);
    setIsMandatoryLevel(mandatory !== null);
    setMandatoryPaletteDifficulty(mandatory);
    setPaletteLocked(mandatory !== null);
    
    // Determine the palette to use for this level
    let paletteToUse = currentPalette;
    
    // If mandatory, ensure palette matches requirement
    if (mandatory) {
      const requiredPalette = COLOR_PALETTES.find(p => p.difficulty === mandatory);
      if (requiredPalette) {
        paletteToUse = requiredPalette;
        // Update state if different
        if (currentPalette.difficulty !== mandatory) {
          setCurrentPalette(requiredPalette);
          // Save the required palette to settings for consistency
          const settings = loadSettings();
          saveSettings({ ...settings, colorPalette: requiredPalette.id });
        }
      }
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
    
    // Get dynamic text sizing based on palette difficulty and level (auto-reduces after level 14)
    const textSizing = getTextSizingForDifficulty(paletteToUse.difficulty, level);
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
          const textSizing = getTextSizingForDifficulty(currentPalette.difficulty, level);
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
          const textSizing = getTextSizingForDifficulty(currentPalette.difficulty, level);
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
          // Use the forceWordAppearance method
          if (wordManagerRef.current.forceWordAppearance()) {
            const forced = wordManagerRef.current.updateWords();
            setWords(forced);
            return;
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
          for (let i = 0; i < 5; i++) {
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
        setWords(updatedWords);
        
        // If no words visible, immediately try to force one
        if (visibleCount === 0 && updatedWords.length > 0) {
          // Try to force appearance immediately
          if (wordManagerRef.current.forceWordAppearance()) {
            const forced = wordManagerRef.current.updateWords();
            setWords(forced);
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
  }, [isPaused, gameOver]);

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

  // Check for victory
  useEffect(() => {
    if (words.length > 0 && words.every(w => w.found) && !gameOver) {
      handleGameOver(true);
    }
  }, [words, gameOver]);

  const handleWordFound = useCallback((word: string, isCorrectClick: boolean) => {
    if (!wordManagerRef.current) return;
    
    // Always increment attempts exactly once for every click
    const newAttempts = attemptsRef.current + 1;
    attemptsRef.current = newAttempts;
    setAttempts(newAttempts);
    
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
      
      // Update combo state
      setCombo(newCombo);
      setMaxCombo(prevMax => Math.max(prevMax, newCombo));

      // Calculate score (accuracy is not used here, only calculated at game end)
      const basePoints = currentWord.points;
      const timeBonus = timeRemaining ? Math.floor(timeRemaining * 3) : 0; // Enhanced: 3 points per second
      const comboMultiplier = calculateComboMultiplier(newCombo); // Use new combo value
      const difficultyMultiplier = getDifficultyMultiplier(currentPalette.difficulty);
      const wordScore = Math.floor(
        ((basePoints + timeBonus) * comboMultiplier) * difficultyMultiplier
      );

      // Update score
      setScore(prev => prev + wordScore);

      // Trigger glitch effect
      glitchRef.current?.triggerIntenseGlitch(undefined, 200);

      // Return updated words array immediately
      return prevWords.map(w => 
        w.word === word && !w.found
          ? { ...w, found: true, foundAt: Date.now(), isVisible: false }
          : w
      );
    });
  }, [timeRemaining, currentPalette.difficulty]);

  const handleGameOver = (victory: boolean) => {
    // Check if this is a mandatory level and palette matches requirement
    if (victory && mandatoryPaletteDifficulty && currentPalette.difficulty !== mandatoryPaletteDifficulty) {
      // Don't allow victory if wrong palette on mandatory level
      alert(`This level requires a ${mandatoryPaletteDifficulty} difficulty palette. Please select the correct palette to proceed.`);
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
      // Double-check palette requirement before allowing progression
      if (mandatoryPaletteDifficulty && currentPalette.difficulty !== mandatoryPaletteDifficulty) {
        alert(`This level requires a ${mandatoryPaletteDifficulty} difficulty palette. Please select the correct palette to proceed.`);
        return;
      }
      
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
    // Prevent palette change on mandatory levels
    if (paletteLocked && mandatoryPaletteDifficulty) {
      const newPalette = getPalette(paletteId);
      // Only allow change if new palette matches required difficulty
      if (newPalette.difficulty !== mandatoryPaletteDifficulty) {
        alert(`This level requires a ${mandatoryPaletteDifficulty} difficulty palette. You cannot change to a different difficulty.`);
        return;
      }
    }
    
    const newPalette = getPalette(paletteId);
    setCurrentPalette(newPalette);
    const settings = loadSettings();
    saveSettings({ ...settings, colorPalette: paletteId });
  };

  const foundWords = words.filter(w => w.found).length;

  return (
    <div className={styles.gameScreen}>
      <LetterGlitch
        ref={glitchRef}
        level={currentLevel}
        words={words}
        onWordFound={handleWordFound}
        isPaused={isPaused}
        timeRemaining={timeRemaining}
        palette={currentPalette}
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
      />
      {isMandatoryLevel && mandatoryPaletteDifficulty && (
        <div className={styles.mandatoryPaletteNotice}>
          <div className={styles.mandatoryNoticeContent}>
            <LockIcon size={20} className={styles.mandatoryIcon} />
            <span className={styles.mandatoryText}>
              Boss Level: Requires <strong>{mandatoryPaletteDifficulty}</strong> difficulty palette
            </span>
          </div>
        </div>
      )}
      <WordList words={words} palette={currentPalette} isPaused={isPaused} />
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

