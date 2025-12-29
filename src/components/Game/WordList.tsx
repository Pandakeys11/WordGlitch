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

  return (
    <div className={styles.wordList}>
      <div className={styles.wordsContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Find These Words</h3>
          <div className={styles.words}>
            {activeWords.map((word) => (
              <div key={word.word} className={styles.word}>
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
                style={{
                  borderColor: hexToRgba(currentPalette.hiddenWordColor, 0.5),
                }}
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

