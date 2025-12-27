import { Ant, AntFarm, Tunnel, Chamber, AntBehavior, AntStats, FoodType, FoodSource } from '@/types/antFarm';
import { getMarketplaceItem } from '@/lib/antFarm/marketplaceItems';

export class AntEngine {
  private ants: Ant[];
  private tunnels: Tunnel[];
  private chambers: Chamber[];
  private width: number;
  private height: number;
  private pheromoneMap: Map<string, number>; // Key: "x,y", Value: strength
  private foodSources: FoodSource[];
  private lastUpdate: number;

  constructor(farm: AntFarm) {
    this.ants = farm.ants.map(ant => ({ ...ant })); // Deep copy
    this.tunnels = [...farm.layout.tunnels];
    this.chambers = [...farm.layout.chambers];
    this.width = farm.layout.width || 800;
    this.height = farm.layout.height || 600;
    this.pheromoneMap = new Map();
    this.foodSources = [];
    this.lastUpdate = Date.now();

    // Initialize food sources from items
    farm.items.forEach(item => {
      if (item.itemId.includes('food') || item.itemId.includes('water') || 
          item.itemId.includes('sugar') || item.itemId.includes('boost')) {
        const itemDef = getMarketplaceItem(item.itemId);
        const foodAmount = itemDef?.effects?.foodGeneration ? itemDef.effects.foodGeneration * 100 : 100;
        let foodType: FoodType = 'food';
        if (item.itemId.includes('water')) foodType = 'water';
        else if (item.itemId.includes('sugar')) foodType = 'sugar';
        else if (item.itemId.includes('boost')) foodType = 'boost';
        
        this.foodSources.push({
          id: `food-${item.id}`,
          type: foodType,
          x: item.x,
          y: item.y,
          amount: foodAmount,
          maxAmount: foodAmount,
          placedAt: item.placedAt || Date.now(),
        });
      }
    });
  }

  /**
   * Update all ants and simulation state
   */
  update(): Ant[] {
    const now = Date.now();
    const deltaTime = Math.min((now - this.lastUpdate) / 1000, 0.1); // Cap at 100ms
    this.lastUpdate = now;

    // Decay pheromones
    this.decayPheromones(deltaTime);

    // Update each ant
    this.ants.forEach(ant => {
      this.updateAnt(ant, deltaTime);
    });

    // Generate new tunnels/chambers based on ant behavior
    this.updateColonyStructure();

    return [...this.ants];
  }

  private updateAnt(ant: Ant, deltaTime: number): void {
    // Update energy and hunger
    ant.energy = Math.max(0, Math.min(100, ant.energy - deltaTime * 0.5));
    ant.hunger = Math.min(100, ant.hunger + deltaTime * 0.3);

    // Determine behavior based on state
    if (ant.hunger > 80 && ant.behavior !== 'feeding') {
      ant.behavior = 'foraging';
    } else if (ant.energy < 20) {
      ant.behavior = 'returning';
    }

    // Execute behavior
    switch (ant.behavior) {
      case 'idle':
        this.behaviorIdle(ant, deltaTime);
        break;
      case 'foraging':
        this.behaviorForaging(ant, deltaTime);
        break;
      case 'tunneling':
        this.behaviorTunneling(ant, deltaTime);
        break;
      case 'following_trail':
        this.behaviorFollowingTrail(ant, deltaTime);
        break;
      case 'returning':
        this.behaviorReturning(ant, deltaTime);
        break;
      case 'feeding':
        this.behaviorFeeding(ant, deltaTime);
        break;
      case 'building':
        this.behaviorBuilding(ant, deltaTime);
        break;
    }

    // Keep ant within bounds
    ant.x = Math.max(0, Math.min(this.width, ant.x));
    ant.y = Math.max(0, Math.min(this.height, ant.y));
  }

