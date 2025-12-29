import { GameScore, GameWord, Level } from '@/types/game';
import { getDifficultyMultiplier, PaletteDifficulty } from '@/lib/colorPalettes';

/**
 * Performance-based combo multiplier calculation
 * Balanced to reward skill while maintaining fairness
 * 
 * Combo is based on consecutive word finds (starts after 3 words)
 * Multiplier scales based on:
 * - Base combo progression (moderate scaling)
 * - Accuracy bonus (higher accuracy = better multiplier)
 * - Speed bonus (faster finds = better multiplier)
 * 
 * Formula: baseMultiplier * (1 + accuracyBonus) * (1 + speedBonus)
 */
export function calculateComboMultiplier(
  combo: number,
  accuracy: number = 100,
  averageTimeBetweenWords: number = 0 // seconds between word finds
): number {
  if (combo <= 0) return 1;
  
  // Base combo multiplier - moderate scaling to prevent excessive scores
  let baseMultiplier = 1.0;
  
  if (combo <= 3) {
    // First 3 combos: Small linear boost (1.0x, 1.05x, 1.1x, 1.15x)
    baseMultiplier = 1.0 + (combo * 0.05);
  } else if (combo <= 7) {
    // 4-7 combos: Moderate boost (1.2x, 1.25x, 1.3x, 1.35x)
    baseMultiplier = 1.2 + ((combo - 3) * 0.05);
  } else if (combo <= 12) {
    // 8-12 combos: Good boost (1.4x, 1.45x, 1.5x, 1.55x, 1.6x)
    baseMultiplier = 1.4 + ((combo - 7) * 0.05);
  } else if (combo <= 20) {
    // 13-20 combos: High boost (1.65x to 2.0x)
    baseMultiplier = 1.65 + ((combo - 12) * 0.04375);
  } else {
    // 21+ combos: Very high but capped (2.0x to 2.5x max)
    baseMultiplier = Math.min(2.5, 2.0 + ((combo - 20) * 0.05));
  }
  
  // Accuracy bonus: Reward high accuracy
  // 100% accuracy = +20% multiplier
  // 90% accuracy = +10% multiplier
  // 80% accuracy = +5% multiplier
  // Below 80% = no bonus
  const accuracyBonus = accuracy >= 80 
    ? (accuracy - 80) / 100 // 0 to 0.2 (0% to 20% bonus)
    : 0;
  
  // Speed bonus: Reward fast consecutive finds
  // Average time < 2s = +15% multiplier
  // Average time < 4s = +10% multiplier
  // Average time < 6s = +5% multiplier
  // Slower = no bonus
  let speedBonus = 0;
  if (averageTimeBetweenWords > 0 && averageTimeBetweenWords < 6) {
    if (averageTimeBetweenWords < 2) {
      speedBonus = 0.15; // Very fast
    } else if (averageTimeBetweenWords < 4) {
      speedBonus = 0.10; // Fast
    } else {
      speedBonus = 0.05; // Moderate speed
    }
  }
  
  // Apply bonuses to base multiplier
  const finalMultiplier = baseMultiplier * (1 + accuracyBonus) * (1 + speedBonus);
  
  // Cap at 3.0x to maintain balance
  return Math.min(3.0, finalMultiplier);
}

/**
 * Calculate performance rating based on score, accuracy, and speed
 */
export function calculatePerformanceRating(
  score: number,
  accuracy: number,
  levelTime: number | undefined,
  level: number,
  expectedTime?: number
): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  // Base rating on accuracy
  let rating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  
  if (accuracy >= 95) {
    rating = 'S';
  } else if (accuracy >= 85) {
    rating = 'A';
  } else if (accuracy >= 70) {
    rating = 'B';
  } else if (accuracy >= 50) {
    rating = 'C';
  } else if (accuracy >= 30) {
    rating = 'D';
  }
  
  // Adjust based on speed (if time data available)
  if (levelTime !== undefined && expectedTime) {
    const speedRatio = expectedTime / levelTime;
    if (speedRatio >= 1.5 && rating !== 'S') {
      // Completed much faster than expected - boost rating
      if (rating === 'A') rating = 'S';
      else if (rating === 'B') rating = 'A';
      else if (rating === 'C') rating = 'B';
    } else if (speedRatio < 0.7) {
      // Took much longer than expected - lower rating
      if (rating === 'S') rating = 'A';
      else if (rating === 'A') rating = 'B';
      else if (rating === 'B') rating = 'C';
    }
  }
  
  return rating;
}

