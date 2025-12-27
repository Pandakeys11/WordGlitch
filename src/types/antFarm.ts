export type AntTier = 'common' | 'uncommon' | 'rare' | 'legendary';
export type AntType = 'worker' | 'soldier' | 'queen' | 'scout' | 'nurse';
export type AntBehavior = 'idle' | 'foraging' | 'tunneling' | 'following_trail' | 'returning' | 'feeding' | 'building';
export type ItemCategory = 'cosmetic' | 'functional';
export type ItemType = 'decoration' | 'background' | 'theme' | 'food_dispenser' | 'tunnel' | 'chamber' | 'pheromone_marker';

export interface AntStats {
  speed: number;        // Movement speed multiplier
  stamina: number;      // Energy capacity
  strength: number;     // Tunneling/construction ability
  intelligence: number; // Pathfinding and decision making
}

export interface Ant {
  id: string;
  type: AntType;
  tier: AntTier;
  name: string;
  color: string;
  behavior: AntBehavior;
  stats: AntStats;
  acquiredAt: number;
  x: number;            // Current position
  y: number;
  energy: number;       // Current energy (0-100)
  hunger: number;       // Current hunger (0-100)
  targetX?: number;      // Target position for movement
  targetY?: number;
  trailId?: string;     // Following a pheromone trail
}

export interface FarmItem {
  id: string;
  itemId: string;       // Reference to marketplace item definition
  x: number;
  y: number;
  rotation?: number;
  placedAt: number;
}

export interface FarmLayout {
  width: number;
  height: number;
  background: string;   // Background theme ID
  tunnels: Tunnel[];    // Generated tunnels
  chambers: Chamber[];  // Generated chambers
}

export interface Tunnel {
  id: string;
  points: { x: number; y: number }[];
  width: number;
  createdBy?: string;   // Ant ID that created it
}

export interface Chamber {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'nest' | 'storage' | 'queen';
  createdBy?: string;
}

export interface AntFarm {
  ants: Ant[];
  items: FarmItem[];
  layout: FarmLayout;
  currency: number;
  totalEarned: number;
  lastUpdated: number;
}

export type FoodType = 'water' | 'sugar' | 'boost' | 'food';

export interface FoodSource {
  id: string;
  type: FoodType;
  x: number;
  y: number;
  amount: number;
  maxAmount: number;
  placedAt: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  price: number;
  icon: string;
  preview?: string;
  effects?: ItemEffects;
  unlockLevel?: number; // Level required to unlock
}

export interface ItemEffects {
  foodGeneration?: number;    // Food per second
  antCapacity?: number;        // Max ants supported
  tunnelSpeed?: number;        // Tunnel creation speed multiplier
  pheromoneStrength?: number; // Pheromone trail strength
}

export interface MysteryBoxResult {
  ant: Ant;
  tier: AntTier;
  animationDuration: number;
}

export interface AntCollectionStats {
  totalAnts: number;
  byTier: Record<AntTier, number>;
  byType: Record<AntType, number>;
  oldestAnt?: Ant;
  newestAnt?: Ant;
}

