import { Level, Difficulty } from '@/types/game';
import { DIFFICULTY_SETTINGS, FONT_SIZE, CHAR_WIDTH, CHAR_HEIGHT } from '@/lib/constants';
import { PaletteDifficulty } from '@/lib/colorPalettes';

export function getDifficultyForLevel(level: number): Difficulty {
  if (level <= 5) return 'easy';
  if (level <= 10) return 'medium';
  if (level <= 20) return 'hard';
  return 'extreme';
}

/**
 * Get text sizing based on color palette difficulty and level
 * Text size is determined by palette difficulty, with additional level-based scaling after level 14
 * Easy palettes: 100% of base (larger, closer letter glitch - baseline)
 * Average palettes: 75% of base (25% smaller)
 * Hard palettes: 55% of base (45% smaller)
 * 
 * After level 14: Text gradually gets smaller (similar to palette difficulty scaling)
 * Level 14-20: Gradual reduction from palette size to 85% of palette size
 * Level 21-30: Further reduction to 70% of palette size
 * Level 31-40: Further reduction to 55% of palette size
 * Level 41+: Minimum at 45% of palette size (similar to hard palette)
 */
export interface TextSizing {
  fontSize: number;
  charWidth: number;
  charHeight: number;
}

export function getTextSizingForDifficulty(
  paletteDifficulty: PaletteDifficulty,
  level?: number
): TextSizing {
  const baseFontSize = FONT_SIZE;
  const baseCharWidth = CHAR_WIDTH;
  const baseCharHeight = CHAR_HEIGHT;

  // Get base sizing from palette difficulty
  let paletteMultiplier: number;
  switch (paletteDifficulty) {
    case 'easy':
      // Easy palettes: 100% of base (baseline - same as original size before enhancement)
      paletteMultiplier = 1.0;
      break;
    case 'average':
      // Average palettes: 75% of base (25% smaller)
      paletteMultiplier = 0.75;
      break;
    case 'hard':
      // Hard palettes: 55% of base (45% smaller)
      paletteMultiplier = 0.55;
      break;
    default:
      // Default to easy sizing
      paletteMultiplier = 1.0;
      break;
  }

  // Apply level-based scaling after level 14 (gradual reduction)
  let levelMultiplier = 1.0;
  if (level && level >= 14) {
    if (level <= 20) {
      // Levels 14-20: Gradual reduction from 100% to 85% of palette size
      // Level 14 = 100%, Level 20 = 85% (linear interpolation)
      const progress = (level - 14) / (20 - 14); // 0 to 1
      levelMultiplier = 1.0 - (progress * 0.15); // 1.0 to 0.85
    } else if (level <= 30) {
      // Levels 21-30: Further reduction from 85% to 70% of palette size
      const progress = (level - 21) / (30 - 21); // 0 to 1
      levelMultiplier = 0.85 - (progress * 0.15); // 0.85 to 0.70
    } else if (level <= 40) {
      // Levels 31-40: Further reduction from 70% to 55% of palette size
      const progress = (level - 31) / (40 - 31); // 0 to 1
      levelMultiplier = 0.70 - (progress * 0.15); // 0.70 to 0.55
    } else {
      // Levels 41+: Minimum at 45% of palette size
      levelMultiplier = 0.45;
    }
  }

  // Combine palette and level multipliers
  const finalMultiplier = paletteMultiplier * levelMultiplier;

  return {
    fontSize: Math.round(baseFontSize * finalMultiplier),
    charWidth: Math.round(baseCharWidth * finalMultiplier),
    charHeight: Math.round(baseCharHeight * finalMultiplier),
  };
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

