import { Ant, AntTier, AntType, AntStats, MysteryBoxResult } from '@/types/antFarm';
import { spendCurrency } from './currency';
import { generateAnt } from './antGenerator';

const MYSTERY_BOX_COST = 100;

// Tier probabilities
const TIER_PROBABILITIES: Record<AntTier, number> = {
  common: 0.70,      // 70%
  uncommon: 0.20,     // 20%
  rare: 0.08,        // 8%
  legendary: 0.02,   // 2%
};

// Ant type distribution by tier
const ANT_TYPES_BY_TIER: Record<AntTier, AntType[]> = {
  common: ['worker', 'worker', 'worker', 'scout'],
  uncommon: ['worker', 'scout', 'nurse'],
  rare: ['soldier', 'scout', 'nurse'],
  legendary: ['queen', 'soldier'],
};

// Color palettes by tier
const COLORS_BY_TIER: Record<AntTier, string[]> = {
  common: ['#8B7355', '#A0826D', '#6B5B47', '#9B8B6F'],
  uncommon: ['#4A90E2', '#5BA3F5', '#3D7BC8', '#6BB3FF'],
  rare: ['#9B59B6', '#A569BD', '#8E44AD', '#BB8FCE'],
  legendary: ['#F39C12', '#E67E22', '#D35400', '#F7DC6F'],
};

// Name pools by tier and type
const NAMES_BY_TIER_TYPE: Record<AntTier, Record<AntType, string[]>> = {
  common: {
    worker: ['Worker', 'Forager', 'Collector', 'Gatherer'],
    scout: ['Scout', 'Explorer', 'Pathfinder'],
    soldier: ['Guard', 'Defender'],
    nurse: ['Nurse', 'Carer'],
    queen: ['Queen'],
  },
  uncommon: {
    worker: ['Elite Worker', 'Master Forager', 'Expert Collector'],
    scout: ['Advanced Scout', 'Elite Explorer', 'Master Pathfinder'],
    soldier: ['Veteran Guard', 'Elite Defender'],
    nurse: ['Senior Nurse', 'Expert Carer'],
    queen: ['Matriarch'],
  },
  rare: {
    worker: ['Royal Worker', 'Noble Forager'],
    scout: ['Royal Scout', 'Noble Explorer'],
    soldier: ['Royal Guard', 'Noble Defender', 'Champion'],
    nurse: ['Royal Nurse', 'Noble Carer'],
    queen: ['High Queen'],
  },
  legendary: {
    worker: ['Legendary Worker'],
    scout: ['Legendary Scout'],
    soldier: ['Legendary Guard', 'Legendary Champion'],
    nurse: ['Legendary Nurse'],
    queen: ['Empress', 'Supreme Queen', 'Ancient Queen'],
  },
};

/**
 * Generate random tier based on probabilities
 */
function generateTier(): AntTier {
  const rand = Math.random();
  let cumulative = 0;

  for (const [tier, probability] of Object.entries(TIER_PROBABILITIES)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return tier as AntTier;
    }
  }

  return 'common'; // Fallback
}

/**
 * Generate ant type based on tier
 */
function generateAntType(tier: AntTier): AntType {
  const types = ANT_TYPES_BY_TIER[tier];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Open a mystery box
 * @returns MysteryBoxResult if successful, null if insufficient funds
 */
export function openMysteryBox(): MysteryBoxResult | null {
  // Check if player has enough currency
  if (!spendCurrency(MYSTERY_BOX_COST, 'Mystery Box')) {
    return null;
  }

  // Generate tier
  const tier = generateTier();
  
  // Generate ant type based on tier
  const antType = generateAntType(tier);
  
  // Generate ant using shared generator
  const ant = generateAnt(tier, antType);

  // Animation duration based on tier (longer for rarer tiers)
  const animationDuration = {
    common: 1000,
    uncommon: 1500,
    rare: 2000,
    legendary: 3000,
  }[tier];

  return {
    ant,
    tier,
    animationDuration,
  };
}

/**
 * Get mystery box cost
 */
export function getMysteryBoxCost(): number {
  return MYSTERY_BOX_COST;
}

/**
 * Get tier probability information
 */
export function getTierProbabilities(): Record<AntTier, number> {
  return { ...TIER_PROBABILITIES };
}

