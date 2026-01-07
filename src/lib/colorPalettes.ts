/**
 * Color Palette System
 * Enhanced color palettes with optimized contrast and visual effects
 * Organized by difficulty: Easy (high contrast) -> Average (medium contrast) -> Hard (low contrast)
 */

import { findOptimalHiddenWordColor, getContrastAgainstGlitchColors } from './colorUtils';

export type PaletteDifficulty = 'easy' | 'average' | 'hard';

/**
 * Visual effects for hidden words
 */
export interface HiddenWordEffects {
  /** Enable outline around hidden words */
  outline: boolean;
  /** Outline color (if outline enabled) */
  outlineColor?: string;
  /** Outline width in pixels */
  outlineWidth?: number;
  /** Enable glow effect */
  glow: boolean;
  /** Glow color */
  glowColor?: string;
  /** Glow blur radius */
  glowBlur?: number;
  /** Enable pulsing animation */
  pulse: boolean;
  /** Pulse speed (ms per cycle) */
  pulseSpeed?: number;
  /** Text shadow for depth */
  textShadow?: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  difficulty: PaletteDifficulty; // Difficulty level of the palette
  glitchColors: string[]; // Colors for letter glitch animation
  hiddenWordColor: string; // Color for hidden words (optimized for contrast)
  /** Visual effects for hidden words to enhance visibility */
  hiddenWordEffects?: HiddenWordEffects;
  uiColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  /** Optimal text size multiplier for this palette (0.5 - 1.0) */
  textSizeMultiplier?: number;
  /** Contrast ratio achieved (for quality assurance) */
  contrastRatio?: number;
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

/**
 * Get text size multiplier based on difficulty
 * Easy: 100% (1.0), Average: 85% (0.85), Hard: 70% (0.70)
 */
export function getTextSizeMultiplier(difficulty: PaletteDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 1.0;
    case 'average':
      return 0.85;
    case 'hard':
      return 0.70;
    default:
      return 1.0;
  }
}

/**
 * Create hidden word effects based on difficulty
 */
function createHiddenWordEffects(
  difficulty: PaletteDifficulty,
  hiddenWordColor: string
): HiddenWordEffects {
  switch (difficulty) {
    case 'easy':
      return {
        outline: true,
        outlineColor: '#000000',
        outlineWidth: 2,
        glow: true,
        glowColor: hiddenWordColor,
        glowBlur: 8,
        pulse: false,
        textShadow: `0 0 10px ${hiddenWordColor}, 0 0 20px ${hiddenWordColor}40`,
      };
    case 'average':
      return {
        outline: true,
        outlineColor: '#000000',
        outlineWidth: 1.5,
        glow: true,
        glowColor: hiddenWordColor,
        glowBlur: 6,
        pulse: false,
        textShadow: `0 0 8px ${hiddenWordColor}60`,
      };
    case 'hard':
      return {
        outline: true,
        outlineColor: '#ffffff',
        outlineWidth: 1,
        glow: true,
        glowColor: hiddenWordColor,
        glowBlur: 4,
        pulse: true,
        pulseSpeed: 2000,
        textShadow: `0 0 6px ${hiddenWordColor}80`,
      };
    default:
      return {
        outline: false,
        glow: false,
        pulse: false,
      };
  }
}

