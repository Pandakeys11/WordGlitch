/**
 * Level Progression System
 * Maps levels to specific color palettes and difficulties
 * Players must complete 3 levels per palette before moving to the next
 */

import { ColorPalette, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
import { Difficulty } from '@/types/game';

export interface LevelPaletteMapping {
    level: number;
    paletteId: string;
    paletteName: string;
    paletteDifficulty: PaletteDifficulty;
    gameDifficulty: Difficulty;
    levelInPalette: number; // 1, 2, or 3
    isFirstInPalette: boolean;
    isLastInPalette: boolean;
}

/**
 * Level progression structure:
 * EASY PALETTES (Levels 1-42):
 * - Levels 1-3: Ocean
 * - Levels 4-6: Fire Storm
 * - Levels 7-9: Forest Green
 * - Levels 10-12: Cosmic Purple
 * - Levels 13-15: The Matrix
 * - Levels 16-18: Christmas
 * - Levels 19-21: Halloween
 * - Levels 22-24: Sakura Blossom
 * - Levels 25-27: Arctic Frost
 * - Levels 28-30: Desert Sands
 * - Levels 31-33: Jungle Canopy
 * - Levels 34-36: Molten Lava
 * - Levels 37-39: Midnight Sky
 * - Levels 40-42: Aquamarine Dream
 * 
 * AVERAGE PALETTES (Levels 43-78):
 * - Levels 43-45: Neon Cyber
 * - Levels 46-48: Cyberpunk 2077
 * - Levels 49-51: Star Wars
 * - Levels 52-54: Synthwave 80s
 * - Levels 55-57: New Year
 * - Levels 58-60: Valentine's Day
 * - Levels 61-63: Rainbow Spectrum
 * - Levels 64-66: Monochrome
 * - Levels 67-69: Retro Arcade
 * - Levels 70-72: Deep Space
 * - Levels 73-75: Autumn Leaves
 * - Levels 76-78: Electric Storm
 * 
 * HARD PALETTES (Levels 79-108):
 * - Levels 79-81: Vaporwave
 * - Levels 82-84: Terminal Amber
 * - Levels 85-87: Aurora Borealis
 * - Levels 88-90: Midnight Cobalt
 * - Levels 91-93: Sunset Horizon
 * - Levels 94-96: Easter
 * - Levels 97-99: Studio Ghibli
 * - Levels 100-102: Crimson Dusk
 * - Levels 103-105: Emerald Forest
 * - Levels 106-108: Silver Moon
 */

// Define the progression order
const LEVEL_PROGRESSION: { paletteId: string; difficulty: Difficulty }[] = [
    // Easy palettes (Levels 1-42) - 14 palettes × 3 levels each
    { paletteId: 'ocean', difficulty: 'easy' },
    { paletteId: 'fire', difficulty: 'easy' },
    { paletteId: 'forest', difficulty: 'easy' },
    { paletteId: 'cosmic', difficulty: 'easy' },
    { paletteId: 'matrix', difficulty: 'easy' },
    { paletteId: 'christmas', difficulty: 'easy' },
    { paletteId: 'halloween', difficulty: 'easy' },
    { paletteId: 'sakura', difficulty: 'easy' },
    { paletteId: 'arctic', difficulty: 'easy' },
    { paletteId: 'desert', difficulty: 'easy' },
    { paletteId: 'jungle', difficulty: 'easy' },
    { paletteId: 'lava', difficulty: 'easy' },
    { paletteId: 'midnightsky', difficulty: 'easy' },
    { paletteId: 'aquamarine', difficulty: 'easy' },

    // Average palettes (Levels 43-78) - 12 palettes × 3 levels each
    { paletteId: 'neon', difficulty: 'medium' },
    { paletteId: 'cyberpunk', difficulty: 'medium' },
    { paletteId: 'starwars', difficulty: 'medium' },
    { paletteId: 'synthwave', difficulty: 'medium' },
    { paletteId: 'newyear', difficulty: 'medium' },
    { paletteId: 'valentine', difficulty: 'medium' },
    { paletteId: 'rainbow', difficulty: 'medium' },
    { paletteId: 'monochrome', difficulty: 'medium' },
    { paletteId: 'retroarcade', difficulty: 'medium' },
    { paletteId: 'deepspace', difficulty: 'medium' },
    { paletteId: 'autumnleaves', difficulty: 'medium' },
    { paletteId: 'electricstorm', difficulty: 'medium' },

    // Hard palettes (Levels 79-108) - 10 palettes × 3 levels each
    { paletteId: 'vaporwave', difficulty: 'hard' },
    { paletteId: 'terminal', difficulty: 'hard' },
    { paletteId: 'aurora', difficulty: 'hard' },
    { paletteId: 'midnight', difficulty: 'hard' },
    { paletteId: 'sunset', difficulty: 'hard' },
    { paletteId: 'easter', difficulty: 'hard' },
    { paletteId: 'ghibli', difficulty: 'hard' },
    { paletteId: 'crimsondusk', difficulty: 'hard' },
    { paletteId: 'emeraldforest', difficulty: 'hard' },
    { paletteId: 'silvermoon', difficulty: 'hard' },
];

// Total number of levels per palette
const LEVELS_PER_PALETTE = 3;

/**
 * Get the palette and difficulty for a specific level
 */
export function getLevelPaletteMapping(level: number): LevelPaletteMapping {
    // Calculate which palette this level belongs to (0-indexed)
    const paletteIndex = Math.floor((level - 1) / LEVELS_PER_PALETTE);

    // Handle levels beyond our defined progression (loop back or use last palette)
    const actualPaletteIndex = Math.min(paletteIndex, LEVEL_PROGRESSION.length - 1);
    const progressionEntry = LEVEL_PROGRESSION[actualPaletteIndex];

    // Find the palette
    const palette = COLOR_PALETTES.find(p => p.id === progressionEntry.paletteId);
    if (!palette) {
        // Fallback to ocean if palette not found
        const fallbackPalette = COLOR_PALETTES.find(p => p.id === 'ocean')!;
        return {
            level,
            paletteId: fallbackPalette.id,
            paletteName: fallbackPalette.name,
            paletteDifficulty: fallbackPalette.difficulty,
            gameDifficulty: 'easy',
            levelInPalette: ((level - 1) % LEVELS_PER_PALETTE) + 1,
            isFirstInPalette: ((level - 1) % LEVELS_PER_PALETTE) === 0,
            isLastInPalette: ((level - 1) % LEVELS_PER_PALETTE) === (LEVELS_PER_PALETTE - 1),
        };
    }

    const levelInPalette = ((level - 1) % LEVELS_PER_PALETTE) + 1;

    return {
        level,
        paletteId: palette.id,
        paletteName: palette.name,
        paletteDifficulty: palette.difficulty,
        gameDifficulty: progressionEntry.difficulty,
        levelInPalette,
        isFirstInPalette: levelInPalette === 1,
        isLastInPalette: levelInPalette === LEVELS_PER_PALETTE,
    };
}

/**
 * Get the palette for a specific level
 */
export function getPaletteForLevel(level: number): ColorPalette {
    const mapping = getLevelPaletteMapping(level);
    return COLOR_PALETTES.find(p => p.id === mapping.paletteId) || COLOR_PALETTES[0];
}

/**
 * Get the game difficulty for a specific level
 */
export function getGameDifficultyForLevel(level: number): Difficulty {
    const mapping = getLevelPaletteMapping(level);
    return mapping.gameDifficulty;
}

/**
 * Check if a palette is unlocked for the player
 * A palette is unlocked if the player has reached or passed its first level
 */
export function isPaletteUnlocked(paletteId: string, currentLevel: number): boolean {
    // Find the first level that uses this palette
    const paletteIndex = LEVEL_PROGRESSION.findIndex(p => p.paletteId === paletteId);
    if (paletteIndex === -1) return false;

    const firstLevelForPalette = (paletteIndex * LEVELS_PER_PALETTE) + 1;
    return currentLevel >= firstLevelForPalette;
}

/**
 * Get all unlocked palettes for a player
 */
export function getUnlockedPalettes(currentLevel: number): ColorPalette[] {
    const unlockedPaletteIds = new Set<string>();

    // Calculate how many palettes should be unlocked based on current level
    const maxPaletteIndex = Math.floor((currentLevel - 1) / LEVELS_PER_PALETTE);

    for (let i = 0; i <= maxPaletteIndex && i < LEVEL_PROGRESSION.length; i++) {
        unlockedPaletteIds.add(LEVEL_PROGRESSION[i].paletteId);
    }

    return COLOR_PALETTES.filter(p => unlockedPaletteIds.has(p.id));
}

/**
 * Get the level range for a specific palette
 */
export function getLevelRangeForPalette(paletteId: string): { start: number; end: number } | null {
    const paletteIndex = LEVEL_PROGRESSION.findIndex(p => p.paletteId === paletteId);
    if (paletteIndex === -1) return null;

    const start = (paletteIndex * LEVELS_PER_PALETTE) + 1;
    const end = start + LEVELS_PER_PALETTE - 1;

    return { start, end };
}

/**
 * Get all palette mappings grouped by difficulty
 */
export function getPalettesByDifficulty(): {
    easy: { palette: ColorPalette; levelRange: { start: number; end: number } }[];
    average: { palette: ColorPalette; levelRange: { start: number; end: number } }[];
    hard: { palette: ColorPalette; levelRange: { start: number; end: number } }[];
} {
    const result = {
        easy: [] as { palette: ColorPalette; levelRange: { start: number; end: number } }[],
        average: [] as { palette: ColorPalette; levelRange: { start: number; end: number } }[],
        hard: [] as { palette: ColorPalette; levelRange: { start: number; end: number } }[],
    };

    LEVEL_PROGRESSION.forEach((entry, index) => {
        const palette = COLOR_PALETTES.find(p => p.id === entry.paletteId);
        if (!palette) return;

        const start = (index * LEVELS_PER_PALETTE) + 1;
        const end = start + LEVELS_PER_PALETTE - 1;

        const item = { palette, levelRange: { start, end } };

        if (palette.difficulty === 'easy') {
            result.easy.push(item);
        } else if (palette.difficulty === 'average') {
            result.average.push(item);
        } else if (palette.difficulty === 'hard') {
            result.hard.push(item);
        }
    });

    return result;
}

/**
 * Get the next level's palette
 */
export function getNextLevelPalette(currentLevel: number): ColorPalette {
    return getPaletteForLevel(currentLevel + 1);
}

/**
 * Check if player has completed a palette (all 3 levels)
 */
export function hasPaletteCompleted(paletteId: string, currentLevel: number): boolean {
    const range = getLevelRangeForPalette(paletteId);
    if (!range) return false;

    return currentLevel > range.end;
}
