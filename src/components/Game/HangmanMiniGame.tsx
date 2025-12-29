'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameWord } from '@/types/game';
import { ColorPalette } from '@/lib/colorPalettes';
import HangmanHints from './HangmanHints';
import styles from './HangmanMiniGame.module.css';

interface HangmanMiniGameProps {
  words: GameWord[];
  palette: ColorPalette;
  onComplete: (success: boolean) => void;
  onLetterRevealed?: (word: string, letter: string) => void;
  onWordsRevealed?: (revealedWords: string[]) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_WRONG_GUESSES = 6; // Head, body, left arm, right arm, left leg, right leg

export default function HangmanMiniGame({ words, palette, onComplete, onLetterRevealed, onWordsRevealed }: HangmanMiniGameProps) {
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameLost, setGameLost] = useState<boolean>(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Get all unique letters from all words
  const allLetters = React.useMemo(() => {
    const letters = new Set<string>();
    words.forEach(word => {
      word.word.toUpperCase().split('').forEach(letter => {
        if (letter.match(/[A-Z]/)) {
          letters.add(letter);
        }
      });
    });
    return Array.from(letters);
  }, [words]);

  // Track fully revealed words
  const [previousRevealedCount, setPreviousRevealedCount] = useState(0);
  
  const fullyRevealedWords = React.useMemo(() => {
    return words.filter(word => {
      const wordLetters = word.word.toUpperCase().split('').filter(l => l.match(/[A-Z]/));
      return wordLetters.length > 0 && wordLetters.every(letter => guessedLetters.has(letter));
    }).map(w => w.word);
  }, [words, guessedLetters]);

  // Notify when NEW words are fully revealed (not on every render)
  useEffect(() => {
    if (onWordsRevealed && fullyRevealedWords.length > previousRevealedCount) {
      onWordsRevealed(fullyRevealedWords);
      setPreviousRevealedCount(fullyRevealedWords.length);
    }
  }, [fullyRevealedWords.length, previousRevealedCount, onWordsRevealed, fullyRevealedWords]);

  // Check if game is won (all letters guessed)
  useEffect(() => {
    if (allLetters.length > 0 && allLetters.every(letter => guessedLetters.has(letter))) {
      setGameWon(true);
      setTimeout(() => onComplete(true), 1000);
    }
  }, [guessedLetters, allLetters, onComplete]);

  // Check if game is lost
  useEffect(() => {
    if (wrongGuesses >= MAX_WRONG_GUESSES) {
      setGameLost(true);
      setTimeout(() => onComplete(false), 1000);
    }
  }, [wrongGuesses, onComplete]);

  // Draw hangman
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (larger accessible display)
    canvas.width = 70;
    canvas.height = 88;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing style (thinner lines for compact display)
    ctx.strokeStyle = palette.uiColors.primary || '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Coordinates for larger canvas (70x88)
    const baseX = 8;
    const baseY = 80;
    const topX = 8;
    const topY = 8;
    const ropeX = 35;
    const ropeY = 8;
    const headY = 16;
    const headRadius = 6;
    const bodyStartY = 22;
    const bodyEndY = 50;
    const armY = 28;
    const leftArmX = 24;
    const rightArmX = 46;
    const legStartY = 50;
    const legEndY = 66;
    const leftLegX = 24;
    const rightLegX = 46;

    // Draw gallows
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX, topY);
    ctx.lineTo(ropeX, topY);
    ctx.lineTo(ropeX, headY);
    ctx.stroke();

    // Draw hangman parts based on wrong guesses
    if (wrongGuesses >= 1) {
      // Head
      ctx.beginPath();
      ctx.arc(ropeX, headY, headRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (wrongGuesses >= 2) {
      // Body
      ctx.beginPath();
      ctx.moveTo(ropeX, bodyStartY);
      ctx.lineTo(ropeX, bodyEndY);
      ctx.stroke();
    }

    if (wrongGuesses >= 3) {
      // Left arm
      ctx.beginPath();
      ctx.moveTo(ropeX, armY);
      ctx.lineTo(leftArmX, armY + 12);
      ctx.stroke();
    }

    if (wrongGuesses >= 4) {
      // Right arm
      ctx.beginPath();
      ctx.moveTo(ropeX, armY);
      ctx.lineTo(rightArmX, armY + 12);
      ctx.stroke();
    }

    if (wrongGuesses >= 5) {
      // Left leg
      ctx.beginPath();
      ctx.moveTo(ropeX, legStartY);
      ctx.lineTo(leftLegX, legEndY);
      ctx.stroke();
    }

    if (wrongGuesses >= 6) {
      // Right leg
      ctx.beginPath();
      ctx.moveTo(ropeX, legStartY);
      ctx.lineTo(rightLegX, legEndY);
      ctx.stroke();
    }
  }, [wrongGuesses, palette]);

