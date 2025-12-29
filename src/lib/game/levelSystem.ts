import { Level } from '@/types/game';
import { initializeLevel } from './difficulty';
import { loadProgress, saveProgress } from '@/lib/storage/gameStorage';

export function getCurrentLevel(): number {
  const progress = loadProgress();
  return progress?.currentLevel || 1;
}

export function getUnlockedLevels(): number[] {
  const progress = loadProgress();
  return progress?.unlockedLevels || [1];
}

export function unlockLevel(level: number, bestScore: number): void {
  const progress = loadProgress();
  const currentLevel = progress?.currentLevel || 1;
  const unlockedLevels = progress?.unlockedLevels || [1];
  
  // Save the new level (use the higher of current or new level)
  // This ensures progress is always saved when unlocking a new level
  const newCurrentLevel = Math.max(currentLevel, level);
  saveProgress(
    newCurrentLevel,
    [...new Set([...unlockedLevels, level])],
    bestScore
  );
}

// Save current level without unlocking new levels
export function saveCurrentLevel(level: number): void {
  const progress = loadProgress();
  const unlockedLevels = progress?.unlockedLevels || [1];
  const bestScore = progress?.bestScores?.[level] || 0;
  
  // Ensure we save the level - create progress if it doesn't exist
  if (!progress) {
    // If no progress exists, initialize with current level
    saveProgress(level, [level], 0);
  } else {
    saveProgress(level, unlockedLevels, bestScore);
  }
  
  // Log for debugging
  console.log('Saving current level:', level);
}

export function getLevelConfig(level: number): Level {
  return initializeLevel(level);
}

export function canAccessLevel(level: number): boolean {
  const unlocked = getUnlockedLevels();
  return unlocked.includes(level);
}

