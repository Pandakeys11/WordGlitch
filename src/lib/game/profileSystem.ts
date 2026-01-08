
/**
 * Profile Level System
 * Calculates player level based on total accumulated score (XP).
 * 
 * Formula: Level = Math.floor(Math.sqrt(TotalScore / 500)) + 1
 * - Level 1: 0 - 499 XP
 * - Level 2: 500 - 1999 XP
 * - Level 3: 2000 - 4499 XP
 * - Level 10: ~45,000 XP
 * - Level 50: ~1.2M XP
 */

export const LEVEL_CONSTANT = 500;

export function calculateProfileLevel(totalScore: number): number {
    if (totalScore < 0) return 1;
    return Math.floor(Math.sqrt(totalScore / LEVEL_CONSTANT)) + 1;
}

export function getScoreForLevel(level: number): number {
    if (level <= 1) return 0;
    return LEVEL_CONSTANT * Math.pow(level - 1, 2);
}

export function getProfileLevelProgress(totalScore: number): {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    percent: number;
} {
    const level = calculateProfileLevel(totalScore);
    const currentLevelBaseXP = getScoreForLevel(level);
    const nextLevelXP = getScoreForLevel(level + 1);

    const xpInCurrentLevel = totalScore - currentLevelBaseXP;
    const xpNeededForLevel = nextLevelXP - currentLevelBaseXP;

    const percent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));

    return {
        level,
        currentXP: totalScore,
        nextLevelXP,
        percent
    };
}
