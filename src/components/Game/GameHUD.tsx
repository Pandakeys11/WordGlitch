'use client';

import React from 'react';
import { HomeIcon, RestartIcon, PauseIcon } from '../UI/GameIcons';
import { getPalette, ColorPalette } from '@/lib/colorPalettes';
import GameMusicPlayer from './GameMusicPlayer';
import GameProfileCard from './GameProfileCard';
import styles from './GameHUD.module.css';
import gameScreenStyles from './GameScreen.module.css';

interface GameHUDProps {
  score: number;
  level: number;
  combo: number;
  elapsedTime: number;
  timeRemaining?: number;
  wordsFound: number;
  totalWords: number;
  onPause: () => void;
  onHome?: () => void;
  onRestart?: () => void;
  currentPaletteId?: string;
  isPaused?: boolean;
  isGameOver?: boolean; // Indicates if game over modal is showing
}

export default function GameHUD({
  score,
  level,
  combo,
  elapsedTime,
  timeRemaining,
  wordsFound,
  totalWords,
  onPause,
  onHome,
  onRestart,
  currentPaletteId = 'ocean',
  isPaused = false,
  isGameOver = false,
}: GameHUDProps) {
  const palette = getPalette(currentPaletteId);
  
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.hud}>
      <div className={styles.topBar}>
        <div className={styles.statGroup}>
          <div className={styles.stat}>
            <span className={styles.label}>Score</span>
            <span className={styles.value}>{score.toLocaleString()}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Level</span>
            <span className={styles.value}>{level}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Time</span>
            <span className={styles.value}>{formatTime(elapsedTime)}</span>
          </div>
          {combo > 0 && (
            <div className={styles.stat}>
              <span className={styles.label}>Combo</span>
              <span 
                className={`${styles.value} ${styles.combo}`}
                style={{
                  color: palette.hiddenWordColor,
                  textShadow: `0 0 10px ${palette.hiddenWordColor}`,
                }}
              >
                x{combo}
              </span>
            </div>
          )}
          {timeRemaining !== undefined && (
            <div className={styles.stat}>
              <span className={styles.label}>Remaining</span>
              <span className={`${styles.value} ${timeRemaining < 10 ? styles.warning : ''}`}>
                {Math.ceil(timeRemaining)}s
              </span>
            </div>
          )}
        </div>
        <img 
          src="/Playground_Title_white.png" 
          alt="Playground Tools" 
          className={gameScreenStyles.logo}
        />
        <img 
          src="/Playground_Title_white.png" 
          alt="Playground Tools" 
          className={gameScreenStyles.logoRight}
        />
        <div className={styles.topBarActions}>
          <div className={styles.profileCardWrapper}>
            <GameProfileCard />
          </div>
          <div className={styles.musicPlayerWrapper}>
            <GameMusicPlayer palette={palette} isPaused={isPaused && !isGameOver} />
          </div>
          {onHome && (
            <button className={styles.actionButton} onClick={onHome} aria-label="Home">
              <HomeIcon className={styles.icon} size={20} />
            </button>
          )}
          {onRestart && (
            <button className={styles.actionButton} onClick={onRestart} aria-label="Restart">
              <RestartIcon className={styles.icon} size={20} />
            </button>
          )}
          <button className={styles.pauseButton} onClick={onPause} aria-label="Pause">
            <PauseIcon className={styles.icon} size={20} />
          </button>
        </div>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${(wordsFound / totalWords) * 100}%`,
            background: `linear-gradient(90deg, ${palette.uiColors.primary}, ${palette.uiColors.secondary})`,
            boxShadow: `0 0 10px ${hexToRgba(palette.uiColors.primary, 0.5)}`,
          }}
        />
        <span className={styles.progressText}>
          {wordsFound} / {totalWords}
        </span>
      </div>
    </div>
  );
}

