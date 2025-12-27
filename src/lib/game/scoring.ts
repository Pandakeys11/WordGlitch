import { GameScore, GameWord, Level } from '@/types/game';
import { getDifficultyMultiplier, PaletteDifficulty } from '@/lib/colorPalettes';

/**
 * Enhanced combo multiplier calculation
 * Exponential scaling for higher combos to reward skill
 * - 1-3 combos: Linear (1.1x, 1.2x, 1.3x)
 * - 4-7 combos: Moderate scaling (1.45x, 1.6x, 1.75x, 1.9x)
 * - 8-10 combos: High scaling (2.1x, 2.3x, 2.5x)
 * - 11+ combos: Exponential (2.7x, 2.9x, 3.2x, etc.)
 */
export function calculateComboMultiplier(combo: number): number {
  if (combo <= 0) return 1;
  
  if (combo <= 3) {
    // Linear for first 3 combos
    return 1 + (combo * 0.1);
  } else if (combo <= 7) {
    // Moderate scaling for 4-7 combos
    const base = 1.3;
    const extra = combo - 3;
    return base + (extra * 0.15);
  } else if (combo <= 10) {
    // High scaling for 8-10 combos
    const base = 1.9;
    const extra = combo - 7;
    return base + (extra * 0.2);
  } else {
    // Exponential for 11+ combos
    const base = 2.5;
    const extra = combo - 10;
    return base + (extra * 0.2) + Math.pow(extra, 1.5) * 0.05;
  }
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
  paletteDifficulty: PaletteDifficulty = 'easy'
): GameScore {
  const basePoints = word.points;
  
  // Time bonus (if time limit exists)
  const timeBonus = timeRemaining ? Math.floor(timeRemaining * 2) : 0;
  
  // Enhanced combo multiplier
  const comboMultiplier = calculateComboMultiplier(combo);
  
  // Palette difficulty multiplier
  const difficultyMultiplier = getDifficultyMultiplier(paletteDifficulty);
  
  // Accuracy calculation
  const accuracy = totalAttempts > 0 
    ? (correctFinds / totalAttempts) * 100 
    : 100;
  const accuracyBonus = Math.floor(accuracy);
  
  // Final score calculation with difficulty multiplier
  const finalScore = Math.floor(
    ((basePoints + timeBonus) * comboMultiplier + accuracyBonus) * difficultyMultiplier
  );
  
  return {
    wordsFound: 1,
    totalPoints: basePoints,
    timeBonus,
    comboMultiplier,
    accuracy,
    finalScore,
    difficultyMultiplier,
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
  
  // Enhanced combo multiplier with exponential scaling
  // Use the calculated combo based on words found
  const comboMultiplier = calculateComboMultiplier(finalCombo);
  
  // Combo bonus: Additional points based on combo achieved
  // Rewards finding more words (combo starts after 3 words)
  const comboBonus = finalCombo > 0 
    ? Math.floor(finalCombo * 10 * (1 + (finalCombo - 1) * 0.2)) // Exponential combo bonus
    : 0;
  
  // Accuracy: Percentage of correct clicks
  const accuracy = totalAttempts > 0 
    ? (correctFinds / totalAttempts) * 100 
    : 100;
  
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

