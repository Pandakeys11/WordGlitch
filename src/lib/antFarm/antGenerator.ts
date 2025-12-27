import { Ant, AntTier, AntType, AntStats } from '@/types/antFarm';

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
 * Generate stats based on tier
 */
function generateStats(tier: AntTier): AntStats {
  const baseStats = {
    common: { speed: 1.0, stamina: 1.0, strength: 1.0, intelligence: 1.0 },
    uncommon: { speed: 1.2, stamina: 1.1, strength: 1.1, intelligence: 1.2 },
    rare: { speed: 1.5, stamina: 1.3, strength: 1.4, intelligence: 1.5 },
    legendary: { speed: 2.0, stamina: 1.8, strength: 2.0, intelligence: 2.0 },
  };

  const base = baseStats[tier];
  const variance = 0.1; // 10% variance

  return {
    speed: base.speed + (Math.random() - 0.5) * variance * 2,
    stamina: base.stamina + (Math.random() - 0.5) * variance * 2,
    strength: base.strength + (Math.random() - 0.5) * variance * 2,
    intelligence: base.intelligence + (Math.random() - 0.5) * variance * 2,
  };
}

/**
 * Generate ant name
 */
function generateName(tier: AntTier, type: AntType): string {
  const names = NAMES_BY_TIER_TYPE[tier][type] || NAMES_BY_TIER_TYPE.common[type] || ['Ant'];
  return names[Math.floor(Math.random() * names.length)];
}

/**
 * Generate ant color
 */
function generateColor(tier: AntTier): string {
  const colors = COLORS_BY_TIER[tier];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generate a new ant with specified tier and type
 */
export function generateAnt(
  tier: AntTier = 'common',
  type: AntType = 'worker',
  x?: number,
  y?: number
): Ant {
  const name = generateName(tier, type);
  const color = generateColor(tier);
  const stats = generateStats(tier);

  return {
    id: `ant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    tier,
    name,
    color,
    behavior: 'idle',
    stats,
    acquiredAt: Date.now(),
    x: x ?? 0,
    y: y ?? 0,
    energy: 100,
    hunger: 50,
  };
}

/**
 * Generate starting ants for new farm
 */
export function generateStartingAnts(farmWidth: number, farmHeight: number): Ant[] {
  const centerX = farmWidth / 2;
  const centerY = farmHeight / 2;
  
  return [
    generateAnt('common', 'worker', centerX - 30, centerY),
    generateAnt('common', 'worker', centerX + 30, centerY),
  ];
}