  private behaviorIdle(ant: Ant, deltaTime: number): void {
    // Random wandering - ants may dig small tunnels even when idle
    if (!ant.targetX || !ant.targetY || 
        this.distance(ant.x, ant.y, ant.targetX, ant.targetY) < 5) {
      ant.targetX = ant.x + (Math.random() - 0.5) * 50;
      ant.targetY = ant.y + (Math.random() - 0.5) * 50;
      ant.targetX = Math.max(0, Math.min(this.width, ant.targetX));
      ant.targetY = Math.max(0, Math.min(this.height, ant.targetY));
    }

    const prevX = ant.x;
    const prevY = ant.y;
    this.moveTowardsTarget(ant, deltaTime);

    // Occasionally dig small tunnels when idle (colony expansion)
    const moved = Math.abs(ant.x - prevX) > 0.5 || Math.abs(ant.y - prevY) > 0.5;
    if (moved && ant.energy > 40 && Math.random() < 0.05) {
      this.createTunnelSegment(prevX, prevY, ant.x, ant.y);
      ant.energy -= 1;
    }

    // Switch to foraging if hungry
    if (ant.hunger > 60 && Math.random() < 0.1) {
      ant.behavior = 'foraging';
    }
    
    // Switch to building if energy is high and no chambers nearby
    if (ant.energy > 70 && this.chambers.length < 3 && Math.random() < 0.05) {
      ant.behavior = 'building';
    }
  }

  private behaviorForaging(ant: Ant, deltaTime: number): void {
    // Ants search for different food types based on needs
    // Priority: water (if very thirsty), sugar (if hungry), boost (if low energy), general food
    let preferredType: FoodType | undefined;
    if (ant.hunger > 80) {
      preferredType = 'water'; // Very thirsty, seek water
    } else if (ant.hunger > 50) {
      preferredType = 'sugar'; // Hungry, seek sugar
    } else if (ant.energy < 30) {
      preferredType = 'boost'; // Low energy, seek boost
    }
    
    // Look for nearby food sources
    const nearbyFood = this.findNearestFood(ant.x, ant.y, preferredType);
    
    if (nearbyFood) {
      ant.targetX = nearbyFood.x;
      ant.targetY = nearbyFood.y;
      const prevX = ant.x;
      const prevY = ant.y;
      this.moveTowardsTarget(ant, deltaTime);

      // Ants dig tunnels while foraging (realistic behavior)
      const moved = Math.abs(ant.x - prevX) > 0.5 || Math.abs(ant.y - prevY) > 0.5;
      if (moved && ant.energy > 30 && Math.random() < 0.15) {
        // Occasionally dig tunnel while moving to food
        this.createTunnelSegment(prevX, prevY, ant.x, ant.y);
        ant.energy -= 1;
      }

      // Check if reached food
      if (this.distance(ant.x, ant.y, nearbyFood.x, nearbyFood.y) < 10) {
        ant.behavior = 'feeding';
        
        // Different food types have different effects
        const consumption = 10;
        if (nearbyFood.type === 'water') {
          ant.hunger = Math.max(0, ant.hunger - 40); // Water reduces hunger significantly
        } else if (nearbyFood.type === 'sugar') {
          ant.hunger = Math.max(0, ant.hunger - 25);
          ant.energy = Math.min(100, ant.energy + 10); // Sugar gives energy
        } else if (nearbyFood.type === 'boost') {
          ant.energy = Math.min(100, ant.energy + 30); // Boost gives lots of energy
          ant.hunger = Math.max(0, ant.hunger - 15);
        } else {
          ant.hunger = Math.max(0, ant.hunger - 20); // Regular food
        }
        
        nearbyFood.amount = Math.max(0, nearbyFood.amount - consumption);
      }
    } else {
      // No food found, follow pheromone trails or explore
      const trail = this.findStrongestPheromone(ant.x, ant.y);
      if (trail && Math.random() < 0.7) {
        ant.behavior = 'following_trail';
        ant.trailId = trail.id;
      } else {
        // Random exploration - ants dig tunnels as they explore
        if (!ant.targetX || !ant.targetY || 
            this.distance(ant.x, ant.y, ant.targetX, ant.targetY) < 5) {
          ant.targetX = ant.x + (Math.random() - 0.5) * 100;
          ant.targetY = ant.y + (Math.random() - 0.5) * 100;
          ant.targetX = Math.max(0, Math.min(this.width, ant.targetX));
          ant.targetY = Math.max(0, Math.min(this.height, ant.targetY));
        }
        const prevX = ant.x;
        const prevY = ant.y;
        this.moveTowardsTarget(ant, deltaTime);
        
        // Dig tunnel while exploring
        const moved = Math.abs(ant.x - prevX) > 0.5 || Math.abs(ant.y - prevY) > 0.5;
        if (moved && ant.energy > 25 && Math.random() < 0.1) {
          this.createTunnelSegment(prevX, prevY, ant.x, ant.y);
          ant.energy -= 1;
        }
      }
    }

    // Leave pheromone trail
    this.leavePheromone(ant.x, ant.y, 1.0);
  }