export function calculateScore(
  word: GameWord,
  timeRemaining?: number,
  combo: number = 0,
  totalAttempts: number = 0,
  correctFinds: number = 0,
  paletteDifficulty: PaletteDifficulty = 'easy',
  timeSinceLastWord?: number // Time in seconds since last word was found
): GameScore {
  const basePoints = word.points;
  
  // Time bonus (if time limit exists)
  const timeBonus = timeRemaining ? Math.floor(timeRemaining * 2) : 0;
  
  // Accuracy calculation
  const accuracy = totalAttempts > 0 
    ? (correctFinds / totalAttempts) * 100 
    : 100;
  
  // Performance-based combo multiplier (includes accuracy and speed bonuses)
  const comboMultiplier = calculateComboMultiplier(
    combo,
    accuracy,
    timeSinceLastWord || 0
  );
  
  // Palette difficulty multiplier
  const difficultyMultiplier = getDifficultyMultiplier(paletteDifficulty);
  
  // Accuracy bonus points
  const accuracyBonus = Math.floor(accuracy);
  
  // Performance-based combo bonus
  let comboBonus = 0;
  if (combo > 0) {
    const baseBonus = combo * 5;
    const accuracyMultiplier = accuracy >= 90 ? 1.5 : accuracy >= 80 ? 1.25 : 1.0;
    let speedMultiplier = 1.0;
    if (timeSinceLastWord && timeSinceLastWord < 6) {
      if (timeSinceLastWord < 2) speedMultiplier = 1.5;
      else if (timeSinceLastWord < 4) speedMultiplier = 1.25;
      else speedMultiplier = 1.1;
    }
    comboBonus = Math.floor(baseBonus * accuracyMultiplier * speedMultiplier);
  }
  
  // Final score calculation with difficulty multiplier
  const beforeMultipliers = basePoints + timeBonus + accuracyBonus + comboBonus;
  const afterCombo = beforeMultipliers * comboMultiplier;
  const finalScore = Math.floor(afterCombo * difficultyMultiplier);
  
  return {
    wordsFound: 1,
    totalPoints: basePoints,
    timeBonus,
    comboMultiplier,
    accuracy,
    finalScore,
    difficultyMultiplier,
    comboBonus,
  };
}

