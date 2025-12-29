/**
 * Combo and Streak System
 * Rewards players for consecutive word finds and maintains engagement
 */

export interface ComboState {
  currentCombo: number;
  maxCombo: number;
  currentStreak: number; // Consecutive levels completed
  longestStreak: number;
  lastWordFoundTime: number;
  comboMultiplier: number;
  streakBonus: number;
}

const COMBO_TIMEOUT = 5000; // 5 seconds to maintain combo
const COMBO_MULTIPLIERS = {
  1: 1.0,    // No combo
  2: 1.1,    // 2 words
  3: 1.25,   // 3 words
  5: 1.5,    // 5 words
  7: 1.75,   // 7 words
  10: 2.0,   // 10 words
  15: 2.5,   // 15 words
  20: 3.0,   // 20 words
  25: 3.5,   // 25 words
  30: 4.0,   // 30+ words
};

const STREAK_BONUSES = {
  1: 0,      // No streak
  3: 0.1,    // 3 levels
  5: 0.2,    // 5 levels
  10: 0.3,   // 10 levels
  15: 0.4,   // 15 levels
  20: 0.5,   // 20 levels
  25: 0.6,   // 25 levels
  30: 0.7,   // 30+ levels
};

/**
 * Get combo multiplier for current combo count
 */
export function getComboMultiplier(combo: number): number {
  const thresholds = Object.keys(COMBO_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (combo >= threshold) {
      return COMBO_MULTIPLIERS[threshold as keyof typeof COMBO_MULTIPLIERS];
    }
  }
  
  return 1.0;
}

/**
 * Get streak bonus for current streak
 */
export function getStreakBonus(streak: number): number {
  const thresholds = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const threshold of thresholds) {
    if (streak >= threshold) {
      return STREAK_BONUSES[threshold as keyof typeof STREAK_BONUSES];
    }
  }
  
  return 0;
}

/**
 * Calculate score with combo and streak bonuses
 */
export function calculateScoreWithBonuses(
  baseScore: number,
  combo: number,
  streak: number
): {
  finalScore: number;
  comboMultiplier: number;
  streakBonus: number;
  comboBonus: number;
  streakBonusAmount: number;
} {
  const comboMultiplier = getComboMultiplier(combo);
  const streakBonus = getStreakBonus(streak);
  
  const comboBonus = baseScore * (comboMultiplier - 1);
  const streakBonusAmount = baseScore * streakBonus;
  const finalScore = baseScore + comboBonus + streakBonusAmount;
  
  return {
    finalScore: Math.round(finalScore),
    comboMultiplier,
    streakBonus,
    comboBonus: Math.round(comboBonus),
    streakBonusAmount: Math.round(streakBonusAmount),
  };
}

/**
 * Check if combo should be reset (timeout)
 */
export function shouldResetCombo(lastWordFoundTime: number): boolean {
  return Date.now() - lastWordFoundTime > COMBO_TIMEOUT;
}

/**
 * Get combo message for display
 */
export function getComboMessage(combo: number): string | null {
  if (combo < 2) return null;
  
  if (combo === 2) return 'Combo!';
  if (combo === 3) return '3x Combo!';
  if (combo === 5) return '5x Combo!';
  if (combo === 7) return '7x Combo!';
  if (combo === 10) return '10x Combo!';
  if (combo === 15) return '15x Combo!';
  if (combo === 20) return '20x Combo!';
  if (combo === 25) return '25x Combo!';
  if (combo === 30) return '30x Combo!';
  if (combo >= 30) return `${combo}x Combo!`;
  
  return `${combo}x Combo!`;
}

/**
 * Get streak message for display
 */
export function getStreakMessage(streak: number): string | null {
  if (streak < 3) return null;
  
  if (streak === 3) return '3 Level Streak!';
  if (streak === 5) return '5 Level Streak!';
  if (streak === 10) return '10 Level Streak!';
  if (streak === 15) return '15 Level Streak!';
  if (streak === 20) return '20 Level Streak!';
  if (streak === 25) return '25 Level Streak!';
  if (streak === 30) return '30 Level Streak!';
  if (streak >= 30) return `${streak} Level Streak!`;
  
  return `${streak} Level Streak!`;
}


