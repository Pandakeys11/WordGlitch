'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ColorPalette, getPalette, getNextPalette, getNextPaletteByDifficulty, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
import { generateAdaptiveColorSet, interpolateColor } from '@/lib/colorUtils';
import { getPalettesByDifficulty, isPaletteUnlocked, getLevelRangeForPalette } from '@/lib/game/levelProgression';
import { getCurrentLevel } from '@/lib/game/levelSystem';
import { PaletteIcon, LockIcon } from './GameIcons';
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

  // Compact mode for game screen
  if (compact) {
    const difficultyLabel = getDifficultyLabel(currentPalette.difficulty);
    const levelRange = getLevelRangeForPalette(currentPalette.id);

    return (
      <div
        className={styles.toggleCompact}
        title={`Current Palette: ${currentPalette.name} (${difficultyLabel}) - Levels ${levelRange?.start}-${levelRange?.end}`}
      >
        <PaletteIcon className={styles.icon} size={18} />
        <span className={styles.paletteNameCompact}>{currentPalette.name}</span>
      </div>
    );
  }

  // Full palette selector for menu
  return (
    <div className={styles.paletteToggle}>
      <div className={styles.currentPalette}>
        <div className={styles.paletteInfo}>
          <div className={styles.paletteHeader}>
            <span className={styles.label}>Current Palette</span>
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
      <div className={styles.infoText} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <strong>Level-Based Progression:</strong> Palettes unlock as you progress through levels. Complete 3 levels per palette to advance!
      </div>
      <div className={styles.paletteListContainer}>
        {(['easy', 'average', 'hard'] as PaletteDifficulty[]).map((difficulty) => {
          const palettesWithRanges = getPalettesByDifficulty()[difficulty];
          if (palettesWithRanges.length === 0) return null;

          const currentLevel = getCurrentLevel();

          return (
            <div key={difficulty} className={styles.difficultySection}>
              <h3 className={styles.difficultyTitle}>
                {getDifficultyLabel(difficulty)}
                <span className={styles.difficultyMultiplier}>
                  {difficulty === 'easy' ? '1.0x' : difficulty === 'average' ? '1.5x' : '2.0x'}
                </span>
              </h3>
              <div className={styles.paletteList}>
                {palettesWithRanges.map(({ palette, levelRange }) => {
                  const isActive = palette.id === currentPaletteId;
                  const isLocked = !isPaletteUnlocked(palette.id, currentLevel);

                  return (
                    <PaletteCard
                      key={palette.id}
                      palette={palette}
                      isActive={isActive}
                      isLocked={isLocked}
                      levelRange={levelRange}
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

// Separate component for palette card
function PaletteCard({
  palette,
  isActive,
  isLocked,
  levelRange
}: {
  palette: ColorPalette;
  isActive: boolean;
  isLocked: boolean;
  levelRange: { start: number; end: number };
}) {
  const [animatedColor, setAnimatedColor] = useState<string>(palette.hiddenWordColor);
  const adaptiveColorsRef = useRef<string[]>([]);
  const currentColorIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());

  useEffect(() => {
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
    <div
      className={`${styles.paletteOption} ${isActive ? styles.active : ''} ${isLocked ? styles.locked : ''}`}
      title={isLocked ? `Unlock at Level ${levelRange.start}` : `${palette.name} - Levels ${levelRange.start}-${levelRange.end}`}
    >
      {isLocked && (
        <div className={styles.lockOverlay}>
          <LockIcon size={24} className={styles.lockIcon} />
          <span className={styles.lockText}>Level {levelRange.start}</span>
        </div>
      )}
      <div className={styles.optionPreview} style={{ filter: isLocked ? 'blur(4px) grayscale(50%)' : 'none' }}>
        {palette.glitchColors.slice(0, 2).map((color, idx) => (
          <div
            key={idx}
            className={styles.optionSwatch}
            style={{ backgroundColor: color }}
          />
        ))}
        <div
          className={`${styles.optionSwatch} ${styles.animatedOptionSwatch}`}
          style={{ backgroundColor: animatedColor }}
          title="Animated hidden word color"
        />
      </div>
      <span className={styles.optionName}>{palette.name}</span>
      {!isLocked && (
        <span className={styles.levelRange}>Levels {levelRange.start}-{levelRange.end}</span>
      )}
    </div>
  );
}
