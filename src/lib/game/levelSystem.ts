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
  
  saveProgress(
    Math.max(currentLevel, level),
    [...new Set([...unlockedLevels, level])],
    bestScore
  );
}

export function getLevelConfig(level: number): Level {
  return initializeLevel(level);
}

export function canAccessLevel(level: number): boolean {
  const unlocked = getUnlockedLevels();
  return unlocked.includes(level);
}