  private behaviorTunneling(ant: Ant, deltaTime: number): void {
    // Create tunnel in direction of movement
    if (ant.targetX && ant.targetY) {
      const prevX = ant.x;
      const prevY = ant.y;
      this.moveTowardsTarget(ant, deltaTime);
      
      // Slowly dig tunnel as ant moves (realistic behavior)
      // Ants dig tunnels gradually as they move through soil
      if (ant.energy > 20 && Math.random() < 0.3) {
        // Check if we're moving (not stuck)
        const moved = Math.abs(ant.x - prevX) > 0.5 || Math.abs(ant.y - prevY) > 0.5;
        if (moved) {
          // Create tunnel segment along movement path
          this.createTunnelSegment(prevX, prevY, ant.x, ant.y);
          ant.energy -= 2; // Small energy cost for digging
        }
      }
    }

    // Switch to returning if low energy
    if (ant.energy < 20) {
      ant.behavior = 'returning';
    }
  }

  private behaviorFollowingTrail(ant: Ant, deltaTime: number): void {
    // Follow pheromone trail towards food
    const trail = this.findStrongestPheromone(ant.x, ant.y);
    if (trail) {
      ant.targetX = trail.x;
      ant.targetY = trail.y;
      this.moveTowardsTarget(ant, deltaTime);
      
      // Reinforce trail
      this.leavePheromone(ant.x, ant.y, 0.5);
    } else {
      // Trail lost, go back to foraging
      ant.behavior = 'foraging';
      ant.trailId = undefined;
    }
  }

  private behaviorReturning(ant: Ant, deltaTime: number): void {
    // Return to nearest chamber
    const nearestChamber = this.findNearestChamber(ant.x, ant.y);
    if (nearestChamber) {
      ant.targetX = nearestChamber.x;
      ant.targetY = nearestChamber.y;
      this.moveTowardsTarget(ant, deltaTime);

      // Reached chamber, rest
      if (this.distance(ant.x, ant.y, nearestChamber.x, nearestChamber.y) < 20) {
        ant.energy = Math.min(100, ant.energy + deltaTime * 20);
        if (ant.energy > 80) {
          ant.behavior = 'idle';
        }
      }
    } else {
      // No chamber, just rest in place
      ant.energy = Math.min(100, ant.energy + deltaTime * 10);
      if (ant.energy > 80) {
        ant.behavior = 'idle';
      }
    }
  }

  private behaviorFeeding(ant: Ant, deltaTime: number): void {
    // Stay at food source and feed
    ant.hunger = Math.max(0, ant.hunger - deltaTime * 20);
    
    // Leave strong pheromone trail
    this.leavePheromone(ant.x, ant.y, 2.0);

    // Return to foraging or returning after feeding
    if (ant.hunger < 30) {
      ant.behavior = 'returning';
    } else if (ant.hunger < 60) {
      ant.behavior = 'foraging';
    }
  }

