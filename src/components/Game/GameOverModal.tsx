'use client';

import React from 'react';
import { GameScore } from '@/types/game';
import { ColorPalette, getPalette, DEFAULT_PALETTE_ID } from '@/lib/colorPalettes';
import { loadSettings, loadProfile } from '@/lib/storage/gameStorage';
import styles from './GameOverModal.module.css';

interface GameOverModalProps {
  score: GameScore;
  level: number;
  onContinue: () => void;
  onRetry: () => void;
  onMenu: () => void;
  isVictory: boolean;
  palette?: ColorPalette;
  cumulativeTotalTime?: number; // Total time across all levels
  cumulativeTotalScore?: number; // Total score across all levels
}

export default function GameOverModal({
  score,
  level,
  onContinue,
  onRetry,
  onMenu,
  isVictory,
  palette,
  cumulativeTotalTime,
  cumulativeTotalScore,
}: GameOverModalProps) {
  const currentPalette = palette || (() => {
    const settings = loadSettings();
    return getPalette(settings.colorPalette || DEFAULT_PALETTE_ID);
  })();

  // Load profile for total score and total time
  const profile = loadProfile();

  // Use cumulative total time from prop if provided, otherwise calculate from profile
  // The prop ensures we have the correct total including the current level
  const totalTime = cumulativeTotalTime !== undefined 
    ? cumulativeTotalTime 
    : (() => {
        const existingTotal = profile?.totalPlayTime || 0;
        const currentLevelTime = score.levelTime || 0;
        return existingTotal + Math.round(currentLevelTime);
      })();

  // Use cumulative total score from prop if provided, otherwise calculate from profile
  // The prop ensures we have the correct total including the current level
  const totalScore = cumulativeTotalScore !== undefined
    ? cumulativeTotalScore
    : (() => {
        const existingTotal = profile?.totalScore || 0;
        return existingTotal + score.finalScore;
      })();

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Format time in seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    // Round to nearest second for display
    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };


  return (
    <div className={styles.overlay}>
      <div 
        className={styles.modal}
        style={{
          borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
        }}
      >
        <h2 
          className={styles.title}
          style={{
            textShadow: `0 0 20px ${hexToRgba(currentPalette.uiColors.primary, 0.5)}`,
          }}
        >
          {isVictory ? 'Level Complete!' : 'Time\'s Up!'}
        </h2>
        
        <div className={styles.scoreSection}>
          <div className={styles.finalScore}>
            <span className={styles.scoreLabel}>Level Score</span>
            <span 
              className={styles.scoreValue}
              style={{
                color: currentPalette.uiColors.primary,
                textShadow: `0 0 20px ${hexToRgba(currentPalette.uiColors.primary, 0.5)}`,
              }}
            >
              {score.finalScore.toLocaleString()}
            </span>
          </div>
          
          {totalScore > 0 && (
            <div className={styles.totalScoreSection}>
              <span className={styles.totalScoreLabel}>Total Score</span>
              <span 
                className={styles.totalScoreValue}
                style={{
                  color: currentPalette.uiColors.secondary,
                  textShadow: `0 0 20px ${hexToRgba(currentPalette.uiColors.secondary, 0.5)}`,
                }}
              >
                {totalScore.toLocaleString()}
              </span>
            </div>
          )}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Words Found</span>
              <span className={styles.statValue}>{score.wordsFound}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Base Points</span>
              <span className={styles.statValue}>{score.totalPoints.toLocaleString()}</span>
            </div>
            {score.timeBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Time Bonus</span>
                <span className={styles.statValue}>+{score.timeBonus.toLocaleString()}</span>
              </div>
            )}
            {score.comboMultiplier > 1 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Combo Multiplier</span>
                <span className={styles.statValue}>x{score.comboMultiplier.toFixed(1)}</span>
              </div>
            )}
            <div className={styles.stat}>
              <span className={styles.statLabel}>Accuracy</span>
              <span className={styles.statValue}>{score.accuracy.toFixed(1)}%</span>
            </div>
            {score.levelTime !== undefined && (
              <>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Level Time</span>
                  <span className={styles.statValue}>{formatTime(score.levelTime)}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Time</span>
                  <span 
                    className={styles.statValue}
                    style={{
                      color: currentPalette.uiColors.primary,
                    }}
                  >
                    {formatTime(totalTime)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {isVictory && (
            <button 
              className={`${styles.button} ${styles.primary}`} 
              onClick={onContinue}
              style={{
                background: `linear-gradient(135deg, ${currentPalette.uiColors.primary} 0%, ${currentPalette.uiColors.secondary} 100%)`,
                boxShadow: `0 4px 15px ${hexToRgba(currentPalette.uiColors.primary, 0.4)}`,
              }}
            >
              Continue
            </button>
          )}
          <button 
            className={`${styles.button} ${styles.secondary}`} 
            onClick={onRetry}
            style={{
              boxShadow: `0 6px 20px ${hexToRgba(currentPalette.uiColors.primary, 0.6)}`,
            }}
          >
            Retry
          </button>
          <button className={`${styles.button} ${styles.tertiary}`} onClick={onMenu}>
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}

