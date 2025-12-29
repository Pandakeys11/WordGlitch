'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ColorPalette } from '@/lib/colorPalettes';
import { generateHintsForWords, getProgressiveHint, getLetterFrequencyHint, WordHint } from '@/lib/game/hangmanHints';
import styles from './HangmanHints.module.css';

interface HangmanHintsProps {
  words: string[];
  guessedLetters: Set<string>;
  wrongGuesses: number;
  maxWrongGuesses: number;
  palette: ColorPalette;
  gameWon: boolean;
  gameLost: boolean;
}

export default function HangmanHints({
  words,
  guessedLetters,
  wrongGuesses,
  maxWrongGuesses,
  palette,
  gameWon,
  gameLost,
}: HangmanHintsProps) {
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showLetterHint, setShowLetterHint] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Stable reference for words array (stringify for comparison)
  const wordsKey = useMemo(() => words.sort().join('|'), [words]);
  const wordsRef = useRef<string[]>(words);
  
  // Update words ref only when words actually change
  useEffect(() => {
    wordsRef.current = words;
  }, [wordsKey]);

  // Generate hints for all words - only when words change
  const wordHints = useMemo(() => {
    return generateHintsForWords(wordsRef.current);
  }, [wordsKey]);

  // Convert Set to sorted array for stable memoization
  const guessedLettersArray = useMemo(() => {
    return Array.from(guessedLetters).sort().join('');
  }, [guessedLetters]);

  // Create stable Set reference
  const guessedLettersRef = useRef<Set<string>>(guessedLetters);
  useEffect(() => {
    guessedLettersRef.current = guessedLetters;
  }, [guessedLettersArray]);

  // Get letter frequency hint - memoized with stable dependencies
  const letterHints = useMemo(() => {
    return getLetterFrequencyHint(wordsRef.current, guessedLettersRef.current);
  }, [wordsKey, guessedLettersArray]);

  // Cycle through word hints - slower, smoother transitions
  useEffect(() => {
    if (gameWon || gameLost || wordHints.length <= 1) {
      setIsTransitioning(false);
      return;
    }
    
    // Start transition
    setIsTransitioning(true);
    
    const transitionTimeout = setTimeout(() => {
      setActiveHintIndex(prev => (prev + 1) % wordHints.length);
      setIsTransitioning(false);
    }, 300); // Fade out duration

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveHintIndex(prev => (prev + 1) % wordHints.length);
        setIsTransitioning(false);
      }, 300);
    }, 7000); // 7 seconds between hint changes

    return () => {
      clearInterval(interval);
      clearTimeout(transitionTimeout);
    };
  }, [wordHints.length, gameWon, gameLost]);

  // Show letter hint after 2 wrong guesses - only once
  useEffect(() => {
    if (wrongGuesses >= 2 && !showLetterHint) {
      setShowLetterHint(true);
    }
  }, [wrongGuesses, showLetterHint]);

  // Memoize current hint to prevent recalculation
  const currentHint = useMemo(() => {
    return wordHints[activeHintIndex] || null;
  }, [wordHints, activeHintIndex]);

  // Memoize progressive hint
  const progressiveHint = useMemo(() => {
    if (!currentHint) return '';
    return getProgressiveHint(currentHint, wrongGuesses, maxWrongGuesses);
  }, [currentHint, wrongGuesses, maxWrongGuesses]);

  // Memoize difficulty color function
  const getDifficultyColor = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
    }
  }, []);

  // Memoize style object to prevent re-renders (MUST be before any early returns)
  const containerStyle = useMemo(() => ({
    borderColor: `${palette.uiColors.accent}40`,
    '--accent-color': palette.uiColors.accent,
  } as React.CSSProperties), [palette.uiColors.accent]);

  // Memoize progress bar style (MUST be before any early returns)
  const progressBarStyle = useMemo(() => {
    const progressPercent = ((maxWrongGuesses - wrongGuesses) / maxWrongGuesses) * 100;
    const backgroundColor = wrongGuesses <= 2 ? '#4caf50' : wrongGuesses <= 4 ? '#ff9800' : '#f44336';
    return {
      width: `${progressPercent}%`,
      backgroundColor,
    };
  }, [wrongGuesses, maxWrongGuesses]);

  // Win state style
  const winContainerStyle = useMemo(() => ({
    borderColor: palette.uiColors.accent,
  } as React.CSSProperties), [palette.uiColors.accent]);

  // Now safe to do early returns after all hooks
  if (gameWon) {
    return (
      <div className={styles.hintsContainer} style={winContainerStyle}>
        <div className={styles.winState}>
          <span className={styles.winIcon}>🎉</span>
          <span className={styles.winText}>All words revealed!</span>
        </div>
      </div>
    );
  }

  if (gameLost) {
    return (
      <div className={styles.hintsContainer} style={{ borderColor: '#f44336' }}>
        <div className={styles.loseState}>
          <span className={styles.loseIcon}>💀</span>
          <span className={styles.loseText}>Better luck next time!</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.hintsContainer}
      style={containerStyle}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerIcon}>💡</span>
        <span className={styles.headerText}>HINTS</span>
        {wordHints.length > 1 && (
          <span className={styles.hintCounter}>
            {activeHintIndex + 1}/{wordHints.length}
          </span>
        )}
      </div>

      {/* Category Hint */}
      {currentHint && (
        <div className={`${styles.categoryHint} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.categoryRow}>
            <span className={styles.categoryIcon}>{currentHint.categoryIcon}</span>
            <span className={styles.categoryName}>{currentHint.category.toUpperCase()}</span>
            <span 
              className={styles.difficultyBadge}
              style={{ backgroundColor: getDifficultyColor(currentHint.difficulty) }}
            >
              {currentHint.difficulty.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Progressive Hint */}
      <div className={styles.progressiveHint}>
        <span className={`${styles.hintText} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
          {progressiveHint}
        </span>
      </div>

      {/* Visual Hints */}
      {currentHint?.visualHint && (
        <div className={`${styles.visualHint} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
          <span className={styles.visualText}>{currentHint.visualHint}</span>
        </div>
      )}

      {/* Letter Suggestion (appears after 2 wrong guesses) */}
      {showLetterHint && letterHints.length > 0 && (
        <div className={styles.letterHint}>
          <span className={styles.letterHintLabel}>🎯 Try:</span>
          <div className={styles.suggestedLetters}>
            {letterHints.map(({ letter, frequency }) => (
              <span 
                key={letter}
                className={styles.suggestedLetter}
                style={{ 
                  backgroundColor: `${palette.uiColors.accent}30`,
                  borderColor: palette.uiColors.accent,
                }}
                title={`Appears ${frequency} time(s)`}
              >
                {letter}
                <span className={styles.letterFreq}>×{frequency}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className={styles.progressIndicator}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={progressBarStyle}
          />
        </div>
        <span className={styles.livesText}>
          {maxWrongGuesses - wrongGuesses} lives left
        </span>
      </div>
    </div>
  );
}