  private behaviorBuilding(ant: Ant, deltaTime: number): void {
    // Build chamber or expand tunnel (realistic colony building)
    // Ants build chambers near existing tunnels
    const nearestTunnel = this.findNearestTunnel(ant.x, ant.y);
    
    if (nearestTunnel) {
      // Move towards tunnel area to build chamber
      const tunnelPoint = nearestTunnel.points[Math.floor(nearestTunnel.points.length / 2)];
      ant.targetX = tunnelPoint.x + (Math.random() - 0.5) * 30;
      ant.targetY = tunnelPoint.y + (Math.random() - 0.5) * 30;
      ant.targetX = Math.max(0, Math.min(this.width, ant.targetX));
      ant.targetY = Math.max(0, Math.min(this.height, ant.targetY));
    }
    
    if (ant.targetX && ant.targetY) {
      const prevX = ant.x;
      const prevY = ant.y;
      this.moveTowardsTarget(ant, deltaTime);
      
      // Dig tunnel while moving to build site
      const moved = Math.abs(ant.x - prevX) > 0.5 || Math.abs(ant.y - prevY) > 0.5;
      if (moved && ant.energy > 50 && Math.random() < 0.2) {
        this.createTunnelSegment(prevX, prevY, ant.x, ant.y);
        ant.energy -= 2;
      }
      
      // Build chamber when in good location (not too close to existing chambers)
      const tooClose = this.chambers.some(c => 
        this.distance(ant.x, ant.y, c.x, c.y) < 50
      );
      
      if (!tooClose && Math.random() < 0.02 && ant.energy > 50) {
        this.createChamber(ant.x, ant.y);
        ant.energy -= 15; // Significant energy cost for building
      }
    }

    if (ant.energy < 30) {
      ant.behavior = 'returning';
    }
  }

  private moveTowardsTarget(ant: Ant, deltaTime: number): void {
    if (!ant.targetX || !ant.targetY) return;

    const speed = ant.stats.speed * 30 * deltaTime; // pixels per second
    const dx = ant.targetX - ant.x;
    const dy = ant.targetY - ant.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      ant.x += (dx / distance) * Math.min(speed, distance);
      ant.y += (dy / distance) * Math.min(speed, distance);
    }
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  private findNearestFood(x: number, y: number, preferredType?: FoodType): FoodSource | null {
    let nearest: (FoodSource & { dist: number }) | null = null;

    this.foodSources.forEach(food => {
      if (food.amount > 0) {
        // If preferred type specified, prioritize it
        if (preferredType && food.type !== preferredType) {
          return; // Skip non-preferred types
        }
        const dist = this.distance(x, y, food.x, food.y);
        if (!nearest || dist < nearest.dist) {
          nearest = { ...food, dist };
        }
      }
    });

    return nearest ? { 
      id: nearest.id,
      type: nearest.type,
      x: nearest.x, 
      y: nearest.y, 
      amount: nearest.amount,
      maxAmount: nearest.maxAmount,
      placedAt: nearest.placedAt,
    } : null;
  }

  private findNearestChamber(x: number, y: number): Chamber | null {
    let nearest: Chamber | null = null;
    let minDist = Infinity;

    this.chambers.forEach(chamber => {
      const dist = this.distance(x, y, chamber.x, chamber.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = chamber;
      }
    });

    return nearest;
  }

  private findStrongestPheromone(x: number, y: number): { x: number; y: number; id: string } | null {
    const searchRadius = 50;
    let strongest: { x: number; y: number; strength: number; id: string } | null = null;

    this.pheromoneMap.forEach((strength, key) => {
      const [px, py] = key.split(',').map(Number);
      const dist = this.distance(x, y, px, py);
      
      if (dist < searchRadius && (!strongest || strength > strongest.strength)) {
        strongest = { x: px, y: py, strength, id: key };
      }
    });

    return strongest ? { x: strongest.x, y: strongest.y, id: strongest.id } : null;
  }

