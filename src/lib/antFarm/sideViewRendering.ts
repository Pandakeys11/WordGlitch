/**
 * Side-view ant farm rendering (like looking at an ant farm tank)
 * Tunnels and chambers appear from the side perspective
 */

import { PIXEL_SIZE, PIXEL_COLORS, enablePixelPerfect } from './pixelArt';
import { Ant, Tunnel, Chamber, FoodSource } from '@/types/antFarm';

/**
 * Draw side-view ant farm background (tank perspective)
 */
export function drawSideViewBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: string
) {
  const pixel = PIXEL_SIZE;
  
  // Tank background color
  const bgColor = background === 'bg-dark' ? PIXEL_COLORS.DARK_GRAY : 
                  background === 'bg-crystal' ? PIXEL_COLORS.BLACK :
                  PIXEL_COLORS.SAND;
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Draw tank glass effect (top and sides)
  ctx.strokeStyle = PIXEL_COLORS.LIGHT_GRAY;
  ctx.lineWidth = pixel * 2;
  // Top edge
  ctx.strokeRect(0, 0, width, pixel * 2);
  // Left edge
  ctx.strokeRect(0, 0, pixel * 2, height);
  // Right edge
  ctx.strokeRect(width - pixel * 2, 0, pixel * 2, height);
  
  // Add texture (sand/dirt particles)
  ctx.fillStyle = background === 'bg-dark' ? PIXEL_COLORS.BLACK :
                  background === 'bg-crystal' ? PIXEL_COLORS.DARK_GRAY :
                  PIXEL_COLORS.SAND_DARK;
  
  for (let x = 0; x < width; x += pixel * 3) {
    for (let y = 0; y < height; y += pixel * 3) {
      if (Math.random() < 0.15) {
        ctx.fillRect(
          Math.floor(x / pixel) * pixel,
          Math.floor(y / pixel) * pixel,
          pixel,
          pixel
        );
      }
    }
  }
}

/**
 * Draw side-view tunnel (horizontal cross-section view)
 */
export function drawSideViewTunnel(
  ctx: CanvasRenderingContext2D,
  tunnel: Tunnel,
  progress: number = 1.0
) {
  if (tunnel.points.length < 2) return;
  
  const pixel = PIXEL_SIZE;
  const tunnelHeight = Math.max(3, Math.floor(tunnel.width / pixel)); // Height in side view
  const pointsToDraw = Math.ceil(tunnel.points.length * progress);
  
  // Draw tunnel segments from side view (horizontal cross-section)
  for (let i = 0; i < pointsToDraw - 1; i++) {
    const p1 = tunnel.points[i];
    const p2 = tunnel.points[i + 1];
    
    const x1 = Math.floor(p1.x / pixel) * pixel;
    const y1 = Math.floor(p1.y / pixel) * pixel;
    const x2 = Math.floor(p2.x / pixel) * pixel;
    const y2 = Math.floor(p2.y / pixel) * pixel;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) continue;
    
    const steps = Math.ceil(length / pixel);
    
    // Draw tunnel cross-section (oval/rounded rectangle from side)
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const gridX = Math.floor(px / pixel) * pixel;
      const gridY = Math.floor(py / pixel) * pixel;
      
      // Draw tunnel height (vertical in side view)
      for (let h = -tunnelHeight; h <= tunnelHeight; h++) {
        const tunnelY = gridY + h * pixel;
        const finalX = gridX;
        const finalY = Math.floor(tunnelY / pixel) * pixel;
        
        // Tunnel interior (darker)
        ctx.fillStyle = PIXEL_COLORS.TUNNEL_DARK;
        ctx.fillRect(finalX, finalY, pixel, pixel);
        
        // Tunnel edges (lighter, rounded top/bottom)
        if (Math.abs(h) === tunnelHeight || Math.abs(h) === tunnelHeight - 1) {
          ctx.fillStyle = PIXEL_COLORS.TUNNEL;
          ctx.fillRect(finalX, finalY, pixel, pixel);
        }
      }
    }
  }
}

/**
 * Draw side-view chamber (circular cross-section from side)
 */
