'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Level, GameWord } from '@/types/game';
import { CHAR_WIDTH, CHAR_HEIGHT, FONT_SIZE } from '@/lib/constants';
import { ColorPalette, getPalette, DEFAULT_PALETTE_ID } from '@/lib/colorPalettes';
import { getTextSizingForDifficulty } from '@/lib/game/difficulty';

// Get word color from palette (will be set dynamically)
let currentPalette: ColorPalette = getPalette(DEFAULT_PALETTE_ID);

// Get uniform color for all hidden words from current palette
const getWordColor = (): string => {
  return currentPalette.hiddenWordColor;
};

// Update palette (called from parent component)
export const updatePalette = (palette: ColorPalette) => {
  currentPalette = palette;
};

/**
 * Calculate glow intensity based on level
 * Updates every 7 levels (same tier system as timing)
 * Lower levels: More distinctive glow (1.0-1.2 for extra visibility)
 * Higher levels: Dimmed glow that gradually decreases
 * Levels 1-7: Enhanced glow (1.2) - very distinctive
 * Levels 8-14: Full glow (1.0)
 * Levels 15-21: Dimmed glow (0.8)
 * Levels 22-28: Further dimmed (0.6)
 * Levels 29-35: Very dim (0.4)
 * Levels 36-42: Minimal glow (0.2)
 * Levels 43+: No glow (0.0)
 */
const getGlowIntensity = (level: number): number => {
  // Group levels into tiers (every 7 levels, matching timing system)
  const tier = Math.floor((level - 1) / 7);
  
  if (tier === 0) {
    // Levels 1-7: Enhanced glow for maximum visibility
    return 1.2;
  } else if (tier === 1) {
    // Levels 8-14: Full glow
    return 1.0;
  } else if (tier === 2) {
    // Levels 15-21: Dimmed glow
    return 0.8;
  } else if (tier === 3) {
    // Levels 22-28: Further dimmed
    return 0.6;
  } else if (tier === 4) {
    // Levels 29-35: Very dim
    return 0.4;
  } else if (tier === 5) {
    // Levels 36-42: Minimal glow
    return 0.2;
  } else {
    // Levels 43+: No glow
    return 0.0;
  }
};

/**
 * Calculate vibrant color based on level
 * Lower levels: More vibrant and saturated
 * Higher levels: More muted, closer to base color
 * Returns hex color for consistency
 * Handles intensity > 1.0 for enhanced glow at tier 0
 */
