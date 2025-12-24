import { GameScore, GameWord } from '@/types/game';
import { getDifficultyMultiplier, PaletteDifficulty } from '@/lib/colorPalettes';

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
  
  // Combo multiplier
  const comboMultiplier = 1 + (combo * 0.1);
  
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
  };
}

export function calculateFinalScore(
  words: GameWord[],
  timeRemaining?: number,
  maxCombo: number = 0,
  totalAttempts: number = 0,
  correctFinds: number = 0,
  levelTime?: number, // Time taken to complete the level in seconds
  paletteDifficulty: PaletteDifficulty = 'easy'
): GameScore {
  const foundWords = words.filter(w => w.found);
  const totalBasePoints = foundWords.reduce((sum, word) => sum + word.points, 0);
  
  // Time bonus: More time remaining = higher bonus (only if time limit exists)
  // Balanced: 2 points per second remaining
  const timeBonus = timeRemaining ? Math.floor(timeRemaining * 2) : 0;
  
  // Combo multiplier: Rewards consecutive finds
  // Balanced: 10% per combo (max 10 combos = 2x multiplier)
  const comboMultiplier = 1 + (maxCombo * 0.1);
  
  // Palette difficulty multiplier
  const difficultyMultiplier = getDifficultyMultiplier(paletteDifficulty);
  
  // Accuracy: Percentage of correct clicks
  // Balanced: Direct percentage (100% = 100 bonus points)
  const accuracy = totalAttempts > 0 
    ? (correctFinds / totalAttempts) * 100 
    : 100;
  const accuracyBonus = Math.floor(accuracy);
  
  // Final score calculation: Balanced formula with difficulty multiplier
  // Base points + time bonus, multiplied by combo, plus accuracy bonus, then multiplied by difficulty
  // This ensures all factors contribute meaningfully
  const finalScore = Math.floor(
    ((totalBasePoints + timeBonus) * comboMultiplier + accuracyBonus) * difficultyMultiplier
  );
  
  return {
    wordsFound: foundWords.length,
    totalPoints: totalBasePoints,
    timeBonus,
    comboMultiplier,
    accuracy,
    finalScore,
    levelTime: levelTime !== undefined ? Math.round(levelTime * 10) / 10 : undefined, // Round to 1 decimal place
  };
}

