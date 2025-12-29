/**
 * Pattern Recognition Hints System
 * Provides subtle hints to help players recognize word patterns
 */

import { GameWord } from '@/types/game';

export interface PatternHint {
  type: 'color' | 'position' | 'length' | 'pattern';
  message: string;
  word?: string;
  priority: number; // Higher = more important
}

/**
 * Analyze words to find patterns and generate hints
 */
export function generatePatternHints(
  words: GameWord[],
  foundWords: number,
  totalWords: number,
  timeElapsed: number
): PatternHint[] {
  const hints: PatternHint[] = [];
  const activeWords = words.filter(w => !w.found);
  
  if (activeWords.length === 0) return hints;
  
  // Hint 1: Word length patterns
  const lengths = activeWords.map(w => w.word.length);
  const uniqueLengths = [...new Set(lengths)];
  if (uniqueLengths.length === 1) {
    hints.push({
      type: 'length',
      message: `All words are ${uniqueLengths[0]} letters long`,
      priority: 3,
    });
  } else if (uniqueLengths.length === 2) {
    hints.push({
      type: 'length',
      message: `Words are ${uniqueLengths[0]} or ${uniqueLengths[1]} letters`,
      priority: 2,
    });
  }
  
  // Hint 2: Starting letter patterns
  const firstLetters = activeWords.map(w => w.word[0].toUpperCase());
  const letterCounts = firstLetters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const commonLetter = Object.entries(letterCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (commonLetter && commonLetter[1] >= 2 && commonLetter[1] >= activeWords.length * 0.4) {
    hints.push({
      type: 'pattern',
      message: `${commonLetter[1]} word${commonLetter[1] > 1 ? 's' : ''} start with "${commonLetter[0]}"`,
      priority: 2,
    });
  }
  
  // Hint 3: Progress hint (if struggling)
  const progressRatio = foundWords / totalWords;
  if (timeElapsed > 30 && progressRatio < 0.3) {
    hints.push({
      type: 'position',
      message: 'Look for words away from the center',
      priority: 1,
    });
  }
  
  // Hint 4: Color hint (if using color palettes)
  if (activeWords.length > 0) {
    hints.push({
      type: 'color',
      message: 'Hidden words glow with a special color',
      priority: 1,
    });
  }
  
  // Hint 5: Word count hint
  if (activeWords.length <= 3) {
    hints.push({
      type: 'pattern',
      message: `Only ${activeWords.length} word${activeWords.length > 1 ? 's' : ''} left!`,
      priority: 4,
    });
  }
  
  // Sort by priority (highest first)
  return hints.sort((a, b) => b.priority - a.priority);
}

/**
 * Get a random hint from available hints
 */
export function getRandomHint(hints: PatternHint[]): PatternHint | null {
  if (hints.length === 0) return null;
  
  // Weight by priority (higher priority = more likely)
  const weightedHints: PatternHint[] = [];
  hints.forEach(hint => {
    for (let i = 0; i < hint.priority; i++) {
      weightedHints.push(hint);
    }
  });
  
  return weightedHints[Math.floor(Math.random() * weightedHints.length)];
}

/**
 * Get hint based on player performance
 */
export function getPerformanceHint(
  wordsFound: number,
  totalWords: number,
  timeElapsed: number,
  averageTimePerWord: number
): string | null {
  const progress = wordsFound / totalWords;
  const expectedProgress = timeElapsed / (averageTimePerWord * totalWords);
  
  if (progress < expectedProgress * 0.5) {
    return 'Take your time - words stay visible for a few seconds';
  }
  
  if (progress > expectedProgress * 1.5) {
    return 'Great pace! Keep it up!';
  }
  
  return null;
}


