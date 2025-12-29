/**
 * Color Utility Functions
 * Advanced color calculations for optimal puzzle visibility and contrast
 */

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * Calculate relative luminance for WCAG contrast calculation
 * Formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors (WCAG standard)
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
 */
export function getContrastRatio(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const l1 = getRelativeLuminance(color1.r, color1.g, color1.b);
  const l2 = getRelativeLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get average color from an array of colors
 */
export function getAverageColor(colors: string[]): { r: number; g: number; b: number } {
  const rgbColors = colors
    .map(hex => hexToRgb(hex))
    .filter((rgb): rgb is { r: number; g: number; b: number } => rgb !== null);

  if (rgbColors.length === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  const sum = rgbColors.reduce(
    (acc, rgb) => ({
      r: acc.r + rgb.r,
      g: acc.g + rgb.g,
      b: acc.b + rgb.b,
    }),
    { r: 0, g: 0, b: 0 }
  );

  return {
    r: Math.round(sum.r / rgbColors.length),
    g: Math.round(sum.g / rgbColors.length),
    b: Math.round(sum.b / rgbColors.length),
  };
}

/**
 * Find complementary color (opposite on color wheel)
 */
export function getComplementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
}

/**
 * Find triadic colors (120 degrees apart on color wheel)
 */
export function getTriadicColors(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex, hex, hex];
  
  // Convert to HSL for easier manipulation
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const h1 = (hsl.h + 120) % 360;
  const h2 = (hsl.h + 240) % 360;
  
  const color1 = hslToRgb(h1, hsl.s, hsl.l);
  const color2 = hslToRgb(h2, hsl.s, hsl.l);
  
  return [
    hex,
    rgbToHex(color1.r, color1.g, color1.b),
    rgbToHex(color2.r, color2.g, color2.b),
  ];
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Adjust color brightness
 * @param hex - Hex color string
 * @param percent - Percentage to adjust (-100 to 100, negative = darker, positive = lighter)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 + percent / 100;
  return rgbToHex(
    Math.max(0, Math.min(255, rgb.r * factor)),
    Math.max(0, Math.min(255, rgb.g * factor)),
    Math.max(0, Math.min(255, rgb.b * factor))
  );
}

/**
 * Adjust color saturation
 * @param hex - Hex color string
 * @param percent - Percentage to adjust (-100 to 100, negative = desaturate, positive = saturate)
 */
export function adjustSaturation(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newSaturation = Math.max(0, Math.min(100, hsl.s + percent));
  const newRgb = hslToRgb(hsl.h, newSaturation, hsl.l);

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Find optimal hidden word color for maximum contrast against glitch colors
 * Uses color theory to find the best contrasting color
 */
export function findOptimalHiddenWordColor(
  glitchColors: string[],
  difficulty: 'easy' | 'average' | 'hard'
): string {
  if (glitchColors.length === 0) return '#ffffff';

  // Get average of glitch colors
  const avgGlitch = getAverageColor(glitchColors);
  
  // Calculate target contrast ratio based on difficulty
  const targetContrast = difficulty === 'easy' ? 7.0 : difficulty === 'average' ? 5.0 : 3.5;
  
  // Try complementary color first (best contrast)
  let candidate = getComplementaryColor(rgbToHex(avgGlitch.r, avgGlitch.g, avgGlitch.b));
  let candidateRgb = hexToRgb(candidate);
  
  if (candidateRgb) {
    const contrast = getContrastRatio(avgGlitch, candidateRgb);
    if (contrast >= targetContrast) {
      // Adjust brightness/saturation for optimal visibility
      if (difficulty === 'easy') {
        candidate = adjustBrightness(candidate, 20); // Brighter for easy
        candidate = adjustSaturation(candidate, 30); // More saturated
      } else if (difficulty === 'average') {
        candidate = adjustBrightness(candidate, 10);
        candidate = adjustSaturation(candidate, 20);
      } else {
        candidate = adjustBrightness(candidate, -5); // Slightly darker for hard
        candidate = adjustSaturation(candidate, 10);
      }
      return candidate;
    }
  }
  
  // If complementary doesn't work, try triadic colors
  const triadic = getTriadicColors(rgbToHex(avgGlitch.r, avgGlitch.g, avgGlitch.b));
  for (const color of triadic) {
    const colorRgb = hexToRgb(color);
    if (colorRgb) {
      const contrast = getContrastRatio(avgGlitch, colorRgb);
      if (contrast >= targetContrast) {
        return adjustBrightness(color, difficulty === 'easy' ? 25 : difficulty === 'average' ? 15 : 5);
      }
    }
  }
  
  // Fallback: high contrast white or black
  const whiteContrast = getContrastRatio(avgGlitch, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(avgGlitch, { r: 0, g: 0, b: 0 });
  
  if (whiteContrast > blackContrast && whiteContrast >= targetContrast) {
    return '#ffffff';
  } else if (blackContrast >= targetContrast) {
    return '#000000';
  }
  
  // Last resort: bright, saturated color
  return adjustBrightness(adjustSaturation(candidate || '#ff00ff', 50), 30);
}

/**
 * Calculate contrast ratio for a color against glitch colors
 */
export function getContrastAgainstGlitchColors(
  color: string,
  glitchColors: string[]
): number {
  const colorRgb = hexToRgb(color);
  if (!colorRgb || glitchColors.length === 0) return 0;

  const avgGlitch = getAverageColor(glitchColors);
  return getContrastRatio(avgGlitch, colorRgb);
}

/**
 * Check if a color meets WCAG contrast requirements
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return false;
  
  const contrast = getContrastRatio(fgRgb, bgRgb);
  
  if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7.0;
  } else {
    return size === 'large' ? contrast >= 3.0 : contrast >= 4.5;
  }
}


