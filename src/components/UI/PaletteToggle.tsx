'use client';

import React, { useMemo } from 'react';
import { ColorPalette, getPalette, getNextPalette, getNextPaletteByDifficulty, COLOR_PALETTES, PaletteDifficulty } from '@/lib/colorPalettes';
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
            className={styles.colorSwatch}
            style={{ backgroundColor: currentPalette.hiddenWordColor }}
            title={`Hidden words: ${currentPalette.hiddenWordColor}`}
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
                  return (
                    <button
                      key={palette.id}
                      className={`${styles.paletteOption} ${isActive ? styles.active : ''}`}
                      onClick={() => onPaletteChange(palette.id)}
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
                      </div>
                      <span className={styles.optionName}>{palette.name}</span>
                    </button>
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