  private leavePheromone(x: number, y: number, strength: number): void {
    const key = `${Math.floor(x / 10)},${Math.floor(y / 10)}`;
    const current = this.pheromoneMap.get(key) || 0;
    this.pheromoneMap.set(key, Math.min(5.0, current + strength));
  }

  private decayPheromones(deltaTime: number): void {
    const decayRate = 0.5 * deltaTime; // Decay per second
    this.pheromoneMap.forEach((strength, key) => {
      const newStrength = strength - decayRate;
      if (newStrength <= 0) {
        this.pheromoneMap.delete(key);
      } else {
        this.pheromoneMap.set(key, newStrength);
      }
    });
  }

  private findNearestTunnel(x: number, y: number): Tunnel | null {
    let nearest: Tunnel | null = null;
    let minDist = Infinity;

    this.tunnels.forEach(tunnel => {
      tunnel.points.forEach(point => {
        const dist = this.distance(x, y, point.x, point.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = tunnel;
        }
      });
    });

    return nearest;
  }

  private createTunnelSegment(x1: number, y1: number, x2: number, y2: number): void {
    // Check if we should extend existing tunnel or create new one
    const existingTunnel = this.findNearestTunnel(x1, y1);
    const segmentLength = this.distance(x1, y1, x2, y2);
    
    if (existingTunnel && this.distance(x1, y1, 
        existingTunnel.points[existingTunnel.points.length - 1].x,
        existingTunnel.points[existingTunnel.points.length - 1].y) < 15) {
      // Extend existing tunnel
      existingTunnel.points.push({ x: x2, y: y2 });
    } else if (segmentLength > 2) {
      // Create new tunnel segment
      const tunnel: Tunnel = {
        id: `tunnel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        points: [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ],
        width: 6, // Smaller width for pixel art
      };
      this.tunnels.push(tunnel);
    }
  }

  private createChamber(x: number, y: number): void {
    const chamber: Chamber = {
      id: `chamber-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      radius: 20 + Math.random() * 10,
      type: 'nest',
    };
    this.chambers.push(chamber);
  }

  private updateColonyStructure(): void {
    // Auto-generate initial nest chamber if none exist (realistic - ants need a home)
    if (this.chambers.length === 0 && this.ants.length > 0) {
      // Find center of ant positions
      let centerX = 0;
      let centerY = 0;
      this.ants.forEach(ant => {
        centerX += ant.x;
        centerY += ant.y;
      });
      centerX /= this.ants.length;
      centerY /= this.ants.length;
      
      this.createChamber(centerX, centerY);
    }
    
    // Ants naturally expand colony - create more chambers as colony grows
    if (this.ants.length >= 5 && this.chambers.length < 2 && Math.random() < 0.001) {
      const randomAnt = this.ants[Math.floor(Math.random() * this.ants.length)];
      const tooClose = this.chambers.some(c => 
        this.distance(randomAnt.x, randomAnt.y, c.x, c.y) < 80
      );
      if (!tooClose) {
        this.createChamber(randomAnt.x, randomAnt.y);
      }
    }
  }

  /**
   * Get current simulation state
   */
  getState(): {
    ants: Ant[];
    tunnels: Tunnel[];
    chambers: Chamber[];
    pheromones: Array<{ x: number; y: number; strength: number }>;
  } {
    const pheromones: Array<{ x: number; y: number; strength: number }> = [];
    this.pheromoneMap.forEach((strength, key) => {
      const [x, y] = key.split(',').map(Number);
      pheromones.push({ x: x * 10, y: y * 10, strength });
    });

    return {
      ants: [...this.ants],
      tunnels: [...this.tunnels],
      chambers: [...this.chambers],
      pheromones,
    };
  }

  /**
   * Add food source at position
   */
  addFoodSource(x: number, y: number, amount: number = 100, type: FoodType = 'food'): void {
    this.foodSources.push({
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      amount,
      maxAmount: amount,
      placedAt: Date.now(),
    });
  }

  /**
   * Get food sources
   */
  getFoodSources(): FoodSource[] {
    return [...this.foodSources];
  }
}

