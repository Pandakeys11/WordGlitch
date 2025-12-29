'use client';

import React from 'react';
import { GameWord } from '@/types/game';
import { ColorPalette, getPalette, DEFAULT_PALETTE_ID } from '@/lib/colorPalettes';
import { loadSettings } from '@/lib/storage/gameStorage';
import styles from './WordList.module.css';

interface WordListProps {
  words: GameWord[];
  palette?: ColorPalette;
  isPaused?: boolean;
}

export default function WordList({ words, palette, isPaused = false }: WordListProps) {
  // Filter out fake words from the word list - they shouldn't be shown to players
  const activeWords = words.filter(w => !w.found && !w.isFake);
  const foundWords = words.filter(w => w.found && !w.isFake);
  
  // Get palette (use provided or load from settings)
  const currentPalette = palette || (() => {
    const settings = loadSettings();
    return getPalette(settings.colorPalette || DEFAULT_PALETTE_ID);
  })();

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Get word box style based on state
  const getWordBoxStyle = (isFound: boolean): React.CSSProperties => {
    if (isFound) {
      const primaryColor = currentPalette.hiddenWordColor;
      return {
        background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.3)} 0%, ${hexToRgba(primaryColor, 0.2)} 50%, ${hexToRgba(primaryColor, 0.25)} 100%)`,
        borderColor: `${hexToRgba(primaryColor, 0.5)} ${hexToRgba(primaryColor, 0.3)} ${hexToRgba(primaryColor, 0.7)} ${hexToRgba(primaryColor, 0.3)}`,
        boxShadow: `
          0 0 15px ${hexToRgba(primaryColor, 0.3)},
          0 2px 8px ${hexToRgba('#000000', 0.3)},
          inset 0 1px 0 ${hexToRgba('#ffffff', 0.15)},
          inset 0 -1px 0 ${hexToRgba('#000000', 0.2)}
        `,
      };
    } else {
      const primaryColor = currentPalette.uiColors.primary;
      return {
        background: `rgba(0, 0, 0, 0.2)`,
        borderColor: `${hexToRgba(primaryColor, 0.3)} ${hexToRgba(primaryColor, 0.15)} ${hexToRgba('#000000', 0.4)} ${hexToRgba(primaryColor, 0.15)}`,
        boxShadow: `
          0 2px 8px ${hexToRgba('#000000', 0.3)},
          inset 0 1px 0 ${hexToRgba('#ffffff', 0.15)},
          inset 0 -1px 0 ${hexToRgba('#000000', 0.2)}
        `,
      };
    }
  };

  return (
    <div className={styles.wordList}>
      <div className={styles.wordsContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Find These Words</h3>
          <div className={styles.words}>
            {activeWords.map((word) => (
              <div 
                key={word.word} 
                className={styles.word}
                style={getWordBoxStyle(false)}
              >
                <span className={styles.wordText}>{word.word}</span>
                <span className={styles.wordPoints}>{word.points} pts</span>
              </div>
            ))}
          </div>
        </div>
        {foundWords.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Found</h3>
            <div className={styles.words}>
              {foundWords.map((word) => (
              <div 
                key={word.word} 
                className={`${styles.word} ${styles.found}`}
                style={getWordBoxStyle(true)}
              >
                <span 
                  className={styles.wordText}
                  style={{ color: currentPalette.hiddenWordColor }}
                >
                  {word.word}
                </span>
                <span 
                  className={styles.wordPoints}
                  style={{ color: currentPalette.hiddenWordColor }}
                >
                  ✓
                </span>
              </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

