/**
 * Color Palette System
 * Defines color palettes for glitch animation, hidden words, and UI elements
 * Organized by difficulty: Easy (high contrast) -> Average (medium contrast) -> Hard (low contrast)
 */

export type PaletteDifficulty = 'easy' | 'average' | 'hard';

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  difficulty: PaletteDifficulty; // Difficulty level of the palette
  glitchColors: string[]; // Colors for letter glitch animation
  hiddenWordColor: string; // Color for hidden words (should contrast with glitch colors)
  uiColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
}

/**
 * Get difficulty multiplier for scoring
 */
export function getDifficultyMultiplier(difficulty: PaletteDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 1.0;
    case 'average':
      return 1.5;
    case 'hard':
      return 2.0;
    default:
      return 1.0;
  }
}

export const COLOR_PALETTES: ColorPalette[] = [
  // ==================== EASY (High Contrast) ====================
  // Hidden words use complementary colors that stand out clearly
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Cool teal and blue tones',
    difficulty: 'easy',
    glitchColors: ['#2b4539', '#61dca3', '#61b3dc'],
    hiddenWordColor: '#ff8c42', // Coral-orange (high contrast - complementary)
    uiColors: {
      primary: '#61dca3',
      secondary: '#61b3dc',
      accent: '#2b4539',
      text: '#ffffff',
      background: 'rgba(43, 69, 57, 0.3)',
    },
  },
  {
    id: 'fire',
    name: 'Fire Storm',
    description: 'Warm red and orange flames',
    difficulty: 'easy',
    glitchColors: ['#330000', '#ff4400', '#ff8800', '#ffaa00'],
    hiddenWordColor: '#00d4ff', // Cyan (high contrast - cool complementary)
    uiColors: {
      primary: '#ff4400',
      secondary: '#ff8800',
      accent: '#ffaa00',
      text: '#ffffff',
      background: 'rgba(51, 0, 0, 0.3)',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green and earth tones',
    difficulty: 'easy',
    glitchColors: ['#0a2e0a', '#2d5016', '#4a7c2a', '#6ba83a'],
    hiddenWordColor: '#ff6b9d', // Pink (high contrast - warm complementary)
    uiColors: {
      primary: '#4a7c2a',
      secondary: '#6ba83a',
      accent: '#2d5016',
      text: '#ffffff',
      background: 'rgba(10, 46, 10, 0.3)',
    },
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    description: 'Deep space purple and violet',
    difficulty: 'easy',
    glitchColors: ['#1a0a2e', '#4a148c', '#7b2cbf', '#9d4edd'],
    hiddenWordColor: '#ffd60a', // Golden yellow (high contrast - warm complementary)
    uiColors: {
      primary: '#7b2cbf',
      secondary: '#9d4edd',
      accent: '#4a148c',
      text: '#ffffff',
      background: 'rgba(26, 10, 46, 0.3)',
    },
  },
  {
    id: 'matrix',
    name: 'The Matrix',
    description: 'Green code rain aesthetic',
    difficulty: 'easy',
    glitchColors: ['#0d1b0a', '#003b00', '#00ff41', '#00cc33', '#39ff14'],
    hiddenWordColor: '#ff0033', // Bright red (high contrast - complementary)
    uiColors: {
      primary: '#00ff41',
      secondary: '#00cc33',
      accent: '#003b00',
      text: '#00ff41',
      background: 'rgba(13, 27, 10, 0.4)',
    },
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Festive red, green, and white',
    difficulty: 'easy',
    glitchColors: ['#0d2818', '#1a4d2e', '#228B22', '#dc143c', '#ff0000', '#ffffff'],
    hiddenWordColor: '#ffd700', // Gold (high contrast - stands out from red/green/white)
    uiColors: {
      primary: '#dc143c',
      secondary: '#228B22',
      accent: '#ffffff',
      text: '#ffffff',
      background: 'rgba(13, 40, 24, 0.4)',
    },
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky orange, black, and purple',
    difficulty: 'easy',
    glitchColors: ['#000000', '#1a0a1a', '#ff6600', '#ff8800', '#8b00ff'],
    hiddenWordColor: '#00ff41', // Bright green (high contrast - complementary)
    uiColors: {
      primary: '#ff6600',
      secondary: '#ff8800',
      accent: '#8b00ff',
      text: '#ffffff',
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ==================== AVERAGE (Medium Contrast) ====================
  // Hidden words use related colors that blend more but are still distinguishable
  {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Vibrant neon pink and purple',
    difficulty: 'average',
    glitchColors: ['#1a0033', '#ff00ff', '#00ffff', '#ff00aa'],
    hiddenWordColor: '#ffaa00', // Bright orange-yellow (better contrast - warmer than cyan/pink)
    uiColors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ff00aa',
      text: '#ffffff',
      background: 'rgba(26, 0, 51, 0.3)',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    description: 'Neon city night vibes',
    difficulty: 'average',
    glitchColors: ['#1a0033', '#ff0080', '#00f5ff', '#ffd700', '#8b00ff'],
    hiddenWordColor: '#00ffaa', // Bright cyan-green (better contrast - stands out from pink/purple/cyan mix)
    uiColors: {
      primary: '#ff0080',
      secondary: '#00f5ff',
      accent: '#ffd700',
      text: '#ffffff',
      background: 'rgba(26, 0, 51, 0.4)',
    },
  },
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    description: 'Whimsical pastel dreamscape',
    difficulty: 'average',
    glitchColors: ['#2d4a2d', '#7fb3d3', '#a8d5ba', '#ffd93d', '#ff9aa2'],
    hiddenWordColor: '#ff6b9d', // Bright pink-rose (better contrast - more vibrant than pastels)
    uiColors: {
      primary: '#7fb3d3',
      secondary: '#a8d5ba',
      accent: '#ffd93d',
      text: '#ffffff',
      background: 'rgba(45, 74, 45, 0.3)',
    },
  },
  {
    id: 'starwars',
    name: 'Star Wars',
    description: 'Lightsaber blue and deep space',
    difficulty: 'average',
    glitchColors: ['#000428', '#004e92', '#4fc3f7', '#29b6f6', '#81d4fa'],
    hiddenWordColor: '#ffaa00', // Warm amber-orange (better contrast - complements blue)
    uiColors: {
      primary: '#4fc3f7',
      secondary: '#29b6f6',
      accent: '#004e92',
      text: '#ffffff',
      background: 'rgba(0, 4, 40, 0.4)',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave 80s',
    description: 'Retro sunset nostalgia',
    difficulty: 'average',
    glitchColors: ['#0a0a0f', '#1a0033', '#ff0080', '#ff8c00', '#00d9ff'],
    hiddenWordColor: '#00ff88', // Bright green (better contrast - complementary to pink/cyan)
    uiColors: {
      primary: '#ff0080',
      secondary: '#00d9ff',
      accent: '#ff8c00',
      text: '#ffffff',
      background: 'rgba(26, 0, 51, 0.4)',
    },
  },
  {
    id: 'newyear',
    name: 'New Year',
    description: 'Celebratory gold, silver, and champagne',
    difficulty: 'average',
    glitchColors: ['#1a1a1a', '#2d2d2d', '#ffd700', '#c0c0c0', '#f5deb3'],
    hiddenWordColor: '#ff6b9d', // Bright pink (better contrast - stands out from gold/silver)
    uiColors: {
      primary: '#ffd700',
      secondary: '#c0c0c0',
      accent: '#f5deb3',
      text: '#ffffff',
      background: 'rgba(26, 26, 26, 0.45)',
    },
  },
  {
    id: 'valentine',
    name: 'Valentine\'s Day',
    description: 'Romantic pink, red, and rose',
    difficulty: 'average',
    glitchColors: ['#2d0a1a', '#8b1538', '#ff1493', '#ff69b4', '#ffc0cb'],
    hiddenWordColor: '#87ceeb', // Light sky blue (better contrast - cool complementary to warm pinks)
    uiColors: {
      primary: '#ff1493',
      secondary: '#ff69b4',
      accent: '#8b1538',
      text: '#ffffff',
      background: 'rgba(45, 10, 26, 0.4)',
    },
  },

  // ==================== HARD (Low Contrast) ====================
  // Hidden words use colors very close to glitch colors but still visible
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Soft pastel dreamscape',
    difficulty: 'hard',
    glitchColors: ['#2d1b4e', '#ff71ce', '#01cdfe', '#05ffa1', '#b967ff'],
    hiddenWordColor: '#ff9ee6', // Slightly different pink (low contrast - very similar to glitch pink)
    uiColors: {
      primary: '#ff71ce',
      secondary: '#01cdfe',
      accent: '#b967ff',
      text: '#ffffff',
      background: 'rgba(45, 27, 78, 0.35)',
    },
  },
  {
    id: 'terminal',
    name: 'Terminal Amber',
    description: 'Classic retro computing',
    difficulty: 'hard',
    glitchColors: ['#1a1a1a', '#2a2a1a', '#ffb000', '#ffaa00', '#ff9900'],
    hiddenWordColor: '#ffcc33', // Lighter amber (low contrast - similar to amber but lighter)
    uiColors: {
      primary: '#ffb000',
      secondary: '#ffaa00',
      accent: '#2a2a1a',
      text: '#ffb000',
      background: 'rgba(26, 26, 26, 0.5)',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights magic',
    difficulty: 'hard',
    glitchColors: ['#0a1929', '#00e676', '#00bcd4', '#7c4dff', '#00acc1'],
    hiddenWordColor: '#4dd0e1', // Lighter cyan-green (low contrast - similar to glitch colors)
    uiColors: {
      primary: '#00e676',
      secondary: '#00bcd4',
      accent: '#7c4dff',
      text: '#ffffff',
      background: 'rgba(10, 25, 41, 0.4)',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Cobalt',
    description: 'Deep night electric blue',
    difficulty: 'hard',
    glitchColors: ['#000814', '#001d3d', '#003566', '#0a6bc2', '#4cc9f0'],
    hiddenWordColor: '#7dd3fc', // Lighter blue (low contrast - similar to electric blue but lighter)
    uiColors: {
      primary: '#4cc9f0',
      secondary: '#0a6bc2',
      accent: '#003566',
      text: '#ffffff',
      background: 'rgba(0, 8, 20, 0.45)',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    description: 'Warm golden hour palette',
    difficulty: 'hard',
    glitchColors: ['#1a0a0a', '#8b3a3a', '#ff6b35', '#ffa500', '#ffd700'],
    hiddenWordColor: '#ffb84d', // Lighter orange-gold (low contrast - similar to sunset colors)
    uiColors: {
      primary: '#ff6b35',
      secondary: '#ffa500',
      accent: '#ffd700',
      text: '#ffffff',
      background: 'rgba(26, 10, 10, 0.4)',
    },
  },
  {
    id: 'easter',
    name: 'Easter',
    description: 'Soft pastel spring colors',
    difficulty: 'hard',
    glitchColors: ['#2d2d2d', '#ffb6c1', '#ffd700', '#98fb98', '#87ceeb'],
    hiddenWordColor: '#ffc1cc', // Very similar light pink (low contrast - close to pastel pink)
    uiColors: {
      primary: '#ffb6c1',
      secondary: '#98fb98',
      accent: '#87ceeb',
      text: '#ffffff',
      background: 'rgba(45, 45, 45, 0.35)',
    },
  },
];

export const DEFAULT_PALETTE_ID = 'ocean';

/**
 * Get palette by ID
 */
export function getPalette(paletteId: string): ColorPalette {
  const palette = COLOR_PALETTES.find(p => p.id === paletteId);
  return palette || COLOR_PALETTES.find(p => p.id === DEFAULT_PALETTE_ID)!;
}

/**
 * Get next palette in cycle
 */
export function getNextPalette(currentPaletteId: string): ColorPalette {
  const currentIndex = COLOR_PALETTES.findIndex(p => p.id === currentPaletteId);
  const nextIndex = (currentIndex + 1) % COLOR_PALETTES.length;
  return COLOR_PALETTES[nextIndex];
}

/**
 * Get next palette by difficulty - cycles through same difficulty first, then moves to next
 */
export function getNextPaletteByDifficulty(currentPaletteId: string): ColorPalette {
  const currentPalette = getPalette(currentPaletteId);
  const currentDifficulty = currentPalette.difficulty;
  
  // Get all palettes of the same difficulty
  const sameDifficultyPalettes = COLOR_PALETTES.filter(p => p.difficulty === currentDifficulty);
  
  // Find current palette index within same difficulty
  const currentIndexInDifficulty = sameDifficultyPalettes.findIndex(p => p.id === currentPaletteId);
  
  // If there's a next palette in the same difficulty, use it
  if (currentIndexInDifficulty < sameDifficultyPalettes.length - 1) {
    return sameDifficultyPalettes[currentIndexInDifficulty + 1];
  }
  
  // Otherwise, move to the first palette of the next difficulty
  const difficultyOrder: PaletteDifficulty[] = ['easy', 'average', 'hard'];
  const currentDifficultyIndex = difficultyOrder.indexOf(currentDifficulty);
  const nextDifficultyIndex = (currentDifficultyIndex + 1) % difficultyOrder.length;
  const nextDifficulty = difficultyOrder[nextDifficultyIndex];
  
  // Get first palette of next difficulty
  const nextDifficultyPalettes = COLOR_PALETTES.filter(p => p.difficulty === nextDifficulty);
  if (nextDifficultyPalettes.length > 0) {
    return nextDifficultyPalettes[0];
  }
  
  // Fallback: just cycle to next palette
  return getNextPalette(currentPaletteId);
}

/**
 * Get previous palette in cycle
 */
export function getPreviousPalette(currentPaletteId: string): ColorPalette {
  const currentIndex = COLOR_PALETTES.findIndex(p => p.id === currentPaletteId);
  const prevIndex = currentIndex === 0 ? COLOR_PALETTES.length - 1 : currentIndex - 1;
  return COLOR_PALETTES[prevIndex];
}