const getVibrantColor = (level: number, baseColor: string): string => {
  const glowIntensity = getGlowIntensity(level);
  
  if (glowIntensity === 0) {
    return baseColor; // No enhancement at very high levels
  }
  
  // Parse base color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Clamp intensity to 1.0 for color calculations (intensity > 1.0 is for glow size only)
  const colorIntensity = Math.min(1.0, glowIntensity);
  
  // Calculate vibrant version (increase saturation and brightness)
  // At full intensity, make it more vibrant
  // At lower intensity, blend towards base color
  const vibrantR = Math.min(255, r + (255 - r) * 0.2 * colorIntensity);
  const vibrantG = Math.min(255, g + (255 - g) * 0.3 * colorIntensity);
  const vibrantB = Math.min(255, b + (255 - b) * 0.2 * colorIntensity);
  
  // Blend between base and vibrant based on glow intensity
  const finalR = Math.round(r + (vibrantR - r) * colorIntensity);
  const finalG = Math.round(g + (vibrantG - g) * colorIntensity);
  const finalB = Math.round(b + (vibrantB - b) * colorIntensity);
  
  // Clamp RGB values to valid range
  const clampedR = Math.max(0, Math.min(255, finalR));
  const clampedG = Math.max(0, Math.min(255, finalG));
  const clampedB = Math.max(0, Math.min(255, finalB));
  
  // Convert back to hex for consistency
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(clampedR)}${toHex(clampedG)}${toHex(clampedB)}`;
};

/**
 * Get glow properties based on level
 * Enhanced for lower levels to make words more distinctive
 * Optimized for performance with proper clamping
 */
const getGlowProperties = (level: number) => {
  const intensity = getGlowIntensity(level);
  const tier = Math.floor((level - 1) / 7);
  
  // Enhanced glow at lower levels
  const baseBlur = tier === 0 ? 30 : 25; // Extra blur for tier 0
  const baseInnerBlur = tier === 0 ? 20 : 15; // Extra inner blur for tier 0
  
  // Clamp intensity for calculations (intensity > 1.0 is for enhanced effect at tier 0)
  const effectiveIntensity = Math.min(1.0, intensity);
  
  return {
    shadowBlur: Math.max(0, effectiveIntensity * baseBlur), // Up to 30px blur at tier 0, 25px otherwise
    shadowBlurInner: Math.max(0, effectiveIntensity * baseInnerBlur), // Up to 20px inner blur at tier 0
    shadowSpread: Math.max(0, effectiveIntensity * (tier === 0 ? 4 : 3)), // Extra spread for tier 0
    opacity: Math.max(0, Math.min(1, tier === 0 ? 1.0 : 0.7 + (effectiveIntensity * 0.3))), // Full opacity at tier 0
    layers: intensity > 0.8 ? 4 : intensity > 0.5 ? 3 : intensity > 0.2 ? 2 : 1, // More layers at lower levels
    intensityMultiplier: intensity > 1.0 ? intensity : 1.0, // Use for enhanced glow size at tier 0
  };
};

interface LetterGlitchProps {
  level: Level;
  words: GameWord[];
  onWordFound: (word: string, isCorrectClick: boolean) => void;
  isPaused: boolean;
  timeRemaining?: number;
  glitchColors?: string[];
  palette?: ColorPalette; // Color palette for glitch and hidden words
  menuDisplayWords?: string[]; // Words to randomly display in menu screen (e.g., ["WORD GLITCH", "by PGT"])
}

interface Letter {
  char: string;
  color: string;
  targetColor: string;
  colorProgress: number;
  offsetX: number;
  offsetY: number;
  targetOffsetX: number;
  targetOffsetY: number;
  offsetProgress: number;
  isFrozen: boolean;
  frozenText?: string;
  isVisibleWord?: boolean; // Track if letter is part of a visible (not found) word
  visibleWordText?: string; // Track which word this letter belongs to
}

export interface LetterGlitchHandle {
  triggerIntenseGlitch: (colors?: string[], duration?: number) => void;
  triggerHoverGlitch: (colors?: string[], duration?: number) => void;
  triggerWordScramble: (duration?: number) => void;
  stopHoverGlitch: () => void;
  resetToNormal: () => void;
  getCanvasDimensions: () => { width: number; height: number; cols: number; rows: number } | null;
}

const LetterGlitch = forwardRef<LetterGlitchHandle, LetterGlitchProps>(
  ({ level, words, onWordFound, isPaused, timeRemaining, glitchColors, palette, menuDisplayWords }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const lettersRef = useRef<Letter[]>([]);
    const animationRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const glitchStateRef = useRef<'normal' | 'intense' | 'hover'>('normal');
    const glitchEndTimeRef = useRef<number>(0);
    const scrambleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Menu display words system
    const menuWordRef = useRef<{ word: string; startCol: number; startRow: number; visibleUntil: number } | null>(null);
    const lastMenuWordTimeRef = useRef<number>(0);
    
    // Use palette colors if provided, otherwise use glitchColors prop, otherwise default
    const activePalette = palette || getPalette(DEFAULT_PALETTE_ID);
    const defaultColors = glitchColors || activePalette.glitchColors;
    const originalColorsRef = useRef<string[]>(defaultColors);

    // Store sizing in refs so they can be accessed in closures
    // Always get fresh sizing based on palette difficulty and level (updates every 10 levels on boss levels)
    const getCurrentSizing = () => getTextSizingForDifficulty(activePalette.difficulty, level.level);
    const sizingRef = useRef(getCurrentSizing());
    
    // Update sizing when palette difficulty or level changes
    useEffect(() => {
      const newSizing = getCurrentSizing();
      sizingRef.current = newSizing;
      // Reset letters when level changes to ensure clean state
      // Note: initializeLetters is stable (useCallback with empty deps), so we can call it safely
      if (colsRef.current > 0 && rowsRef.current > 0) {
        initializeLetters();
      }
      // Force canvas to update by triggering a resize
      if (canvasRef.current && containerRef.current) {
        // Small delay to ensure canvas is ready
        setTimeout(() => {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }, 50);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePalette.difficulty, level.level]); // initializeLetters is stable, no need to include

    const colsRef = useRef<number>(0);
    const rowsRef = useRef<number>(0);
    
    // Initialize letters function - defined early so it can be used in useEffect
    // Note: updateWordsInLetters is called separately via useEffect when words change
    const initializeLetters = useCallback(() => {
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const letters: Letter[] = [];

      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω';
      
      // Use current palette colors from ref (always up-to-date)
      const colors = originalColorsRef.current;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const char = characters[Math.floor(Math.random() * characters.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];

          letters.push({
            char,
            color,
            targetColor: color,
            colorProgress: 1,
            offsetX: 0,
            offsetY: 0,
            targetOffsetX: 0,
            targetOffsetY: 0,
            offsetProgress: 1,
            isFrozen: false,
            isVisibleWord: false,
          });
        }
      }

      lettersRef.current = letters;
      // updateWordsInLetters will be called separately via useEffect when words are available
    }, []); // Empty deps - only uses refs which are stable
    
    // Update current palette for getWordColor function and original colors
    useEffect(() => {
      const newColors = palette 
        ? palette.glitchColors 
        : (glitchColors || activePalette.glitchColors);
      
      if (palette) {
        currentPalette = palette;
      }
      
      originalColorsRef.current = newColors;
      
      // Reinitialize letters to use new colors when palette changes
      if (lettersRef.current.length > 0) {
        const letters = lettersRef.current;
        letters.forEach(letter => {
          if (!letter.isFrozen) {
            // Update both current and target color to new palette colors
            const newColor = newColors[Math.floor(Math.random() * newColors.length)];
            letter.color = newColor;
            letter.targetColor = newColor;
            letter.colorProgress = 1; // Set to 1 so it's immediately visible
          }
        });
      }
    }, [palette, glitchColors, activePalette]);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      contextRef.current = ctx;
      
      // Ensure sizing is up-to-date for current palette difficulty and level (recalculate to be absolutely sure)
      const currentSizing = getTextSizingForDifficulty(activePalette.difficulty, level.level);
      sizingRef.current = currentSizing;

      // Debounce resize for better performance on mobile
      let resizeTimeout: NodeJS.Timeout | null = null;
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        // Limit canvas size for mobile performance (max 2x device pixel ratio)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        // Use actual container dimensions (CSS pixels)
        // Ensure we get accurate dimensions that account for safe areas
        // Round to avoid subpixel rendering issues
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));

        // Set canvas internal resolution (device pixels)
        // Ensure dimensions are integers to avoid rendering issues
        const canvasWidth = Math.floor(width * dpr);
        const canvasHeight = Math.floor(height * dpr);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // Set canvas display size (CSS pixels)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Set transform to scale drawing by DPR
        // This allows us to work in logical CSS pixel coordinates
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Get current sizing (always recalculate to ensure it's correct for current palette difficulty and level)
        const currentSizing = getTextSizingForDifficulty(activePalette.difficulty, level.level);
        sizingRef.current = currentSizing;
        
        // Store logical dimensions for calculations (use dynamic sizing)
        colsRef.current = Math.floor(width / currentSizing.charWidth);
        rowsRef.current = Math.floor(height / currentSizing.charHeight);

        initializeLetters();
      };

      const debouncedResize = () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          resizeCanvas();
        }, 150); // Debounce resize events
      };

      // Initial resize to set up canvas
      resizeCanvas();
      
      // Small delay to ensure canvas is fully initialized before drawing
      setTimeout(() => {
        if (canvas && container) {
          resizeCanvas();
        }
      }, 100);
      
      // Handle window resize
      window.addEventListener('resize', debouncedResize);
      
      // Handle orientation change with a slight delay to allow viewport to update
      const handleOrientationChange = () => {
        setTimeout(() => {
          resizeCanvas();
        }, 200);
      };
      window.addEventListener('orientationchange', handleOrientationChange);
      
      // Handle visual viewport changes (important for mobile browsers with dynamic UI)
      if (window.visualViewport) {
        const handleVisualViewportResize = () => {
          resizeCanvas();
        };
        window.visualViewport.addEventListener('resize', handleVisualViewportResize);
        
        return () => {
          window.removeEventListener('resize', debouncedResize);
          window.removeEventListener('orientationchange', handleOrientationChange);
          window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
          if (resizeTimeout) clearTimeout(resizeTimeout);
        };
      }

      return () => {
        window.removeEventListener('resize', debouncedResize);
        window.removeEventListener('orientationchange', handleOrientationChange);
        if (resizeTimeout) clearTimeout(resizeTimeout);
      };
    }, [activePalette.difficulty, initializeLetters, activePalette, level.level]); // Reinitialize when palette difficulty or level changes


    // Update letters with word positions
    const updateWordsInLetters = () => {
      const letters = lettersRef.current;
      const cols = colsRef.current;

      // First, reset visible word flags for all letters (but preserve menu words)
      letters.forEach(letter => {
        // Only reset if it's not a menu word
        const isMenuWord = menuDisplayWords && letter.visibleWordText && 
                          menuDisplayWords.includes(letter.visibleWordText) &&
                          !words.some(w => w.word === letter.visibleWordText);
        if (!isMenuWord) {
          letter.isVisibleWord = false;
          letter.visibleWordText = undefined;
        }
      });

      // Reset frozen state for non-found words
      letters.forEach(letter => {
        // Only reset if not part of a found word
        const isPartOfFoundWord = words.some(w => 
          w.found && letter.frozenText === w.word
        );
        if (!isPartOfFoundWord) {
          letter.isFrozen = false;
          letter.frozenText = undefined;
        }
      });

      // Mark letters that are part of words
      words.forEach(word => {
        if (word.found) {
          // Found words - freeze these letters but keep others animating
          // Use palette's hidden word color for found words (slightly brighter)
          const foundColor = activePalette.hiddenWordColor;
          for (let i = 0; i < word.word.length; i++) {
            const index = word.startRow * cols + (word.startCol + i);
            if (index >= 0 && index < letters.length) {
              letters[index].isFrozen = true;
              letters[index].frozenText = word.word;
              letters[index].char = word.word[i];
              letters[index].color = foundColor;
              letters[index].targetColor = foundColor;
              letters[index].colorProgress = 1;
              letters[index].isVisibleWord = false; // Found words are frozen, not visible words
            }
          }
        } else if (word.isVisible) {
          // Visible words - use vibrant color that blends with glitch but stands out when visible
          const baseColor = getWordColor();
          let vibrantColor = getVibrantColor(level.level, baseColor);
          
          // Fake words use a slightly different color (more red/orange tint) to subtly hint they're fake
          if (word.isFake) {
            // getVibrantColor returns a hex string, so parse it and modify
            const rgb = hexToRgb(vibrantColor);
            if (rgb) {
              // Add red tint and make slightly darker/more muted
              rgb.r = Math.min(255, rgb.r + 30);
              rgb.g = Math.max(0, rgb.g - 15);
              rgb.b = Math.max(0, rgb.b - 15);
              vibrantColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
            } else {
              // If parsing failed, try to parse as RGB string directly
              const rgbMatch = vibrantColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
              if (rgbMatch) {
                const r = Math.min(255, parseInt(rgbMatch[1]) + 30);
                const g = Math.max(0, parseInt(rgbMatch[2]) - 15);
                const b = Math.max(0, parseInt(rgbMatch[3]) - 15);
                vibrantColor = `rgb(${r},${g},${b})`;
              }
            }
          }
          
          for (let i = 0; i < word.word.length; i++) {
            const index = word.startRow * cols + (word.startCol + i);
            if (index >= 0 && index < letters.length && !letters[index].isFrozen) {
              letters[index].char = word.word[i];
              letters[index].color = vibrantColor;
              letters[index].targetColor = vibrantColor;
              letters[index].colorProgress = 1;
              letters[index].isVisibleWord = true; // Mark as part of visible word
              letters[index].visibleWordText = word.word; // Track which word
            }
          }
        }
      });
    };

    useEffect(() => {
      updateWordsInLetters();
    }, [words]);

    // Color interpolation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const interpolateColor = (
      start: { r: number; g: number; b: number },
      end: { r: number; g: number; b: number },
      factor: number
    ) => {
      return `rgb(${Math.round(start.r + (end.r - start.r) * factor)}, ${Math.round(
        start.g + (end.g - start.g) * factor
      )}, ${Math.round(start.b + (end.b - start.b) * factor)})`;
    };

    // Update letters
    const updateLetters = () => {
      const letters = lettersRef.current;
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateRef.current;

      if (isPaused || timeSinceLastUpdate < level.glitchSpeed) {
        return;
      }

      lastUpdateRef.current = now;

      // First, ensure active words stay visible
      updateWordsInLetters();

      // Handle menu display words (for menu screen only)
      if (menuDisplayWords && menuDisplayWords.length > 0) {
        const cols = colsRef.current;
        const rows = rowsRef.current;
        const currentMenuWord = menuWordRef.current;
        
        // Check if current menu word has expired
        if (currentMenuWord && now > currentMenuWord.visibleUntil) {
          menuWordRef.current = null;
        }
        
        // Randomly show a new menu word (every 3-6 seconds)
        if (!currentMenuWord && now - lastMenuWordTimeRef.current > 3000) {
          const randomWord = menuDisplayWords[Math.floor(Math.random() * menuDisplayWords.length)];
          // Calculate actual length (excluding spaces for positioning)
          const wordLength = randomWord.replace(/\s/g, '').length;
          
          // Find a valid position (avoid center, ensure word fits)
          if (wordLength <= cols && rows > 0) {
            const maxCol = cols - wordLength;
            const centerCol = cols / 2;
            const centerRow = rows / 2;
            const avoidRadius = Math.min(cols, rows) * 0.25;
            
            let attempts = 0;
            let foundPosition = false;
            
            while (attempts < 50 && !foundPosition) {
              const col = Math.floor(Math.random() * (maxCol + 1));
              const row = Math.floor(Math.random() * rows);
              
              // Check if position is not too close to center
              const distFromCenter = Math.sqrt(
                Math.pow(col + wordLength / 2 - centerCol, 2) + Math.pow(row - centerRow, 2)
              );
              
              if (distFromCenter > avoidRadius) {
                menuWordRef.current = {
                  word: randomWord,
                  startCol: col,
                  startRow: row,
                  visibleUntil: now + 2000 + Math.random() * 2000, // Visible for 2-4 seconds
                };
                lastMenuWordTimeRef.current = now;
                foundPosition = true;
              }
              attempts++;
            }
          }
        }
        
        // Update letters for current menu word
        if (currentMenuWord) {
          const menuWordColor = activePalette.hiddenWordColor || '#ffdc42';
          let colOffset = 0;
          for (let i = 0; i < currentMenuWord.word.length; i++) {
            const char = currentMenuWord.word[i];
            // Skip spaces (they don't take up a grid position)
            if (char === ' ') {
              colOffset++;
              continue;
            }
            
            const col = currentMenuWord.startCol + i - colOffset;
            if (col >= 0 && col < cols && currentMenuWord.startRow >= 0 && currentMenuWord.startRow < rows) {
              const index = currentMenuWord.startRow * cols + col;
              if (index >= 0 && index < letters.length) {
                const letter = letters[index];
                // Only update if not part of a game word
                if (!letter.isFrozen && (!letter.isVisibleWord || letter.visibleWordText === currentMenuWord.word)) {
                  letter.char = char;
                  letter.color = menuWordColor;
                  letter.targetColor = menuWordColor;
                  letter.colorProgress = 1;
                  letter.isVisibleWord = true;
                  letter.visibleWordText = currentMenuWord.word;
                }
              }
            }
          }
        } else {
          // Clear any expired menu word letters
          letters.forEach(letter => {
            if (letter.isVisibleWord && letter.visibleWordText && 
                (menuDisplayWords?.includes(letter.visibleWordText) || false)) {
              // Check if this was a menu word (not a game word)
              if (!words.some(w => w.word === letter.visibleWordText)) {
                letter.isVisibleWord = false;
                letter.visibleWordText = undefined;
              }
            }
          });
        }
      }

      // Reduce update rate on mobile for better performance
      const isMobile = window.innerWidth <= 768;
      const baseUpdateRate = glitchStateRef.current === 'intense' ? 0.3 : level.letterUpdateRate;
      const updateRate = isMobile ? baseUpdateRate * 0.7 : baseUpdateRate; // 30% fewer updates on mobile
      const updateCount = Math.max(1, Math.floor(letters.length * updateRate));

      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω';
      const colors = originalColorsRef.current;

      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length);
        const letter = letters[index];

        // Skip frozen letters (found words)
        if (letter.isFrozen) continue;
        
        // Skip letters that are part of visible words - they must stay visible
        if (letter.isVisibleWord) continue;

        letter.char = characters[Math.floor(Math.random() * characters.length)];
        letter.targetColor = colors[Math.floor(Math.random() * colors.length)];
        letter.colorProgress = 0;
      }
    };

    // Draw letters
    const drawLetters = () => {
      const ctx = contextRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      // Get logical dimensions (CSS pixel size, not device pixels)
      // Canvas internal size is width*dpr, but style size is width
      // Context transform scales by DPR, so we work in logical pixels
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Safety check: ensure canvas has valid dimensions
      if (width <= 0 || height <= 0 || canvas.width <= 0 || canvas.height <= 0) {
        return;
      }
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      // Clear the entire canvas (in device pixel coordinates)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Optimize canvas rendering for smooth text on mobile
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Get current sizing - always recalculate from current palette difficulty and level to ensure it's correct
      const currentSizing = getTextSizingForDifficulty(activePalette.difficulty, level.level);
      sizingRef.current = currentSizing; // Update ref for other uses
      const charWidth = currentSizing.charWidth;
      const charHeight = currentSizing.charHeight;
      const fontSize = currentSizing.fontSize;
      
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const letters = lettersRef.current;
      const cols = colsRef.current;

      // Draw non-frozen, non-visible-word letters (regular glitch letters with vortex)
      letters.forEach((letter, index) => {
        if (letter.isFrozen) return; // Skip found words
        // Skip visible hidden words (drawn separately) - they're drawn in the visible words section
        if (letter.isVisibleWord) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        const baseX = col * charWidth;
        const baseY = row * charHeight;

        // Vortex effect
        const dx = baseX - centerX;
        const dy = baseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDistance = distance / maxDistance;

        const vortexStrength =
          normalizedDistance < 0.5
            ? Math.pow(1 - normalizedDistance / 0.5, 2) * level.vortexStrength
            : 0;

        const vortexPull = vortexStrength * 1.2;
        const angle = Math.atan2(dy, dx);
        const rotation = normalizedDistance * 0.3;

        const vortexX = -Math.cos(angle + rotation) * vortexPull * charWidth;
        const vortexY = -Math.sin(angle + rotation) * vortexPull * charHeight;

        const x = baseX + letter.offsetX + vortexX;
        const y = baseY + letter.offsetY + vortexY;

        // Fade and shrink near center
        const opacity = 1 - vortexStrength * 0.5;
        const scale = 1 - vortexStrength * 0.3;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.scale(scale, scale);
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x / scale, y / scale);
        ctx.restore();
      });

      // Draw visible words - enhanced visibility with background boxes and outlines
      const now = Date.now();
      words.forEach(word => {
        if (word.found || !word.isVisible) return;
        
        const baseColor = getWordColor();
        const vibrantColor = getVibrantColor(level.level, baseColor);
        const glowProps = getGlowProperties(level.level);
        
        // Check if word is clickable and calculate remaining time
        const isClickable = word.clickableAt && word.clickableUntil && 
                           now >= word.clickableAt && now <= word.clickableUntil;
        const timeRemaining = isClickable && word.clickableUntil 
          ? Math.max(0, (word.clickableUntil - now) / 1000) 
          : 0;
        
        // Pulsing effect when clickable (more intense as time runs out)
        const pulsePhase = (now % 1000) / 1000; // 0 to 1 over 1 second
        const pulseIntensity = isClickable 
          ? 0.8 + 0.2 * Math.sin(pulsePhase * Math.PI * 2) 
          : 1.0;
        const urgencyPulse = timeRemaining < 1.0 
          ? 1.0 + 0.3 * (1.0 - timeRemaining) // More intense pulse when < 1 second
          : 1.0;
        
        // Calculate word bounding box for background
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const wordPositions: { x: number; y: number; index: number }[] = [];
        
        // First pass: collect positions and calculate bounds
        // Validate word position is within bounds
        const currentRows = rowsRef.current;
        if (word.startCol < 0 || word.startCol + word.word.length > cols ||
            word.startRow < 0 || word.startRow >= currentRows) {
          return; // Skip words that are out of bounds
        }
        
        for (let i = 0; i < word.word.length; i++) {
          const index = word.startRow * cols + (word.startCol + i);
          if (index < 0 || index >= letters.length) continue;
          
          const letter = letters[index];
          // Skip if letter is frozen (found word) or not part of this visible word
          if (letter.isFrozen || !letter.isVisibleWord || letter.visibleWordText !== word.word) continue;
          
          const col = index % cols;
          const row = Math.floor(index / cols);
          const baseX = col * charWidth;
          const baseY = row * charHeight;
          
          // Apply vortex to visible words, but less strongly
          const dx = baseX - centerX;
          const dy = baseY - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const normalizedDistance = distance / maxDistance;
          const vortexStrength = normalizedDistance < 0.5
            ? Math.pow(1 - normalizedDistance / 0.5, 2) * level.vortexStrength * 0.2
            : 0;
          const vortexPull = vortexStrength * 0.3;
          const angle = Math.atan2(dy, dx);
          const rotation = normalizedDistance * 0.1;
          const vortexX = -Math.cos(angle + rotation) * vortexPull * charWidth;
          const vortexY = -Math.sin(angle + rotation) * vortexPull * charHeight;

          const x = baseX + letter.offsetX + vortexX;
          const y = baseY + letter.offsetY + vortexY;
          
          wordPositions.push({ x, y, index });
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x + charWidth);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y + charHeight);
        }
        
        // Draw background box for the entire word (subtle dark background with glow)
        if (wordPositions.length > 0) {
          const padding = 4;
          const boxX = minX - padding;
          const boxY = minY - padding;
          const boxWidth = (maxX - minX) + (padding * 2);
          const boxHeight = (maxY - minY) + (padding * 2);
          
          // Convert vibrant color to rgba for background
          const hex = vibrantColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          
          // Enhanced pulsing background when clickable
          const bgAlpha = isClickable 
            ? 0.2 + 0.1 * pulseIntensity * urgencyPulse
            : 0.15;
          
          // Draw background box with subtle glow (pulsing when clickable)
          ctx.save();
          ctx.globalAlpha = bgAlpha;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.25 * pulseIntensity * urgencyPulse})`;
          ctx.shadowBlur = isClickable ? 20 * urgencyPulse : 15;
          ctx.shadowColor = vibrantColor;
          ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
          ctx.restore();
          
          // Draw border outline around word (pulsing when clickable)
          ctx.save();
          ctx.strokeStyle = vibrantColor;
          ctx.lineWidth = isClickable ? 2 * urgencyPulse : 1.5;
          ctx.globalAlpha = Math.max(0.4, Math.min(0.9, glowProps.opacity * 0.8 * pulseIntensity * urgencyPulse));
          ctx.shadowBlur = isClickable ? 12 * urgencyPulse : 8;
          ctx.shadowColor = vibrantColor;
          ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          ctx.restore();
          
          // Draw countdown timer above word when clickable
          if (isClickable && timeRemaining > 0) {
            const timerText = timeRemaining.toFixed(1) + 's';
            const timerX = boxX + boxWidth / 2;
            const timerY = boxY - 20;
            
            // Timer background
            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 0, 0.7)`;
            ctx.fillRect(timerX - 25, timerY - 8, 50, 16);
            ctx.restore();
            
            // Timer text with color based on urgency
            const timerColor = timeRemaining < 1.0 
              ? '#ff3333' // Red when < 1 second
              : timeRemaining < 2.0 
                ? '#ffaa00' // Orange when < 2 seconds
                : vibrantColor; // Normal color
            
            ctx.save();
            ctx.fillStyle = timerColor;
            ctx.font = `bold ${Math.max(10, fontSize * 0.6)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 5;
            ctx.shadowColor = timerColor;
            ctx.fillText(timerText, timerX, timerY);
            ctx.restore();
          }
        }
        
        // Second pass: draw each letter with enhanced styling
        wordPositions.forEach(({ x, y, index }) => {
          const letter = letters[index];
          
          // Enhanced pulsing glow when clickable
          const effectiveGlowBlur = isClickable 
            ? glowProps.shadowBlur * urgencyPulse * pulseIntensity
            : glowProps.shadowBlur;
          const effectiveOpacity = isClickable
            ? glowProps.opacity * pulseIntensity * urgencyPulse
            : glowProps.opacity;
          
          // Multi-layer glow effect for vibrant appearance (enhanced when clickable)
          if (glowProps.layers >= 4) {
            ctx.save();
            ctx.shadowBlur = Math.max(0, effectiveGlowBlur * (glowProps.intensityMultiplier || 1.0) * 1.2);
            ctx.shadowColor = vibrantColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = Math.max(0, Math.min(1, effectiveOpacity * 0.2));
            ctx.fillStyle = vibrantColor;
            ctx.font = `bold ${fontSize}px monospace`; // Bold for better visibility
            ctx.fillText(letter.char, x, y);
            ctx.restore();
          }
          
          if (glowProps.layers >= 3) {
            ctx.save();
            ctx.shadowBlur = Math.max(0, effectiveGlowBlur * (glowProps.intensityMultiplier || 1.0));
            ctx.shadowColor = vibrantColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = Math.max(0, Math.min(1, effectiveOpacity * 0.3));
            ctx.fillStyle = vibrantColor;
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.fillText(letter.char, x, y);
            ctx.restore();
          }
          
          if (glowProps.layers >= 2) {
            ctx.save();
            ctx.shadowBlur = Math.max(0, glowProps.shadowBlurInner * urgencyPulse);
            ctx.shadowColor = vibrantColor;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = Math.max(0, Math.min(1, effectiveOpacity * 0.6));
            ctx.fillStyle = vibrantColor;
            ctx.font = `bold ${fontSize}px monospace`;
            ctx.fillText(letter.char, x, y);
            ctx.restore();
          }
          
          // Main letter with inner glow and bold styling (pulsing when clickable)
          ctx.save();
          ctx.shadowBlur = Math.max(0, glowProps.shadowBlurInner * 0.5 * urgencyPulse);
          ctx.shadowColor = vibrantColor;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.globalAlpha = Math.max(0, Math.min(1, effectiveOpacity));
          ctx.fillStyle = vibrantColor;
          ctx.font = `bold ${fontSize}px monospace`; // Bold font for better visibility
          ctx.fillText(letter.char, x, y);
          ctx.restore();
        });
      });

      // Draw frozen letters (found words - no vortex, with glow)
      letters.forEach((letter, index) => {
        if (!letter.isFrozen) return;

        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * charWidth + letter.offsetX;
        const y = row * charHeight + letter.offsetY;

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = letter.color;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
        ctx.restore();
      });
    };

    // Smooth transitions
    const handleSmoothTransitions = () => {
      const letters = lettersRef.current;
      let needsRedraw = false;

      letters.forEach(letter => {
        // Color transition
        if (letter.colorProgress < 1) {
          letter.colorProgress += 0.05;
          if (letter.colorProgress > 1) letter.colorProgress = 1;

          const startRgb = hexToRgb(letter.color);
          const endRgb = hexToRgb(letter.targetColor);
          if (startRgb && endRgb) {
            letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
            needsRedraw = true;
          }
        }

        // Position transition
        if (letter.offsetProgress < 1) {
          letter.offsetProgress += 0.02;
          if (letter.offsetProgress > 1) letter.offsetProgress = 1;

          letter.offsetX +=
            (letter.targetOffsetX - letter.offsetX) * 0.1;
          letter.offsetY +=
            (letter.targetOffsetY - letter.offsetY) * 0.1;
          needsRedraw = true;
        }
      });

      return needsRedraw;
    };

    // Animation loop - always running
    const animate = () => {
      // Always update word positions first to ensure visible words stay visible
      updateWordsInLetters();
      
      if (!isPaused) {
        updateLetters();
      }

      handleSmoothTransitions();
      // Always redraw to keep animation smooth
      drawLetters();

      animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
      animate();
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isPaused, level]);

    // Unified click/touch handler - works for both mouse and touch
    const handlePointer = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || isPaused) return;

      const rect = canvas.getBoundingClientRect();
      // Calculate coordinates in CSS pixel space (logical coordinates)
      // Canvas internal resolution is width*dpr, but display size is width
      // Since context transform scales by DPR, we work in logical CSS pixel coordinates
      const clickX = (clientX - rect.left);
      const clickY = (clientY - rect.top);

      // Exclude UI areas from click detection (in logical pixel space)
      // Use responsive exclusion zones based on screen width
      const width = window.innerWidth || 800;
      let topExclusion = 120; // Default desktop
      let bottomExclusion = 200; // Default desktop
      
      if (width <= 360) {
        // Small mobile devices
        topExclusion = 80;
        bottomExclusion = 120;
      } else if (width <= 480) {
        // Mobile devices
        topExclusion = 90;
        bottomExclusion = 140;
      } else if (width <= 768) {
        // Tablet devices
        topExclusion = 100;
        bottomExclusion = 180;
      }
      
      const canvasHeight = rect.height;
      
      if (clickY < topExclusion || clickY > canvasHeight - bottomExclusion) {
        return; // Click is in UI area, ignore
      }

      // Get current sizing (always up-to-date from ref)
      const currentSizing = sizingRef.current;
      const charWidth = currentSizing.charWidth;
      const charHeight = currentSizing.charHeight;
      
      const paddingX = charWidth * 2;
      const paddingY = charHeight * 2;

      // Check all visible words to see if click is on any word
      // Track whether we found a clickable word
      let foundClickableWord = false;
      
      for (const word of words) {
        if (!word.isVisible || word.found) continue; // Only check visible, unfound words
        
        const textStartX = word.startCol * charWidth - paddingX;
        const textEndX = (word.startCol + word.word.length) * charWidth + paddingX;
        const textStartY = word.startRow * charHeight - paddingY;
        const textEndY = (word.startRow + 1) * charHeight + paddingY;

        // Check if click is within this word's bounds
        if (
          clickX >= textStartX &&
          clickX <= textEndX &&
          clickY >= textStartY &&
          clickY <= textEndY
        ) {
          // Check if this is a fake word
          if (word.isFake) {
            // Fake word clicked - always count as a miss/penalty
            // Pass the word text with a special flag (prepend with special marker)
            onWordFound('FAKE:' + word.word, false);
            foundClickableWord = true;
            break;
          }
          
          // Check if word is currently clickable
          const now = Date.now();
          const isClickable = word.clickableAt && word.clickableUntil && 
                             now >= word.clickableAt && now <= word.clickableUntil;
          
          if (isClickable) {
            // Correct click - word is clickable and not fake
            onWordFound(word.word, true);
            foundClickableWord = true;
          } else {
            // Miss - clicked on word but it's not clickable (too early/late)
            onWordFound(word.word, false);
            foundClickableWord = true;
          }
          break;
        }
      }
      
      // If no word was clicked, it's a miss
      if (!foundClickableWord) {
        onWordFound('', false);
      }
    };

    // Mouse click handler
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handlePointer(e.clientX, e.clientY);
    };

    // Touch support - optimized for mobile
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;
      handlePointer(touch.clientX, touch.clientY);
    };
    
    // Prevent default touch behaviors to avoid scrolling/zooming
    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
    };
    
    const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      // Handle touch end as well for better mobile support
      const touch = e.changedTouches[0];
      if (touch) {
        handlePointer(touch.clientX, touch.clientY);
      }
    };

    // Imperative handle
    useImperativeHandle(ref, () => ({
      triggerIntenseGlitch: (colors?: string[], duration = 300) => {
        if (colors) originalColorsRef.current = colors;
        glitchStateRef.current = 'intense';
        glitchEndTimeRef.current = Date.now() + duration;

        const letters = lettersRef.current;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω';
        letters.forEach(letter => {
          if (!letter.isFrozen) {
            letter.char = characters[Math.floor(Math.random() * characters.length)];
            letter.targetColor = originalColorsRef.current[Math.floor(Math.random() * originalColorsRef.current.length)];
            letter.colorProgress = 0;
          }
        });

        setTimeout(() => {
          if (glitchStateRef.current === 'intense') {
            glitchStateRef.current = 'normal';
            // Reset to palette colors or provided glitchColors
            const resetColors = palette 
              ? palette.glitchColors 
              : (glitchColors || activePalette.glitchColors);
            originalColorsRef.current = resetColors;
            // Update letters to use reset colors
            const letters = lettersRef.current;
            letters.forEach(letter => {
              if (!letter.isFrozen) {
                letter.targetColor = resetColors[Math.floor(Math.random() * resetColors.length)];
                letter.colorProgress = 0;
              }
            });
          }
        }, duration);
      },
      triggerHoverGlitch: (colors?: string[], duration = 800) => {
        if (colors) {
          originalColorsRef.current = colors;
        } else {
          // Use current palette colors if no colors provided
          const hoverColors = palette 
            ? palette.glitchColors 
            : (glitchColors || activePalette.glitchColors);
          originalColorsRef.current = hoverColors;
        }
        glitchStateRef.current = 'hover';
        glitchEndTimeRef.current = Date.now() + duration;

        const letters = lettersRef.current;
        const currentSizing = sizingRef.current;
        letters.forEach(letter => {
          if (!letter.isFrozen) {
            letter.targetOffsetX = (Math.random() - 0.5) * currentSizing.charWidth * 4;
            letter.targetOffsetY = (Math.random() - 0.5) * currentSizing.charHeight * 4;
            letter.offsetProgress = 0;
          }
        });

        setTimeout(() => {
          if (glitchStateRef.current === 'hover') {
            glitchStateRef.current = 'normal';
            // Reset to palette colors
            const resetColors = palette 
              ? palette.glitchColors 
              : (glitchColors || activePalette.glitchColors);
            originalColorsRef.current = resetColors;
            const letters = lettersRef.current;
            letters.forEach(letter => {
              letter.targetOffsetX = 0;
              letter.targetOffsetY = 0;
              letter.offsetProgress = 0;
            });
          }
        }, duration);
      },
      stopHoverGlitch: () => {
        glitchStateRef.current = 'normal';
        const letters = lettersRef.current;
        letters.forEach(letter => {
          letter.targetOffsetX = 0;
          letter.targetOffsetY = 0;
          letter.offsetProgress = 0;
        });
      },
      triggerWordScramble: (duration = 500) => {
        // Clear any existing scramble timeout
        if (scrambleTimeoutRef.current) {
          clearTimeout(scrambleTimeoutRef.current);
        }
        
        // Scramble effect: scatter letters with character changes
        // This disrupts word perception without affecting frozen (found) words
        // Use 'intense' state to allow continuous scrambling during effect
        glitchStateRef.current = 'intense';
        glitchEndTimeRef.current = Date.now() + duration;

        const letters = lettersRef.current;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789Ω';
        const scrambleIntensity = 8; // Character widths to scatter (stronger than hover)
        const currentSizing = sizingRef.current;

        letters.forEach(letter => {
          // Only scramble non-frozen letters (don't affect found words)
          if (!letter.isFrozen) {
            // Scramble character immediately
            letter.char = characters[Math.floor(Math.random() * characters.length)];
            
            // Scramble color
            letter.targetColor = originalColorsRef.current[Math.floor(Math.random() * originalColorsRef.current.length)];
            letter.colorProgress = 0;
            
            // Scatter position - random offset in all directions
            // Stronger scatter than hover glitch for more disorienting effect
            letter.targetOffsetX = (Math.random() - 0.5) * currentSizing.charWidth * scrambleIntensity;
            letter.targetOffsetY = (Math.random() - 0.5) * currentSizing.charHeight * scrambleIntensity;
            letter.offsetProgress = 0;
          }
        });

        // Reset after duration - smoothly return letters to normal positions
        scrambleTimeoutRef.current = setTimeout(() => {
          // Only reset if we're still in intense state (scramble state)
          if (glitchStateRef.current === 'intense') {
            glitchStateRef.current = 'normal';
            
            // Reset to palette colors
            const resetColors = palette 
              ? palette.glitchColors 
              : (glitchColors || activePalette.glitchColors);
            originalColorsRef.current = resetColors;
            
            const letters = lettersRef.current;
            letters.forEach(letter => {
              // Reset position offsets smoothly (will animate back to 0)
              // Visible word characters will be restored by updateWordsInLetters on next frame
              if (!letter.isFrozen) {
                letter.targetOffsetX = 0;
                letter.targetOffsetY = 0;
                letter.offsetProgress = 0;
                
                // Reset color to palette
                letter.targetColor = resetColors[Math.floor(Math.random() * resetColors.length)];
                letter.colorProgress = 0;
              }
            });
          }
          scrambleTimeoutRef.current = null;
        }, duration);
      },
      resetToNormal: () => {
        glitchStateRef.current = 'normal';
        // Reset to palette colors or provided glitchColors
        const resetColors = palette 
          ? palette.glitchColors 
          : (glitchColors || activePalette.glitchColors);
        originalColorsRef.current = resetColors;
        const letters = lettersRef.current;
        letters.forEach(letter => {
          if (!letter.isFrozen) {
            letter.targetOffsetX = 0;
            letter.targetOffsetY = 0;
            letter.offsetProgress = 0;
            letter.targetColor = resetColors[Math.floor(Math.random() * resetColors.length)];
            letter.colorProgress = 0;
          }
        });
      },
      getCanvasDimensions: () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return null;
        
        const rect = container.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          cols: colsRef.current,
          rows: rowsRef.current,
        };
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 1,
          /* Ensure container fills parent correctly */
          boxSizing: 'border-box',
        }}
      >
        <canvas
          key={`canvas-${activePalette.difficulty}-${activePalette.id}-${level.level}`}
          ref={canvasRef}
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            // Hardware acceleration for smooth rendering
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            willChange: 'contents',
            // Ensure proper rendering on mobile
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
        {/* Center vignette - reduced opacity to show glitch in center */}
        {level.vortexStrength > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        )}
        {/* Outer vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 75%, rgba(0,0,0,0.6) 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      </div>
    );
  }
);

LetterGlitch.displayName = 'LetterGlitch';

export default LetterGlitch;