export function calculateFinalScore(
  words: GameWord[],
  timeRemaining?: number,
  maxCombo: number = 0,
  totalAttempts: number = 0,
  correctFinds: number = 0,
  levelTime?: number, // Time taken to complete the level in seconds
  paletteDifficulty: PaletteDifficulty = 'easy',
  level?: number // Level number for level-based multipliers
): GameScore {
  const foundWords = words.filter(w => w.found);
  const totalBasePoints = foundWords.reduce((sum, word) => sum + word.points, 0);
  
  // Calculate combo based on total words found (starts after 3 words)
  // Combo = wordsFound - 3 (so 0 for first 3 words, then 1, 2, 3, etc.)
  const wordsFound = foundWords.length;
  const actualCombo = Math.max(0, wordsFound - 3); // Combo starts after 3 words
  // Use the actual combo for calculations (maxCombo parameter is legacy, we calculate from words found)
  const finalCombo = Math.max(actualCombo, maxCombo); // Use max of calculated or passed value
  
  // Level multiplier: Higher levels give more points
  // Scales from 1.0x at level 1 to 2.0x at level 50, then continues scaling
  const levelMultiplier = level 
    ? Math.min(2.0 + ((level - 1) / 50) * 0.5, 3.0) // Cap at 3.0x for very high levels
    : 1.0;
  
  // Palette difficulty multiplier
  const difficultyMultiplier = getDifficultyMultiplier(paletteDifficulty);
  
  // Time bonus: More time remaining = higher bonus (only if time limit exists)
  // Enhanced: 3 points per second remaining (increased from 2)
  const timeBonus = timeRemaining ? Math.floor(timeRemaining * 3) : 0;
  
  // Performance-based combo multiplier
  // Calculate average time between word finds for speed bonus
  const foundWordsWithTimes = foundWords.filter(w => w.foundAt !== undefined);
  let averageTimeBetweenWords = 0;
  if (foundWordsWithTimes.length > 1 && levelTime) {
    const timeSpans: number[] = [];
    const sortedWords = [...foundWordsWithTimes].sort((a, b) => (a.foundAt || 0) - (b.foundAt || 0));
    for (let i = 1; i < sortedWords.length; i++) {
      const timeDiff = ((sortedWords[i].foundAt || 0) - (sortedWords[i - 1].foundAt || 0)) / 1000; // Convert to seconds
      if (timeDiff > 0) {
        timeSpans.push(timeDiff);
      }
    }
    if (timeSpans.length > 0) {
      averageTimeBetweenWords = timeSpans.reduce((sum, t) => sum + t, 0) / timeSpans.length;
    }
  }
  
  // Accuracy: Percentage of correct clicks (calculated first as it's used by other calculations)
  const accuracy = totalAttempts > 0 
    ? (correctFinds / totalAttempts) * 100 
    : 100;

  // Enhanced combo multiplier with performance bonuses
  const comboMultiplier = calculateComboMultiplier(finalCombo, accuracy, averageTimeBetweenWords);
  
  // Performance-based combo bonus
  // Base bonus scales with combo, but is balanced
  let comboBonus = 0;
  if (finalCombo > 0) {
    // Base bonus: 5 points per combo level
    const baseBonus = finalCombo * 5;
    
    // Accuracy multiplier for bonus
    const accuracyMultiplier = accuracy >= 90 ? 1.5 : accuracy >= 80 ? 1.25 : 1.0;
    
    // Speed multiplier for bonus (faster = more bonus)
    let speedMultiplier = 1.0;
    if (averageTimeBetweenWords > 0) {
      if (averageTimeBetweenWords < 2) {
        speedMultiplier = 1.5; // Very fast
      } else if (averageTimeBetweenWords < 4) {
        speedMultiplier = 1.25; // Fast
      } else if (averageTimeBetweenWords < 6) {
        speedMultiplier = 1.1; // Moderate
      }
    }
    
    comboBonus = Math.floor(baseBonus * accuracyMultiplier * speedMultiplier);
  }
  
  // Accuracy bonus: Base accuracy points
  const accuracyBonus = Math.floor(accuracy);
  
  // Perfect accuracy bonus: Extra reward for 100% accuracy
  const perfectAccuracyBonus = accuracy >= 100 ? 50 : 0;
  
  // Word length bonus: Reward finding longer words
  // Longer words are worth more, so finding them gives bonus
  const averageWordLength = foundWords.length > 0
    ? foundWords.reduce((sum, w) => sum + w.word.length, 0) / foundWords.length
    : 0;
  const wordLengthBonus = Math.floor(averageWordLength * foundWords.length * 2);
  
  // Speed bonus: Reward completing level quickly
  // Based on level time vs expected time (if time limit exists)
  let speedBonus = 0;
  if (levelTime !== undefined && timeRemaining !== undefined) {
    // If completed with time remaining, give speed bonus
    const timeUsed = (timeRemaining / (timeRemaining + levelTime)) * 100;
    if (timeUsed < 50) {
      // Used less than 50% of available time - speed bonus
      speedBonus = Math.floor((50 - timeUsed) * 5);
    }
  } else if (levelTime !== undefined && level) {
    // Estimate expected time based on level (rough estimate: 30s base + 5s per level)
    const expectedTime = 30 + (level * 5);
    if (levelTime < expectedTime) {
      const speedRatio = levelTime / expectedTime;
      speedBonus = Math.floor((1 - speedRatio) * 100);
    }
  }
  
  // Calculate score before multipliers
  const beforeMultipliers = totalBasePoints + timeBonus + accuracyBonus + 
                            perfectAccuracyBonus + comboBonus + wordLengthBonus + speedBonus;
  
  // Apply multipliers
  const afterCombo = beforeMultipliers * comboMultiplier;
  const afterLevel = afterCombo * levelMultiplier;
  const finalScore = Math.floor(afterLevel * difficultyMultiplier);
  
  // Calculate performance rating
  const expectedTime = level ? 30 + (level * 5) : undefined;
  const performanceRating = calculatePerformanceRating(
    finalScore,
    accuracy,
    levelTime,
    level || 1,
    expectedTime
  );
  
  return {
    wordsFound: foundWords.length,
    totalPoints: totalBasePoints,
    timeBonus,
    comboMultiplier,
    accuracy,
    finalScore,
    levelTime: levelTime !== undefined ? Math.round(levelTime * 10) / 10 : undefined,
    
    // Enhanced scoring breakdown
    levelMultiplier,
    difficultyMultiplier,
    speedBonus,
    accuracyBonus,
    perfectAccuracyBonus,
    comboBonus,
    wordLengthBonus,
    performanceRating,
    scoreBreakdown: {
      baseScore: totalBasePoints,
      timeBonus,
      accuracyBonus,
      comboBonus,
      speedBonus,
      wordLengthBonus,
      beforeMultipliers,
      levelMultiplier,
      difficultyMultiplier,
      finalScore,
    },
  };
}

