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
    glitchColors: ['#2b4539', '#4ba080', '#4d8fb0'], // Softened - reduced brightness
    hiddenWordColor: '#ffaa5c', // Stronger - brighter coral-orange for better visibility
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
    glitchColors: ['#330000', '#cc3300', '#cc6600', '#cc8800'], // Softened - reduced saturation
    hiddenWordColor: '#00f0ff', // Stronger - brighter cyan for better visibility
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
    glitchColors: ['#0a2e0a', '#244010', '#3c6218', '#55862e'], // Softened - reduced brightness
    hiddenWordColor: '#ff80b3', // Stronger - brighter pink for better visibility
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
    glitchColors: ['#1a0a2e', '#3a1070', '#622399', '#7d3eb0'], // Softened - reduced saturation
    hiddenWordColor: '#ffed3a', // Stronger - brighter golden yellow for better visibility
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
    glitchColors: ['#0d1b0a', '#003b00', '#00cc33', '#00a028', '#2dcc10'], // Softened - reduced brightness
    hiddenWordColor: '#ff3366', // Stronger - brighter red for better visibility
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
    glitchColors: ['#0d2818', '#1a4d2e', '#1a701a', '#b01030', '#cc0000', '#cccccc'], // Softened - reduced saturation/brightness
    hiddenWordColor: '#ffed4a', // Stronger - brighter gold for better visibility
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
    glitchColors: ['#000000', '#1a0a1a', '#cc5200', '#cc6d00', '#7000cc'], // Softened - reduced saturation
    hiddenWordColor: '#33ff66', // Stronger - brighter green for better visibility
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
    glitchColors: ['#1a0033', '#cc00cc', '#00cccc', '#cc0088'], // Softened - reduced saturation
    hiddenWordColor: '#ffcc33', // Stronger - brighter orange-yellow for better visibility
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
    glitchColors: ['#1a0033', '#cc0066', '#00c4cc', '#ccaa00', '#7000cc'], // Softened - reduced saturation
    hiddenWordColor: '#33ffcc', // Stronger - brighter cyan-green for better visibility
    uiColors: {
      primary: '#ff0080',
      secondary: '#00f5ff',
      accent: '#ffd700',
      text: '#ffffff',
      background: 'rgba(26, 0, 51, 0.4)',
    },
  },
  {
    id: 'starwars',
    name: 'Star Wars',
    description: 'Lightsaber blue and deep space',
    difficulty: 'average',
    glitchColors: ['#000428', '#003e75', '#3f9cc6', '#2092c6', '#66a8c8'], // Softened - reduced brightness
    hiddenWordColor: '#ffcc33', // Stronger - brighter amber-orange for better visibility
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
    glitchColors: ['#0a0a0f', '#1a0033', '#cc0066', '#cc7000', '#00aacc'], // Softened - reduced saturation
    hiddenWordColor: '#33ffaa', // Stronger - brighter green for better visibility
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
    glitchColors: ['#1a1a1a', '#2d2d2d', '#ccaa00', '#999999', '#c4b090'], // Softened - reduced brightness
    hiddenWordColor: '#ff80b3', // Stronger - brighter pink for better visibility
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
    glitchColors: ['#2d0a1a', '#70122c', '#cc1075', '#cc5490', '#cc98a0'], // Softened - reduced saturation
    hiddenWordColor: '#a8e4ff', // Stronger - brighter sky blue for better visibility
    uiColors: {
      primary: '#ff1493',
      secondary: '#ff69b4',
      accent: '#8b1538',
      text: '#ffffff',
      background: 'rgba(45, 10, 26, 0.4)',
    },
  },
  {
    id: 'rainbow',
    name: 'Rainbow Spectrum',
    description: 'Vibrant rainbow colors flowing through the spectrum',
    difficulty: 'average',
    glitchColors: ['#cc3300', '#cc7700', '#ccaa00', '#66cc33', '#3366cc', '#6633cc', '#cc33cc'], // Softened rainbow - Red, Orange, Yellow, Green, Blue, Indigo, Violet (ROYGBIV flow)
    hiddenWordColor: '#ffffff', // Stronger - bright white for maximum visibility against rainbow
    uiColors: {
      primary: '#ff6600',
      secondary: '#00ccff',
      accent: '#ff00ff',
      text: '#ffffff',
      background: 'rgba(51, 26, 77, 0.4)',
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black, white, grey, and silver',
    difficulty: 'average',
    glitchColors: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#c0c0c0'], // Softened monochrome - Black, Dark Grey, Medium Grey, Light Grey, Silver, White-Grey
    hiddenWordColor: '#ffd700', // Stronger - bright gold for excellent visibility against monochrome
    uiColors: {
      primary: '#ffffff',
      secondary: '#c0c0c0',
      accent: '#808080',
      text: '#ffffff',
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ==================== HARD (Low Contrast) ====================
  // Hidden words use colors very close to glitch colors but still visible
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Soft pastel dreamscape',
    difficulty: 'hard',
    glitchColors: ['#2d1b4e', '#cc5aa5', '#01a5cc', '#04cc81', '#9552cc'], // Softened - reduced saturation
    hiddenWordColor: '#ffb3f0', // Stronger - brighter pink for better visibility
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
    glitchColors: ['#1a1a1a', '#2a2a1a', '#cc8c00', '#cc8800', '#cc7a00'], // Softened - reduced brightness
    hiddenWordColor: '#ffdd66', // Stronger - brighter amber for better visibility
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
    glitchColors: ['#0a1929', '#00b85e', '#0096aa', '#633dcc', '#0089aa'], // Softened - reduced brightness
    hiddenWordColor: '#66e0f0', // Stronger - brighter cyan-green for better visibility
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
    glitchColors: ['#000814', '#001730', '#002a52', '#08559a', '#3da0c0'], // Softened - reduced brightness
    hiddenWordColor: '#9de5ff', // Stronger - brighter blue for better visibility
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
    glitchColors: ['#1a0a0a', '#702e2e', '#cc5529', '#cc8400', '#ccaa00'], // Softened - reduced saturation
    hiddenWordColor: '#ffcc66', // Stronger - brighter orange-gold for better visibility
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
    glitchColors: ['#2d2d2d', '#cc9299', '#ccaa00', '#7ac87a', '#6ca8bb'], // Softened - reduced brightness
    hiddenWordColor: '#ffd1d9', // Stronger - brighter pink for better visibility
    uiColors: {
      primary: '#ffb6c1',
      secondary: '#98fb98',
      accent: '#87ceeb',
      text: '#ffffff',
      background: 'rgba(45, 45, 45, 0.35)',
    },
  },
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    description: 'Enchanted pastel dreamscape',
    difficulty: 'hard',
    glitchColors: ['#3d5a3d', '#5599b3', '#70a890', '#b89d50', '#b8696d'], // Softened - very low contrast pastels
    hiddenWordColor: '#d9a5c2', // Stronger - soft rose-pink for better visibility
    uiColors: {
      primary: '#7fb3d3',
      secondary: '#a8d5ba',
      accent: '#ffd93d',
      text: '#ffffff',
      background: 'rgba(61, 90, 61, 0.35)',
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
