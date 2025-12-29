'use client';

import React from 'react';
import { GameScore } from '@/types/game';
import { ColorPalette, getPalette, DEFAULT_PALETTE_ID } from '@/lib/colorPalettes';
import { loadSettings, loadProfile } from '@/lib/storage/gameStorage';
import GameMusicPlayer from './GameMusicPlayer';
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
  const totalTime = cumulativeTotalTime !== undefined 
    ? cumulativeTotalTime 
    : (() => {
        const existingTotal = profile?.totalPlayTime || 0;
        const currentLevelTime = score.levelTime || 0;
        return existingTotal + Math.round(currentLevelTime);
      })();

  // Use cumulative total score from prop if provided, otherwise calculate from profile
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
    const totalSeconds = Math.round(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance rating color
  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'S': return '#FFD700'; // Gold
      case 'A': return '#00FF00'; // Green
      case 'B': return '#00BFFF'; // Blue
      case 'C': return '#FFA500'; // Orange
      case 'D': return '#FF6347'; // Tomato
      case 'F': return '#FF0000'; // Red
      default: return currentPalette.uiColors.primary;
    }
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'average': return 'AVERAGE';
      case 'hard': return 'HARD';
      default: return 'EASY';
    }
  };

  const ratingColor = getRatingColor(score.performanceRating);
  const difficultyLabel = getDifficultyLabel(currentPalette.difficulty);

  return (
    <div className={styles.overlay}>
      {/* Music Player - keep playing during score screen */}
      <div className={styles.musicPlayerContainer}>
        <GameMusicPlayer palette={currentPalette} isPaused={false} />
      </div>
      
      <div 
        className={styles.modal}
        style={{
          borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
        }}
      >
        {/* Header with Performance Rating */}
        <div className={styles.header}>
          <h2 
            className={styles.title}
            style={{
              textShadow: `0 0 20px ${hexToRgba(currentPalette.uiColors.primary, 0.5)}`,
            }}
          >
            {isVictory ? 'Level Complete!' : 'Time\'s Up!'}
          </h2>
          
          {score.performanceRating && (
            <div 
              className={styles.performanceRating}
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(ratingColor, 0.2)} 0%, ${hexToRgba(ratingColor, 0.1)} 100%)`,
                borderColor: hexToRgba(ratingColor, 0.5),
                boxShadow: `0 0 20px ${hexToRgba(ratingColor, 0.3)}`,
              }}
            >
              <span 
                className={styles.ratingLetter}
                style={{
                  color: ratingColor,
                  textShadow: `0 0 15px ${hexToRgba(ratingColor, 0.8)}`,
                }}
              >
                {score.performanceRating}
              </span>
              <span className={styles.ratingLabel}>Performance</span>
            </div>
          )}
        </div>
        
        {/* Score Section */}
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

          {/* Detailed Stats Grid */}
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
                <span className={styles.statValue} style={{ color: '#00FF00' }}>
                  +{score.timeBonus.toLocaleString()}
                </span>
              </div>
            )}
            {score.comboMultiplier > 1 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Combo Multiplier</span>
                <span className={styles.statValue} style={{ color: '#FFD700' }}>
                  x{score.comboMultiplier.toFixed(2)}
                </span>
              </div>
            )}
            {score.comboBonus && score.comboBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Combo Bonus</span>
                <span className={styles.statValue} style={{ color: '#FFD700' }}>
                  +{score.comboBonus.toLocaleString()}
                </span>
              </div>
            )}
            <div className={styles.stat}>
              <span className={styles.statLabel}>Accuracy</span>
              <span 
                className={styles.statValue}
                style={{
                  color: score.accuracy >= 90 ? '#00FF00' : score.accuracy >= 70 ? '#FFA500' : '#FF6347'
                }}
              >
                {score.accuracy.toFixed(1)}%
              </span>
            </div>
            {score.accuracyBonus !== undefined && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Accuracy Bonus</span>
                <span className={styles.statValue}>+{score.accuracyBonus.toLocaleString()}</span>
              </div>
            )}
            {score.perfectAccuracyBonus && score.perfectAccuracyBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Perfect Bonus</span>
                <span className={styles.statValue} style={{ color: '#FFD700' }}>
                  +{score.perfectAccuracyBonus.toLocaleString()}
                </span>
              </div>
            )}
            {score.speedBonus !== undefined && score.speedBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Speed Bonus</span>
                <span className={styles.statValue} style={{ color: '#00BFFF' }}>
                  +{score.speedBonus.toLocaleString()}
                </span>
              </div>
            )}
            {score.wordLengthBonus !== undefined && score.wordLengthBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Word Length Bonus</span>
                <span className={styles.statValue}>+{score.wordLengthBonus.toLocaleString()}</span>
              </div>
            )}
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

          {/* Multipliers Section */}
          {(score.levelMultiplier || score.difficultyMultiplier) && (
            <div className={styles.multipliersSection}>
              <div className={styles.multiplierHeader}>Score Multipliers</div>
              <div className={styles.multipliers}>
                {score.levelMultiplier && score.levelMultiplier > 1 && (
                  <div className={styles.multiplier}>
                    <span className={styles.multiplierLabel}>Level {level}</span>
                    <span className={styles.multiplierValue}>x{score.levelMultiplier.toFixed(2)}</span>
                  </div>
                )}
                {score.difficultyMultiplier && (
                  <div className={styles.multiplier}>
                    <span className={styles.multiplierLabel}>{difficultyLabel}</span>
                    <span className={styles.multiplierValue}>x{score.difficultyMultiplier.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score Breakdown (if available) */}
          {score.scoreBreakdown && (
            <details className={styles.breakdownDetails}>
              <summary className={styles.breakdownSummary}>Detailed Breakdown</summary>
              <div className={styles.breakdown}>
                <div className={styles.breakdownRow}>
                  <span>Base Score</span>
                  <span>{score.scoreBreakdown.baseScore.toLocaleString()}</span>
                </div>
                {score.scoreBreakdown.timeBonus > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Time Bonus</span>
                    <span>+{score.scoreBreakdown.timeBonus.toLocaleString()}</span>
                  </div>
                )}
                {score.scoreBreakdown.accuracyBonus > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Accuracy Bonus</span>
                    <span>+{score.scoreBreakdown.accuracyBonus.toLocaleString()}</span>
                  </div>
                )}
                {score.scoreBreakdown.comboBonus > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Combo Bonus</span>
                    <span>+{score.scoreBreakdown.comboBonus.toLocaleString()}</span>
                  </div>
                )}
                {score.scoreBreakdown.speedBonus > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Speed Bonus</span>
                    <span>+{score.scoreBreakdown.speedBonus.toLocaleString()}</span>
                  </div>
                )}
                {score.scoreBreakdown.wordLengthBonus > 0 && (
                  <div className={styles.breakdownRow}>
                    <span>Word Length Bonus</span>
                    <span>+{score.scoreBreakdown.wordLengthBonus.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownRow}>
                  <span>Before Multipliers</span>
                  <span>{score.scoreBreakdown.beforeMultipliers.toLocaleString()}</span>
                </div>
                {score.scoreBreakdown.levelMultiplier > 1 && (
                  <div className={styles.breakdownRow}>
                    <span>× Level Multiplier</span>
                    <span>x{score.scoreBreakdown.levelMultiplier.toFixed(2)}</span>
                  </div>
                )}
                {score.scoreBreakdown.difficultyMultiplier > 1 && (
                  <div className={styles.breakdownRow}>
                    <span>× Difficulty Multiplier</span>
                    <span>x{score.scoreBreakdown.difficultyMultiplier.toFixed(1)}</span>
                  </div>
                )}
                <div className={styles.breakdownDivider} />
                <div className={styles.breakdownRow} style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <span>Final Score</span>
                  <span style={{ color: currentPalette.uiColors.primary }}>
                    {score.scoreBreakdown.finalScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </details>
          )}
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
