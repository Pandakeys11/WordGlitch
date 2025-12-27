/**
 * 2-bit pixel art utilities for ant farm
 * 2-bit = 4 colors: black, dark gray, light gray, white
 */

export const PIXEL_COLORS = {
  BLACK: '#000000',
  DARK_GRAY: '#555555',
  LIGHT_GRAY: '#AAAAAA',
  WHITE: '#FFFFFF',
  SAND: '#D2B48C',
  SAND_DARK: '#B89A7A',
  SAND_LIGHT: '#E8D4B8',
  ANT_BODY: '#8B7355',
  ANT_BODY_DARK: '#6B5B47',
  TUNNEL: '#8B7355',
  TUNNEL_DARK: '#6B5B47',
  CHAMBER: '#6B5B47',
  CHAMBER_DARK: '#4A3E2E',
} as const;

export const PIXEL_SIZE = 4; // Size of each pixel in canvas units (larger for better visibility in ant farm)

/**
 * Draw pixel art ant sprite (2-bit style)
 */
export function drawPixelAnt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  facing: 'left' | 'right' = 'right',
  animationFrame: number = 0
) {
  const pixel = PIXEL_SIZE;
  const centerX = Math.floor(x / pixel) * pixel;
  const centerY = Math.floor(y / pixel) * pixel;
  
  // Ant sprite (4x3 pixels for body)
  // Head (1x1 pixel)
  ctx.fillStyle = color;
  if (facing === 'right') {
    ctx.fillRect(centerX - pixel * 2, centerY - pixel, pixel, pixel);
  } else {
    ctx.fillRect(centerX + pixel * 2, centerY - pixel, pixel, pixel);
  }
  
  // Body segments (3x1 pixels)
  ctx.fillRect(centerX - pixel, centerY - pixel, pixel, pixel);
  ctx.fillRect(centerX, centerY - pixel, pixel, pixel);
  ctx.fillRect(centerX + pixel, centerY - pixel, pixel, pixel);
  
  // Legs (animated, 6 legs total)
  const legOffset = Math.sin(animationFrame * 0.2) * pixel;
  ctx.fillStyle = PIXEL_COLORS.ANT_BODY_DARK;
  
  if (facing === 'right') {
    // Front legs
    ctx.fillRect(centerX - pixel * 2, centerY, pixel, pixel);
    ctx.fillRect(centerX - pixel, centerY + Math.floor(legOffset), pixel, pixel);
    // Middle legs
    ctx.fillRect(centerX, centerY - Math.floor(legOffset), pixel, pixel);
    ctx.fillRect(centerX + pixel, centerY, pixel, pixel);
    // Back legs
    ctx.fillRect(centerX + pixel * 2, centerY + Math.floor(legOffset), pixel, pixel);
    
    // Antennae (2 pixels up from head)
    ctx.fillRect(centerX - pixel * 3, centerY - pixel * 2, pixel, pixel);
    ctx.fillRect(centerX - pixel * 3, centerY - pixel * 3, pixel, pixel);
  } else {
    // Facing left - mirror the sprite
    // Front legs
    ctx.fillRect(centerX + pixel * 2, centerY, pixel, pixel);
    ctx.fillRect(centerX + pixel, centerY + Math.floor(legOffset), pixel, pixel);
    // Middle legs
    ctx.fillRect(centerX, centerY - Math.floor(legOffset), pixel, pixel);
    ctx.fillRect(centerX - pixel, centerY, pixel, pixel);
    // Back legs
    ctx.fillRect(centerX - pixel * 2, centerY + Math.floor(legOffset), pixel, pixel);
    
    // Antennae
    ctx.fillRect(centerX + pixel * 3, centerY - pixel * 2, pixel, pixel);
    ctx.fillRect(centerX + pixel * 3, centerY - pixel * 3, pixel, pixel);
  }
}

/**
 * Draw pixel art tunnel (realistic ant farm style)
 */
export function drawPixelTunnel(
  ctx: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  width: number,
  progress: number = 1.0
) {
  if (points.length < 2) return;
  
  const pixel = PIXEL_SIZE;
  const tunnelWidth = Math.max(3, Math.floor(width / pixel)); // Width in pixels
  const pointsToDraw = Math.ceil(points.length * progress);
  
  // Draw tunnel segments pixel by pixel
  for (let i = 0; i < pointsToDraw - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const x1 = Math.floor(p1.x / pixel) * pixel;
    const y1 = Math.floor(p1.y / pixel) * pixel;
    const x2 = Math.floor(p2.x / pixel) * pixel;
    const y2 = Math.floor(p2.y / pixel) * pixel;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) continue;
    
    const steps = Math.ceil(length / pixel);
    
    // Draw tunnel cross-section at each step
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const gridX = Math.floor(px / pixel) * pixel;
      const gridY = Math.floor(py / pixel) * pixel;
      
      // Calculate perpendicular direction
      const perpX = -dy / length;
      const perpY = dx / length;
      
      // Draw tunnel width (pixelated)
      for (let w = -tunnelWidth; w <= tunnelWidth; w++) {
        const tunnelX = gridX + perpX * w * pixel;
        const tunnelY = gridY + perpY * w * pixel;
        const finalX = Math.floor(tunnelX / pixel) * pixel;
        const finalY = Math.floor(tunnelY / pixel) * pixel;
        
        // Tunnel interior (darker)
        ctx.fillStyle = PIXEL_COLORS.TUNNEL_DARK;
        ctx.fillRect(finalX, finalY, pixel, pixel);
        
        // Tunnel edges (lighter)
        if (Math.abs(w) === tunnelWidth || Math.abs(w) === tunnelWidth - 1) {
          ctx.fillStyle = PIXEL_COLORS.TUNNEL;
          ctx.fillRect(finalX, finalY, pixel, pixel);
        }
      }
    }
  }
}

/**
 * Draw pixel art chamber (realistic ant farm style)
 */
export function drawPixelChamber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  type: 'nest' | 'storage' | 'queen'
) {
  const pixel = PIXEL_SIZE;
  const centerX = Math.floor(x / pixel) * pixel;
  const centerY = Math.floor(y / pixel) * pixel;
  const gridRadius = Math.floor(radius / pixel);
  
  // Draw pixelated circular chamber
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
  
  // Add chamber type indicator (pixel pattern)
  if (type === 'queen') {
    // Draw small pattern in center for queen chamber
    ctx.fillStyle = PIXEL_COLORS.WHITE;
    ctx.fillRect(centerX, centerY, pixel, pixel);
  }
}

/**
 * Draw pixel art background
 */
export function drawPixelBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: string
) {
  const pixel = PIXEL_SIZE;
  const bgColor = background === 'bg-dark' ? PIXEL_COLORS.DARK_GRAY : 
                  background === 'bg-crystal' ? PIXEL_COLORS.BLACK :
                  PIXEL_COLORS.SAND;
  
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add pixelated texture
  ctx.fillStyle = background === 'bg-dark' ? PIXEL_COLORS.BLACK :
                  background === 'bg-crystal' ? PIXEL_COLORS.DARK_GRAY :
                  PIXEL_COLORS.SAND_DARK;
  
  for (let x = 0; x < width; x += pixel * 4) {
    for (let y = 0; y < height; y += pixel * 4) {
      if (Math.random() < 0.1) {
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
 * Enable pixel-perfect rendering
 */
export function enablePixelPerfect(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';
}

