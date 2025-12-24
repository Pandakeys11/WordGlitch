import { Level, Difficulty } from '@/types/game';
import { DIFFICULTY_SETTINGS } from '@/lib/constants';

export function getDifficultyForLevel(level: number): Difficulty {
  if (level <= 5) return 'easy';
  if (level <= 10) return 'medium';
  if (level <= 20) return 'hard';
  return 'extreme';
}

export function initializeLevel(level: number): Level {
  const difficulty = getDifficultyForLevel(level);
  const baseSettings = DIFFICULTY_SETTINGS[difficulty];

  // Progressive scaling
  const levelMultiplier = 1 + (level - 1) * 0.1;
  
  // Creative level twists - vary word count based on level patterns
  let wordCount: number;
  if (level <= 3) {
    // Levels 1-3: Start easy with 3 words
    wordCount = 3;
  } else if (level <= 7) {
    // Levels 4-7: Increase to 4-5 words
    wordCount = 4 + Math.floor((level - 4) / 2);
  } else if (level <= 15) {
    // Levels 8-15: Progressive increase, some levels have fewer words (twist!)
    // Every 3rd level has one less word for variety
    const baseCount = 5 + Math.floor((level - 8) / 2);
    wordCount = (level % 3 === 0) ? baseCount - 1 : baseCount;
  } else if (level <= 25) {
    // Levels 16-25: More words, but every 4th level has fewer (challenge variation)
    const baseCount = 7 + Math.floor((level - 16) / 3);
    wordCount = (level % 4 === 0) ? baseCount - 1 : baseCount;
  } else {
    // Levels 26+: Maximum challenge with 8-10 words
    const baseCount = 8 + Math.floor((level - 26) / 5);
    wordCount = Math.min(baseCount, 10);
  }
  
  // Ensure word count is reasonable
  wordCount = Math.max(3, Math.min(wordCount, 10));
  
  return {
    level,
    difficulty,
    wordCount,
    minWordLength: difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : difficulty === 'hard' ? 5 : 6,
    maxWordLength: difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : difficulty === 'hard' ? 7 : 8,
    glitchSpeed: Math.max(20, baseSettings.glitchSpeed - (level - 1) * 2),
    letterUpdateRate: Math.min(0.15, baseSettings.letterUpdateRate * levelMultiplier),
    timeLimit: level > 10 ? Math.max(30, 120 - level * 2) : undefined,
    vortexStrength: Math.min(0.95, baseSettings.vortexStrength + (level - 1) * 0.02),
  };
}

