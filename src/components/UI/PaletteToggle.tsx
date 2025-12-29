'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ColorPalette, getPalette, getNextPalette, getNextPaletteByDifficulty, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
import { generateAdaptiveColorSet, interpolateColor } from '@/lib/colorUtils';
import { PaletteIcon } from './GameIcons';
import styles from './PaletteToggle.module.css';

interface PaletteToggleProps {
  currentPaletteId: string;
  onPaletteChange: (paletteId: string) => void;
  compact?: boolean; // For game screen top bar
}

export default function PaletteToggle({
  currentPaletteId,
  onPaletteChange,
  compact = false,
}: PaletteToggleProps) {
  const currentPalette = getPalette(currentPaletteId);
  
  // Dynamic color animation for all palettes
  const [animatedColor, setAnimatedColor] = useState<string>(currentPalette.hiddenWordColor);
  const adaptiveColorsRef = useRef<string[]>([]);
  const currentColorIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Initialize adaptive colors for all palettes
  useEffect(() => {
    adaptiveColorsRef.current = generateAdaptiveColorSet(
      currentPalette.hiddenWordColor,
      currentPalette.glitchColors,
      currentPalette.difficulty
    );
    currentColorIndexRef.current = 0;
    setAnimatedColor(adaptiveColorsRef.current[0]);
    lastUpdateTimeRef.current = Date.now();
  }, [currentPaletteId, currentPalette.hiddenWordColor, currentPalette.glitchColors, currentPalette.difficulty]);

  // Animation loop for all palettes
  useEffect(() => {
    if (adaptiveColorsRef.current.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const timeSinceLastChange = now - lastUpdateTimeRef.current;
      
      // Difficulty-specific change intervals (slower than in-game for smooth preview)
      const getChangeInterval = () => {
        switch (currentPalette.difficulty) {
          case 'easy':
            return 2000 + Math.random() * 500; // 2-2.5 seconds
          case 'average':
            return 2500 + Math.random() * 500; // 2.5-3 seconds
          case 'hard':
          default:
            return 2500 + Math.random() * 500; // 2.5-3 seconds
        }
      };
      
      const changeInterval = getChangeInterval();
      
      if (timeSinceLastChange >= changeInterval) {
        // Move to next color
        currentColorIndexRef.current = (currentColorIndexRef.current + 1) % adaptiveColorsRef.current.length;
        lastUpdateTimeRef.current = now;
      }
      
      // Calculate transition progress (smooth over 1 second)
      const transitionDuration = 1000;
      const transitionProgress = Math.min(1, timeSinceLastChange / transitionDuration);
      
      // Get current and next colors
      const currentIndex = currentColorIndexRef.current;
      const nextIndex = (currentIndex + 1) % adaptiveColorsRef.current.length;
      const currentColor = adaptiveColorsRef.current[currentIndex];
      const nextColor = adaptiveColorsRef.current[nextIndex];
      
      // Interpolate between colors for smooth transition
      const interpolatedColor = interpolateColor(currentColor, nextColor, transitionProgress);
      setAnimatedColor(interpolatedColor);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [currentPaletteId, currentPalette.difficulty]);

  // Organize palettes by difficulty
  const palettesByDifficulty = useMemo(() => {
    const grouped: Record<PaletteDifficulty, ColorPalette[]> = {
      easy: [],
      average: [],
      hard: [],
    };
    
    COLOR_PALETTES.forEach(palette => {
      grouped[palette.difficulty].push(palette);
    });
    
    return grouped;
  }, []);

  const getDifficultyLabel = (difficulty: PaletteDifficulty): string => {
    switch (difficulty) {
      case 'easy':
        return 'Easy';
      case 'average':
        return 'Average';
      case 'hard':
        return 'Hard';
      default:
        return '';
    }
  };

  const handleCycle = () => {
    // In compact mode, cycle by difficulty; otherwise cycle normally
    const nextPalette = compact 
      ? getNextPaletteByDifficulty(currentPaletteId)
      : getNextPalette(currentPaletteId);
    onPaletteChange(nextPalette.id);
  };

  // Separate component for palette option to manage individual animations
  const PaletteOption = ({ 
    palette, 
    isActive, 
    onSelect, 
    isHard 
  }: { 
    palette: ColorPalette; 
    isActive: boolean; 
    onSelect: (id: string) => void;
    isHard: boolean;
  }) => {
    const [animatedColor, setAnimatedColor] = useState<string>(palette.hiddenWordColor);
    const adaptiveColorsRef = useRef<string[]>([]);
    const currentColorIndexRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateTimeRef = useRef<number>(Date.now());

    useEffect(() => {
      // Generate adaptive colors for all palettes
      adaptiveColorsRef.current = generateAdaptiveColorSet(
        palette.hiddenWordColor,
        palette.glitchColors,
        palette.difficulty
      );
      currentColorIndexRef.current = 0;
      setAnimatedColor(adaptiveColorsRef.current[0]);
      lastUpdateTimeRef.current = Date.now();
    }, [palette.id, palette.hiddenWordColor, palette.glitchColors, palette.difficulty]);

    useEffect(() => {
      if (adaptiveColorsRef.current.length === 0) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      const animate = () => {
        const now = Date.now();
        const timeSinceLastChange = now - lastUpdateTimeRef.current;
        
        // Difficulty-specific change intervals
        const getChangeInterval = () => {
          switch (palette.difficulty) {
            case 'easy':
              return 2000 + Math.random() * 500;
            case 'average':
              return 2500 + Math.random() * 500;
            case 'hard':
            default:
              return 2500 + Math.random() * 500;
          }
        };
        
        const changeInterval = getChangeInterval();
        
        if (timeSinceLastChange >= changeInterval) {
          currentColorIndexRef.current = (currentColorIndexRef.current + 1) % adaptiveColorsRef.current.length;
          lastUpdateTimeRef.current = now;
        }
        
        const transitionDuration = 1000;
        const transitionProgress = Math.min(1, timeSinceLastChange / transitionDuration);
        
        const currentIndex = currentColorIndexRef.current;
        const nextIndex = (currentIndex + 1) % adaptiveColorsRef.current.length;
        const currentColor = adaptiveColorsRef.current[currentIndex];
        const nextColor = adaptiveColorsRef.current[nextIndex];
        
        const interpolatedColor = interpolateColor(currentColor, nextColor, transitionProgress);
        setAnimatedColor(interpolatedColor);
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }, [palette.id, palette.difficulty]);

    return (
      <button
        className={`${styles.paletteOption} ${isActive ? styles.active : ''}`}
        onClick={() => onSelect(palette.id)}
        aria-label={`Select ${palette.name} palette`}
      >
        <div className={styles.optionPreview}>
          {palette.glitchColors.slice(0, 2).map((color, idx) => (
            <div
              key={idx}
              className={styles.optionSwatch}
              style={{ backgroundColor: color }}
            />
          ))}
          {/* Show animated hidden word color for all palettes */}
          <div
            className={`${styles.optionSwatch} ${styles.animatedOptionSwatch}`}
            style={{ backgroundColor: animatedColor }}
            title="Animated hidden word color"
          />
        </div>
        <span className={styles.optionName}>{palette.name}</span>
      </button>
    );
  };

  if (compact) {
    const difficultyLabel = getDifficultyLabel(currentPalette.difficulty);
    const nextPalette = getNextPaletteByDifficulty(currentPaletteId);
    
    return (
      <button
        className={styles.toggleCompact}
        onClick={handleCycle}
        aria-label={`Change color palette difficulty to ${getDifficultyLabel(nextPalette.difficulty)}`}
        title={`Current: ${difficultyLabel}. Click to cycle palettes.`}
      >
        <PaletteIcon className={styles.icon} size={18} />
        <span className={styles.paletteNameCompact}>{difficultyLabel}</span>
      </button>
    );
  }

  return (
    <div className={styles.paletteToggle}>
      <div className={styles.currentPalette}>
        <div className={styles.paletteInfo}>
          <div className={styles.paletteHeader}>
            <span className={styles.label}>Color Palette</span>
            <span className={styles.difficultyBadge} data-difficulty={currentPalette.difficulty}>
              {getDifficultyLabel(currentPalette.difficulty)}
            </span>
          </div>
          <span className={styles.paletteName}>{currentPalette.name}</span>
          <span className={styles.description}>{currentPalette.description}</span>
        </div>
        <div className={styles.colorPreview}>
          {currentPalette.glitchColors.map((color, index) => (
            <div
              key={index}
              className={styles.colorSwatch}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <div
            className={`${styles.colorSwatch} ${styles.animatedSwatch}`}
            style={{ backgroundColor: animatedColor }}
            title={`Hidden words: Animated (${currentPalette.difficulty})`}
          />
        </div>
      </div>
      <button
        className={styles.cycleButton}
        onClick={handleCycle}
        aria-label={`Change color palette to ${getNextPalette(currentPaletteId).name}`}
      >
        <span className={styles.cycleIcon}>🔄</span>
        <span>Cycle Palette</span>
      </button>
      <div className={styles.paletteListContainer}>
        {(['easy', 'average', 'hard'] as PaletteDifficulty[]).map((difficulty) => {
          const palettes = palettesByDifficulty[difficulty];
          if (palettes.length === 0) return null;

          return (
            <div key={difficulty} className={styles.difficultySection}>
              <h3 className={styles.difficultyTitle}>
                {getDifficultyLabel(difficulty)}
                <span className={styles.difficultyMultiplier}>
                  {difficulty === 'easy' ? '1.0x' : difficulty === 'average' ? '1.5x' : '2.0x'}
                </span>
              </h3>
              <div className={styles.paletteList}>
                {palettes.map((palette) => {
                  const isActive = palette.id === currentPaletteId;
                  const isHard = palette.difficulty === 'hard';
                  return (
                    <PaletteOption
                      key={palette.id}
                      palette={palette}
                      isActive={isActive}
                      onSelect={onPaletteChange}
                      isHard={isHard}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