export const COLOR_PALETTES: ColorPalette[] = [
  // ==================== EASY (High Contrast) ====================
  // Hidden words use complementary colors that stand out clearly with strong visual effects
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Cool teal and blue tones',
    difficulty: 'easy',
    glitchColors: ['#2b4539', '#4ba080', '#4d8fb0'],
    hiddenWordColor: '#ffaa5c', // Optimized coral-orange - high contrast against cool tones
    hiddenWordEffects: createHiddenWordEffects('easy', '#ffaa5c'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ffaa5c', ['#2b4539', '#4ba080', '#4d8fb0']),
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
    glitchColors: ['#330000', '#cc3300', '#cc6600', '#cc8800'],
    hiddenWordColor: '#00f0ff', // Bright cyan - perfect complement to warm fire colors
    hiddenWordEffects: createHiddenWordEffects('easy', '#00f0ff'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#00f0ff', ['#330000', '#cc3300', '#cc6600', '#cc8800']),
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
    glitchColors: ['#0a2e0a', '#244010', '#3c6218', '#55862e'],
    hiddenWordColor: '#ff80b3', // Vibrant pink - excellent contrast against greens
    hiddenWordEffects: createHiddenWordEffects('easy', '#ff80b3'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ff80b3', ['#0a2e0a', '#244010', '#3c6218', '#55862e']),
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
    glitchColors: ['#1a0a2e', '#3a1070', '#622399', '#7d3eb0'],
    hiddenWordColor: '#ffed3a', // Golden yellow - complementary to purple
    hiddenWordEffects: createHiddenWordEffects('easy', '#ffed3a'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ffed3a', ['#1a0a2e', '#3a1070', '#622399', '#7d3eb0']),
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
    glitchColors: ['#0d1b0a', '#003b00', '#00cc33', '#00a028', '#2dcc10'],
    hiddenWordColor: '#ff3366', // Bright red - classic Matrix contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#ff3366'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ff3366', ['#0d1b0a', '#003b00', '#00cc33', '#00a028', '#2dcc10']),
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
    glitchColors: ['#0d2818', '#1a4d2e', '#1a701a', '#b01030', '#cc0000', '#cccccc'],
    hiddenWordColor: '#ffed4a', // Gold - festive and high contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#ffed4a'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ffed4a', ['#0d2818', '#1a4d2e', '#1a701a', '#b01030', '#cc0000', '#cccccc']),
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
    glitchColors: ['#000000', '#1a0a1a', '#cc5200', '#cc6d00', '#7000cc'],
    hiddenWordColor: '#33ff66', // Bright green - spooky contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#33ff66'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#33ff66', ['#000000', '#1a0a1a', '#cc5200', '#cc6d00', '#7000cc']),
    uiColors: {
      primary: '#ff6600',
      secondary: '#ff8800',
      accent: '#8b00ff',
      text: '#ffffff',
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'sakura',
    name: 'Sakura Blossom',
    description: 'Soft pink cherry blossoms',
    difficulty: 'easy',
    glitchColors: ['#2d1a1a', '#cc5580', '#cc7799', '#cc99aa', '#ccaabb'],
    hiddenWordColor: '#00ffcc', // Bright cyan - excellent contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#00ffcc'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#00ffcc', ['#2d1a1a', '#cc5580', '#cc7799', '#cc99aa', '#ccaabb']),
    uiColors: {
      primary: '#ff69b4',
      secondary: '#ffb6c1',
      accent: '#ff1493',
      text: '#ffffff',
      background: 'rgba(45, 26, 26, 0.3)',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Frost',
    description: 'Icy blue and white tones',
    difficulty: 'easy',
    glitchColors: ['#0a1a2e', '#1a3a5c', '#4d7aa0', '#80b3cc', '#b3d9e6'],
    hiddenWordColor: '#ffaa00', // Warm orange - contrasts with cold blues
    hiddenWordEffects: createHiddenWordEffects('easy', '#ffaa00'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ffaa00', ['#0a1a2e', '#1a3a5c', '#4d7aa0', '#80b3cc', '#b3d9e6']),
    uiColors: {
      primary: '#5dade2',
      secondary: '#85c1e9',
      accent: '#2874a6',
      text: '#ffffff',
      background: 'rgba(10, 26, 46, 0.3)',
    },
  },
  {
    id: 'desert',
    name: 'Desert Sands',
    description: 'Warm sandy and terracotta',
    difficulty: 'easy',
    glitchColors: ['#2d1a0a', '#8b6914', '#cc9933', '#ccaa66', '#d4af37'],
    hiddenWordColor: '#00ccff', // Bright blue - oasis contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#00ccff'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#00ccff', ['#2d1a0a', '#8b6914', '#cc9933', '#ccaa66', '#d4af37']),
    uiColors: {
      primary: '#daa520',
      secondary: '#f4a460',
      accent: '#cd853f',
      text: '#ffffff',
      background: 'rgba(45, 26, 10, 0.3)',
    },
  },
  {
    id: 'jungle',
    name: 'Jungle Canopy',
    description: 'Deep tropical greens',
    difficulty: 'easy',
    glitchColors: ['#0a1a0a', '#1a3d1a', '#2d5c2d', '#4d8c4d', '#6ba86b'],
    hiddenWordColor: '#ff3399', // Hot pink - tropical flower contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#ff3399'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ff3399', ['#0a1a0a', '#1a3d1a', '#2d5c2d', '#4d8c4d', '#6ba86b']),
    uiColors: {
      primary: '#228b22',
      secondary: '#32cd32',
      accent: '#006400',
      text: '#ffffff',
      background: 'rgba(10, 26, 10, 0.3)',
    },
  },
  {
    id: 'lava',
    name: 'Molten Lava',
    description: 'Intense red and orange magma',
    difficulty: 'easy',
    glitchColors: ['#1a0000', '#660000', '#cc1100', '#ff4400', '#ff6600'],
    hiddenWordColor: '#00ffff', // Cyan - water vs fire
    hiddenWordEffects: createHiddenWordEffects('easy', '#00ffff'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#00ffff', ['#1a0000', '#660000', '#cc1100', '#ff4400', '#ff6600']),
    uiColors: {
      primary: '#ff4500',
      secondary: '#ff6347',
      accent: '#dc143c',
      text: '#ffffff',
      background: 'rgba(26, 0, 0, 0.3)',
    },
  },
  {
    id: 'midnightsky',
    name: 'Midnight Sky',
    description: 'Deep night with stars',
    difficulty: 'easy',
    glitchColors: ['#000033', '#1a1a4d', '#333366', '#4d4d99', '#6666cc'],
    hiddenWordColor: '#ffff00', // Bright yellow - star contrast
    hiddenWordEffects: createHiddenWordEffects('easy', '#ffff00'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ffff00', ['#000033', '#1a1a4d', '#333366', '#4d4d99', '#6666cc']),
    uiColors: {
      primary: '#4169e1',
      secondary: '#6495ed',
      accent: '#191970',
      text: '#ffffff',
      background: 'rgba(0, 0, 51, 0.3)',
    },
  },
  {
    id: 'aquamarine',
    name: 'Aquamarine Dream',
    description: 'Turquoise and sea green',
    difficulty: 'easy',
    glitchColors: ['#0a2d2d', '#1a5c5c', '#2d8c8c', '#40b3b3', '#66cccc'],
    hiddenWordColor: '#ff6600', // Orange - complementary to teal
    hiddenWordEffects: createHiddenWordEffects('easy', '#ff6600'),
    textSizeMultiplier: 1.0,
    contrastRatio: getContrastAgainstGlitchColors('#ff6600', ['#0a2d2d', '#1a5c5c', '#2d8c8c', '#40b3b3', '#66cccc']),
    uiColors: {
      primary: '#48d1cc',
      secondary: '#7fffd4',
      accent: '#20b2aa',
      text: '#ffffff',
      background: 'rgba(10, 45, 45, 0.3)',
    },
  },

  // ==================== AVERAGE (Medium Contrast) ====================
  // Hidden words use related colors that blend more but are still distinguishable
  {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Vibrant neon pink and purple',
    difficulty: 'average',
    glitchColors: ['#1a0033', '#cc00cc', '#00cccc', '#cc0088'],
    hiddenWordColor: '#ffcc33', // Orange-yellow - good contrast in neon palette
    hiddenWordEffects: createHiddenWordEffects('average', '#ffcc33'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffcc33', ['#1a0033', '#cc00cc', '#00cccc', '#cc0088']),
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
    glitchColors: ['#1a0033', '#cc0066', '#00c4cc', '#ccaa00', '#7000cc'],
    hiddenWordColor: '#33ffcc', // Cyan-green - cyberpunk aesthetic
    hiddenWordEffects: createHiddenWordEffects('average', '#33ffcc'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#33ffcc', ['#1a0033', '#cc0066', '#00c4cc', '#ccaa00', '#7000cc']),
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
    glitchColors: ['#000428', '#003e75', '#3f9cc6', '#2092c6', '#66a8c8'],
    hiddenWordColor: '#ffcc33', // Amber-orange - contrasts with blue
    hiddenWordEffects: createHiddenWordEffects('average', '#ffcc33'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffcc33', ['#000428', '#003e75', '#3f9cc6', '#2092c6', '#66a8c8']),
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
    glitchColors: ['#0a0a0f', '#1a0033', '#cc0066', '#cc7000', '#00aacc'],
    hiddenWordColor: '#33ffaa', // Bright green - retro synthwave
    hiddenWordEffects: createHiddenWordEffects('average', '#33ffaa'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#33ffaa', ['#0a0a0f', '#1a0033', '#cc0066', '#cc7000', '#00aacc']),
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
    glitchColors: ['#1a1a1a', '#2d2d2d', '#ccaa00', '#999999', '#c4b090'],
    hiddenWordColor: '#ff80b3', // Pink - festive contrast
    hiddenWordEffects: createHiddenWordEffects('average', '#ff80b3'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ff80b3', ['#1a1a1a', '#2d2d2d', '#ccaa00', '#999999', '#c4b090']),
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
    glitchColors: ['#2d0a1a', '#70122c', '#cc1075', '#cc5490', '#cc98a0'],
    hiddenWordColor: '#a8e4ff', // Sky blue - romantic contrast
    hiddenWordEffects: createHiddenWordEffects('average', '#a8e4ff'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#a8e4ff', ['#2d0a1a', '#70122c', '#cc1075', '#cc5490', '#cc98a0']),
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
    glitchColors: ['#cc3300', '#cc7700', '#ccaa00', '#66cc33', '#3366cc', '#6633cc', '#cc33cc'],
    hiddenWordColor: '#ffffff', // White - maximum visibility against rainbow
    hiddenWordEffects: createHiddenWordEffects('average', '#ffffff'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffffff', ['#cc3300', '#cc7700', '#ccaa00', '#66cc33', '#3366cc', '#6633cc', '#cc33cc']),
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
    glitchColors: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#c0c0c0'],
    hiddenWordColor: '#ffd700', // Gold - excellent visibility against monochrome
    hiddenWordEffects: createHiddenWordEffects('average', '#ffd700'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffd700', ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#c0c0c0']),
    uiColors: {
      primary: '#ffffff',
      secondary: '#c0c0c0',
      accent: '#808080',
      text: '#ffffff',
      background: 'rgba(0, 0, 0, 0.5)',
    },
  },
  {
    id: 'retroarcade',
    name: 'Retro Arcade',
    description: 'Classic arcade cabinet colors',
    difficulty: 'average',
    glitchColors: ['#1a0a2e', '#cc3300', '#0066cc', '#ffcc00', '#00cc66'],
    hiddenWordColor: '#ff66ff', // Bright magenta - arcade aesthetic
    hiddenWordEffects: createHiddenWordEffects('average', '#ff66ff'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ff66ff', ['#1a0a2e', '#cc3300', '#0066cc', '#ffcc00', '#00cc66']),
    uiColors: {
      primary: '#ff3366',
      secondary: '#33ccff',
      accent: '#ffcc00',
      text: '#ffffff',
      background: 'rgba(26, 10, 46, 0.4)',
    },
  },
  {
    id: 'deepspace',
    name: 'Deep Space',
    description: 'Cosmic nebula and stars',
    difficulty: 'average',
    glitchColors: ['#0a0a1a', '#1a1a4d', '#4d1a66', '#1a4d66', '#4d4d99'],
    hiddenWordColor: '#ffaa33', // Warm orange - star glow
    hiddenWordEffects: createHiddenWordEffects('average', '#ffaa33'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffaa33', ['#0a0a1a', '#1a1a4d', '#4d1a66', '#1a4d66', '#4d4d99']),
    uiColors: {
      primary: '#6666ff',
      secondary: '#9966ff',
      accent: '#ff6699',
      text: '#ffffff',
      background: 'rgba(10, 10, 26, 0.4)',
    },
  },
  {
    id: 'autumnleaves',
    name: 'Autumn Leaves',
    description: 'Fall foliage colors',
    difficulty: 'average',
    glitchColors: ['#2d1a0a', '#8b4513', '#cc6600', '#cc8800', '#996633'],
    hiddenWordColor: '#33ccff', // Bright cyan - sky contrast
    hiddenWordEffects: createHiddenWordEffects('average', '#33ccff'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#33ccff', ['#2d1a0a', '#8b4513', '#cc6600', '#cc8800', '#996633']),
    uiColors: {
      primary: '#ff8c00',
      secondary: '#daa520',
      accent: '#8b4513',
      text: '#ffffff',
      background: 'rgba(45, 26, 10, 0.4)',
    },
  },
  {
    id: 'electricstorm',
    name: 'Electric Storm',
    description: 'Lightning and thunder',
    difficulty: 'average',
    glitchColors: ['#0a0a1a', '#1a1a33', '#333366', '#4d4d99', '#6666cc'],
    hiddenWordColor: '#ffff00', // Bright yellow - lightning
    hiddenWordEffects: createHiddenWordEffects('average', '#ffff00'),
    textSizeMultiplier: 0.85,
    contrastRatio: getContrastAgainstGlitchColors('#ffff00', ['#0a0a1a', '#1a1a33', '#333366', '#4d4d99', '#6666cc']),
    uiColors: {
      primary: '#9999ff',
      secondary: '#ccccff',
      accent: '#ffff66',
      text: '#ffffff',
      background: 'rgba(10, 10, 26, 0.4)',
    },
  },

  // ==================== HARD (Low Contrast) ====================
  // Hidden words use colors very close to glitch colors but still visible with subtle effects
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Soft pastel dreamscape',
    difficulty: 'hard',
    glitchColors: ['#2d1b4e', '#cc5aa5', '#01a5cc', '#04cc81', '#9552cc'],
    hiddenWordColor: '#ffb3f0', // Soft pink - subtle contrast in pastel palette
    hiddenWordEffects: createHiddenWordEffects('hard', '#ffb3f0'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#ffb3f0', ['#2d1b4e', '#cc5aa5', '#01a5cc', '#04cc81', '#9552cc']),
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
    glitchColors: ['#1a1a1a', '#2a2a1a', '#cc8c00', '#cc8800', '#cc7a00'],
    hiddenWordColor: '#ffdd66', // Bright amber - terminal aesthetic
    hiddenWordEffects: createHiddenWordEffects('hard', '#ffdd66'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#ffdd66', ['#1a1a1a', '#2a2a1a', '#cc8c00', '#cc8800', '#cc7a00']),
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
    glitchColors: ['#0a1929', '#00b85e', '#0096aa', '#633dcc', '#0089aa'],
    hiddenWordColor: '#66e0f0', // Cyan-green - aurora colors
    hiddenWordEffects: createHiddenWordEffects('hard', '#66e0f0'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#66e0f0', ['#0a1929', '#00b85e', '#0096aa', '#633dcc', '#0089aa']),
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
    glitchColors: ['#000814', '#001730', '#002a52', '#08559a', '#3da0c0'],
    hiddenWordColor: '#9de5ff', // Light blue - subtle in blue palette
    hiddenWordEffects: createHiddenWordEffects('hard', '#9de5ff'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#9de5ff', ['#000814', '#001730', '#002a52', '#08559a', '#3da0c0']),
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
    glitchColors: ['#1a0a0a', '#702e2e', '#cc5529', '#cc8400', '#ccaa00'],
    hiddenWordColor: '#ffcc66', // Orange-gold - subtle in warm palette
    hiddenWordEffects: createHiddenWordEffects('hard', '#ffcc66'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#ffcc66', ['#1a0a0a', '#702e2e', '#cc5529', '#cc8400', '#ccaa00']),
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
    glitchColors: ['#2d2d2d', '#cc9299', '#ccaa00', '#7ac87a', '#6ca8bb'],
    hiddenWordColor: '#ffd1d9', // Soft pink - pastel palette
    hiddenWordEffects: createHiddenWordEffects('hard', '#ffd1d9'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#ffd1d9', ['#2d2d2d', '#cc9299', '#ccaa00', '#7ac87a', '#6ca8bb']),
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
    glitchColors: ['#3d5a3d', '#5599b3', '#70a890', '#b89d50', '#b8696d'],
    hiddenWordColor: '#d9a5c2', // Soft rose-pink - Ghibli aesthetic
    hiddenWordEffects: createHiddenWordEffects('hard', '#d9a5c2'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#d9a5c2', ['#3d5a3d', '#5599b3', '#70a890', '#b89d50', '#b8696d']),
    uiColors: {
      primary: '#7fb3d3',
      secondary: '#a8d5ba',
      accent: '#ffd93d',
      text: '#ffffff',
      background: 'rgba(61, 90, 61, 0.35)',
    },
  },
  {
    id: 'crimsondusk',
    name: 'Crimson Dusk',
    description: 'Deep red twilight',
    difficulty: 'hard',
    glitchColors: ['#2d0a0a', '#4d1a1a', '#661a1a', '#802020', '#993333'],
    hiddenWordColor: '#cc6666', // Subtle lighter red
    hiddenWordEffects: createHiddenWordEffects('hard', '#cc6666'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#cc6666', ['#2d0a0a', '#4d1a1a', '#661a1a', '#802020', '#993333']),
    uiColors: {
      primary: '#cc5555',
      secondary: '#aa4444',
      accent: '#ff6666',
      text: '#ffffff',
      background: 'rgba(45, 10, 10, 0.35)',
    },
  },
  {
    id: 'emeraldforest',
    name: 'Emerald Forest',
    description: 'Deep forest shadows',
    difficulty: 'hard',
    glitchColors: ['#0a2d0a', '#1a4d1a', '#2d662d', '#408040', '#4d994d'],
    hiddenWordColor: '#66cc66', // Subtle lighter green
    hiddenWordEffects: createHiddenWordEffects('hard', '#66cc66'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#66cc66', ['#0a2d0a', '#1a4d1a', '#2d662d', '#408040', '#4d994d']),
    uiColors: {
      primary: '#55aa55',
      secondary: '#66bb66',
      accent: '#77cc77',
      text: '#ffffff',
      background: 'rgba(10, 45, 10, 0.35)',
    },
  },
  {
    id: 'silvermoon',
    name: 'Silver Moon',
    description: 'Moonlit silver and blue',
    difficulty: 'hard',
    glitchColors: ['#1a1a2d', '#2d2d4d', '#404066', '#4d4d80', '#666699'],
    hiddenWordColor: '#9999cc', // Subtle lighter blue-silver
    hiddenWordEffects: createHiddenWordEffects('hard', '#9999cc'),
    textSizeMultiplier: 0.70,
    contrastRatio: getContrastAgainstGlitchColors('#9999cc', ['#1a1a2d', '#2d2d4d', '#404066', '#4d4d80', '#666699']),
    uiColors: {
      primary: '#8888bb',
      secondary: '#9999cc',
      accent: '#aaaadd',
      text: '#ffffff',
      background: 'rgba(26, 26, 45, 0.35)',
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