export function drawSideViewChamber(
  ctx: CanvasRenderingContext2D,
  chamber: Chamber
) {
  const pixel = PIXEL_SIZE;
  const centerX = Math.floor(chamber.x / pixel) * pixel;
  const centerY = Math.floor(chamber.y / pixel) * pixel;
  const gridRadius = Math.floor(chamber.radius / pixel);
  
  // Draw chamber from side view (circular cross-section)
  for (let gridY = -gridRadius; gridY <= gridRadius; gridY++) {
    for (let gridX = -gridRadius; gridX <= gridRadius; gridX++) {
      const dist = Math.sqrt(gridX * gridX + gridY * gridY);
      
      if (dist <= gridRadius) {
        const px = centerX + gridX * pixel;
        const py = centerY + gridY * pixel;
        
        // Chamber interior
        if (dist < gridRadius - 1) {
          ctx.fillStyle = PIXEL_COLORS.CHAMBER;
        } else {
          // Chamber border
          ctx.fillStyle = PIXEL_COLORS.CHAMBER_DARK;
        }
        
        ctx.fillRect(px, py, pixel, pixel);
      }
    }
  }
  
  // Add chamber type indicator
  if (chamber.type === 'queen') {
    ctx.fillStyle = PIXEL_COLORS.WHITE;
    ctx.fillRect(centerX, centerY, pixel, pixel);
  }
}

/**
 * Draw side-view ant (profile view from side)
 */
export function drawSideViewAnt(
  ctx: CanvasRenderingContext2D,
  ant: Ant,
  facing: 'left' | 'right',
  animationFrame: number
) {
  const pixel = PIXEL_SIZE;
  const centerX = Math.floor(ant.x / pixel) * pixel;
  const centerY = Math.floor(ant.y / pixel) * pixel;
  
  // Ant from side view (profile)
  ctx.fillStyle = ant.color;
  
  // Ant body (horizontal segments from side)
  // Head
  ctx.fillRect(centerX - pixel, centerY - pixel, pixel, pixel);
  // Thorax
  ctx.fillRect(centerX, centerY - pixel, pixel * 2, pixel);
  // Abdomen
  ctx.fillRect(centerX + pixel * 2, centerY - pixel, pixel * 2, pixel);
  
  // Legs (6 legs, 3 on each side from side view)
  const legOffset = Math.sin(animationFrame * 0.2) * pixel;
  ctx.fillStyle = PIXEL_COLORS.ANT_BODY_DARK;
  
  if (facing === 'right') {
    // Front legs (left side)
    ctx.fillRect(centerX - pixel, centerY, pixel, pixel);
    ctx.fillRect(centerX, centerY + Math.floor(legOffset), pixel, pixel);
    // Middle legs
    ctx.fillRect(centerX + pixel, centerY - Math.floor(legOffset), pixel, pixel);
    ctx.fillRect(centerX + pixel * 2, centerY, pixel, pixel);
    // Back legs
    ctx.fillRect(centerX + pixel * 3, centerY + Math.floor(legOffset), pixel, pixel);
    
    // Antennae
    ctx.fillRect(centerX - pixel * 2, centerY - pixel * 2, pixel, pixel);
  } else {
    // Facing left - mirror
    ctx.fillRect(centerX + pixel, centerY, pixel, pixel);
    ctx.fillRect(centerX, centerY + Math.floor(legOffset), pixel, pixel);
    ctx.fillRect(centerX - pixel, centerY - Math.floor(legOffset), pixel, pixel);
    ctx.fillRect(centerX - pixel * 2, centerY, pixel, pixel);
    ctx.fillRect(centerX - pixel * 3, centerY + Math.floor(legOffset), pixel, pixel);
    
    ctx.fillRect(centerX + pixel * 2, centerY - pixel * 2, pixel, pixel);
  }
}

/**
 * Draw food source from side view
 */
export function drawSideViewFoodSource(
  ctx: CanvasRenderingContext2D,
  food: FoodSource
) {
  const pixel = PIXEL_SIZE;
  const gridX = Math.floor(food.x / pixel) * pixel;
  const gridY = Math.floor(food.y / pixel) * pixel;
  
  // Different colors for different food types
  let color = PIXEL_COLORS.ANT_BODY;
  if (food.type === 'water') {
    color = '#4A90E2'; // Blue
  } else if (food.type === 'sugar') {
    color = '#FFD700'; // Gold
  } else if (food.type === 'boost') {
    color = '#FF6B6B'; // Red
  }
  
  // Draw food source (pixelated)
  ctx.fillStyle = color;
  const size = Math.max(2, Math.floor(food.amount / 50));
  for (let i = -size; i <= size; i++) {
    for (let j = -size; j <= size; j++) {
      if (Math.abs(i) + Math.abs(j) <= size) {
        ctx.fillRect(
          gridX + i * pixel,
          gridY + j * pixel,
          pixel,
          pixel
        );
      }
    }
  }
  
  // Pulsing effect for active food sources
  if (food.amount > 0) {
    const pulse = (Date.now() % 2000) / 2000;
    if (pulse > 0.7) {
      ctx.fillStyle = PIXEL_COLORS.WHITE;
      ctx.fillRect(gridX, gridY, pixel, pixel);
    }
  }
}

