import { loadProfile } from '@/lib/storage/gameStorage';
import { Ant } from '@/types/antFarm';
import { generateAnt } from './antGenerator';

/**
 * Calculate the target number of ants based on player's progress
 * Formula: base (2) + (bestScore / 1000) + (currentLevel * 0.5)
 */
export function calculateTargetAntCount(): number {
  const profile = loadProfile();
  if (!profile) {
    return 2; // Default starting ants
  }

  const baseAnts = 2;
  const scoreBonus = Math.floor(profile.bestScore / 1000); // 1 ant per 1000 points
  const levelBonus = Math.floor(profile.currentLevel * 0.5); // 0.5 ants per level
  
  const targetCount = baseAnts + scoreBonus + levelBonus;
  
  // Cap at reasonable maximum (100 ants)
  return Math.min(100, Math.max(2, targetCount));
}

/**
 * Generate new ants to reach target population
 */
export function generateNewAnts(currentAnts: Ant[], targetCount: number): Ant[] {
  const currentCount = currentAnts.length;
  
  if (currentCount >= targetCount) {
    return currentAnts; // Already at or above target
  }

  const antsToAdd = targetCount - currentCount;
  const newAnts: Ant[] = [...currentAnts];

  // Generate new ants (mostly common, some higher tier based on level)
  const profile = loadProfile();
  const level = profile?.currentLevel || 1;
  
  for (let i = 0; i < antsToAdd; i++) {
    // Higher levels get better tier chances
    let tier: 'common' | 'uncommon' | 'rare' | 'legendary' = 'common';
    const rand = Math.random();
    
    if (level >= 20 && rand < 0.05) {
      tier = 'legendary';
    } else if (level >= 10 && rand < 0.15) {
      tier = 'rare';
    } else if (level >= 5 && rand < 0.30) {
      tier = 'uncommon';
    }
    
    const newAnt = generateAnt(tier);
    // Position will be set by ant engine
    newAnt.x = 0;
    newAnt.y = 0;
    newAnts.push(newAnt);
  }

  return newAnts;
}

/**
 * Check and update ant population based on player progress
 */
export function updateAntPopulation(currentAnts: Ant[]): Ant[] {
  const targetCount = calculateTargetAntCount();
  return generateNewAnts(currentAnts, targetCount);
}