  const handleLetterClick = useCallback((letter: string) => {
    if (guessedLetters.has(letter) || gameWon || gameLost) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    // Check if letter is in any word
    const isCorrect = words.some(word => 
      word.word.toUpperCase().includes(letter)
    );

    if (isCorrect) {
      // Reveal letter in all words
      if (onLetterRevealed) {
        words.forEach(word => {
          if (word.word.toUpperCase().includes(letter)) {
            onLetterRevealed(word.word, letter);
          }
        });
      }
    } else {
      // Wrong guess - increment wrong guesses
      setWrongGuesses(prev => prev + 1);
    }
  }, [guessedLetters, gameWon, gameLost, words, onLetterRevealed]);

  // Render word with blur for unguessed letters
  const renderWord = (word: GameWord) => {
    return word.word.split('').map((char, index) => {
      const upperChar = char.toUpperCase();
      const isGuessed = guessedLetters.has(upperChar) || !upperChar.match(/[A-Z]/);
      
      return (
        <span
          key={index}
          className={`${styles.wordLetter} ${isGuessed ? styles.revealed : styles.blurred}`}
          style={{
            color: isGuessed ? palette.hiddenWordColor : 'transparent',
            textShadow: isGuessed ? `0 0 8px ${palette.hiddenWordColor}` : 'none',
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className={styles.hangmanContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Hangman Challenge</h3>
        <div className={styles.status}>
          {gameWon && <span className={styles.winMessage}>You Win! 🎉</span>}
          {gameLost && <span className={styles.loseMessage}>Game Over! 💀</span>}
          {!gameWon && !gameLost && (
            <span className={styles.guessesRemaining}>
              Wrong: {wrongGuesses}/{MAX_WRONG_GUESSES}
            </span>
          )}
        </div>
      </div>

      {/* Horizontal layout: Hints | Left panel (hangman + words) | Right side (keyboard) */}
      <div className={styles.gameContent}>
        {/* Hints Panel */}
        <HangmanHints
          words={words.map(w => w.word)}
          guessedLetters={guessedLetters}
          wrongGuesses={wrongGuesses}
          maxWrongGuesses={MAX_WRONG_GUESSES}
          palette={palette}
          gameWon={gameWon}
          gameLost={gameLost}
        />

        {/* Center Panel: Hangman display and hidden words */}
        <div className={styles.leftPanel}>
          <div className={styles.gameArea}>
            <div className={styles.hangmanDisplay}>
              <canvas ref={canvasRef} className={styles.hangmanCanvas} />
            </div>

            <div className={styles.wordsDisplay}>
              {words.map((word, index) => (
                <div key={index} className={styles.wordContainer}>
                  {renderWord(word)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Letter keyboard */}
        <div className={styles.letterKeyboard}>
          {ALPHABET.map(letter => {
            const isGuessed = guessedLetters.has(letter);
            const isWrong = isGuessed && !allLetters.includes(letter);
            const isCorrect = isGuessed && allLetters.includes(letter);
            
            return (
              <button
                key={letter}
                className={`${styles.letterButton} ${
                  isWrong ? styles.wrong : isCorrect ? styles.correct : ''
                }`}
                onClick={() => handleLetterClick(letter)}
                disabled={isGuessed || gameWon || gameLost}
                style={{
                  backgroundColor: isWrong 
                    ? 'rgba(244, 67, 54, 0.3)' 
                    : isCorrect 
                      ? `rgba(76, 175, 80, 0.3)` 
                      : 'rgba(255, 255, 255, 0.1)',
                  borderColor: isWrong
                    ? 'rgba(244, 67, 54, 0.6)'
                    : isCorrect
                      ? 'rgba(76, 175, 80, 0.6)'
                      : palette.uiColors.primary || 'rgba(255, 255, 255, 0.3)',
                  color: isWrong
                    ? '#ef5350'
                    : isCorrect
                      ? '#81c784'
                      : '#ffffff',
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

