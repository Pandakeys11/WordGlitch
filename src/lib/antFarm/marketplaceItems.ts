import { MarketplaceItem, ItemCategory, ItemType } from '@/types/antFarm';

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  // Cosmetic Items
  {
    id: 'bg-sand',
    name: 'Sand Background',
    description: 'Classic sand-colored background for your ant farm',
    category: 'cosmetic',
    type: 'background',
    price: 50,
    icon: '🏜️',
  },
  {
    id: 'bg-dark',
    name: 'Dark Soil Background',
    description: 'Rich dark soil background',
    category: 'cosmetic',
    type: 'background',
    price: 75,
    icon: '🌑',
  },
  {
    id: 'bg-crystal',
    name: 'Crystal Background',
    description: 'Futuristic crystal-themed background',
    category: 'cosmetic',
    type: 'background',
    price: 150,
    icon: '💎',
    unlockLevel: 10,
  },
  {
    id: 'dec-rock',
    name: 'Decorative Rock',
    description: 'A decorative rock for your ant farm',
    category: 'cosmetic',
    type: 'decoration',
    price: 30,
    icon: '🪨',
  },
  {
    id: 'dec-crystal',
    name: 'Crystal Formation',
    description: 'Beautiful crystal formation decoration',
    category: 'cosmetic',
    type: 'decoration',
    price: 100,
    icon: '🔮',
    unlockLevel: 15,
  },
  {
    id: 'theme-nature',
    name: 'Nature Theme',
    description: 'Natural green and brown color theme',
    category: 'cosmetic',
    type: 'theme',
    price: 80,
    icon: '🌿',
  },
  {
    id: 'theme-tech',
    name: 'Tech Theme',
    description: 'Futuristic blue and purple tech theme',
    category: 'cosmetic',
    type: 'theme',
    price: 120,
    icon: '⚡',
    unlockLevel: 20,
  },

  // Functional Items
  {
    id: 'food-basic',
    name: 'Basic Food Dispenser',
    description: 'Provides food for your ants (1 food/sec)',
    category: 'functional',
    type: 'food_dispenser',
    price: 100,
    icon: '🍯',
    effects: {
      foodGeneration: 1,
    },
  },
  {
    id: 'food-advanced',
    name: 'Advanced Food Dispenser',
    description: 'High-capacity food dispenser (3 food/sec)',
    category: 'functional',
    type: 'food_dispenser',
    price: 250,
    icon: '🍽️',
    unlockLevel: 5,
    effects: {
      foodGeneration: 3,
    },
  },
  {
    id: 'food-premium',
    name: 'Premium Food Dispenser',
    description: 'Ultra-efficient food dispenser (5 food/sec)',
    category: 'functional',
    type: 'food_dispenser',
    price: 500,
    icon: '🍖',
    unlockLevel: 15,
    effects: {
      foodGeneration: 5,
    },
  },
  {
    id: 'tunnel-basic',
    name: 'Tunnel Starter',
    description: 'Pre-built tunnel section for faster ant movement',
    category: 'functional',
    type: 'tunnel',
    price: 75,
    icon: '🕳️',
    effects: {
      tunnelSpeed: 1.5,
    },
  },
  {
    id: 'tunnel-advanced',
    name: 'Advanced Tunnel Network',
    description: 'Complex tunnel network (2x tunnel speed)',
    category: 'functional',
    type: 'tunnel',
    price: 200,
    icon: '🕸️',
    unlockLevel: 10,
    effects: {
      tunnelSpeed: 2.0,
    },
  },
  {
    id: 'chamber-nest',
    name: 'Nest Chamber',
    description: 'A comfortable nest chamber for your ants',
    category: 'functional',
    type: 'chamber',
    price: 150,
    icon: '🏠',
    effects: {
      antCapacity: 10,
    },
  },
  {
    id: 'chamber-queen',
    name: 'Queen Chamber',
    description: 'Luxurious chamber for queen ants (20 ant capacity)',
    category: 'functional',
    type: 'chamber',
    price: 400,
    icon: '👑',
    unlockLevel: 25,
    effects: {
      antCapacity: 20,
    },
  },
  {
    id: 'pheromone-basic',
    name: 'Pheromone Marker',
    description: 'Enhances pheromone trail strength by 50%',
    category: 'functional',
    type: 'pheromone_marker',
    price: 120,
    icon: '📍',
    effects: {
      pheromoneStrength: 1.5,
    },
  },
  {
    id: 'pheromone-advanced',
    name: 'Advanced Pheromone Marker',
    description: 'Doubles pheromone trail strength',
    category: 'functional',
    type: 'pheromone_marker',
    price: 300,
    icon: '🎯',
    unlockLevel: 20,
    effects: {
      pheromoneStrength: 2.0,
    },
  },
];

/**
 * Get all marketplace items
 */
export function getAllMarketplaceItems(): MarketplaceItem[] {
  return [...MARKETPLACE_ITEMS];
}

/**
 * Get marketplace items by category
 */
export function getMarketplaceItemsByCategory(category: ItemCategory): MarketplaceItem[] {
  return MARKETPLACE_ITEMS.filter(item => item.category === category);
}

/**
 * Get marketplace item by ID
 */
export function getMarketplaceItem(itemId: string): MarketplaceItem | undefined {
  return MARKETPLACE_ITEMS.find(item => item.id === itemId);
}

/**
 * Get available items for current level
 */
export function getAvailableItems(currentLevel: number): MarketplaceItem[] {
  return MARKETPLACE_ITEMS.filter(
    item => !item.unlockLevel || item.unlockLevel <= currentLevel
  );
}

