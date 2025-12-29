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
 * Text size is determined by palette difficulty, with level-based scaling only on boss levels (every 10 levels)
 * Easy palettes: 100% of base (larger, closer letter glitch - baseline)
 * Average palettes: 75% of base (25% smaller)
 * Hard palettes: 55% of base (45% smaller)
 * 
 * Text sizing only updates on boss levels (every 10 levels: 10, 20, 30, 40, etc.)
 * Level 1-9: 100% of palette size
 * Level 10-19: 90% of palette size (boss level 10)
 * Level 20-29: 80% of palette size (boss level 20)
 * Level 30-39: 70% of palette size (boss level 30)
 * Level 40-49: 60% of palette size (boss level 40)
 * Level 50+: 50% of palette size (boss level 50+)
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

  // Apply level-based scaling only on boss levels (every 10 levels)
  // Text sizing only changes when you reach a new boss level tier
  let levelMultiplier = 1.0;
  if (level && level >= 10) {
    // Determine which boss tier this level belongs to
    // Levels 10-19: tier 1 (90%), Levels 20-29: tier 2 (80%), etc.
    const bossTier = Math.floor(level / 10);
    
    // Each boss tier reduces size by 10% (starts at 90% for tier 1, down to 50% minimum)
    // Tier 1 (level 10): 90%
    // Tier 2 (level 20): 80%
    // Tier 3 (level 30): 70%
    // Tier 4 (level 40): 60%
    // Tier 5+ (level 50+): 50% (minimum)
    levelMultiplier = Math.max(0.50, 1.0 - (bossTier * 0.10));
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

