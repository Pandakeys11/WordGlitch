'use client';

import React, { useState } from 'react';
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
  cumulativeTotalTime?: number;
  cumulativeTotalScore?: number;
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
  const [showBreakdown, setShowBreakdown] = useState(false);

  const currentPalette = palette || (() => {
    const settings = loadSettings();
    return getPalette(settings.colorPalette || DEFAULT_PALETTE_ID);
  })();

  const profile = loadProfile();

  const totalTime = cumulativeTotalTime !== undefined 
    ? cumulativeTotalTime 
    : (() => {
        const existingTotal = profile?.totalPlayTime || 0;
        const currentLevelTime = score.levelTime || 0;
        return existingTotal + Math.round(currentLevelTime);
      })();

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

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'S': return '#FFD700';
      case 'A': return '#4ade80';
      case 'B': return '#22d3ee';
      case 'C': return '#fb923c';
      case 'D': return '#f87171';
      case 'F': return '#ef4444';
      default: return currentPalette.uiColors.primary;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'average': return 'AVG';
      case 'hard': return 'HARD';
      default: return 'EASY';
    }
  };

  const ratingColor = getRatingColor(score.performanceRating);
  const difficultyLabel = getDifficultyLabel(currentPalette.difficulty);

  // Stat icons
  const getStatIcon = (type: string) => {
    switch (type) {
      case 'words': return '📝';
      case 'accuracy': return '🎯';
      case 'combo': return '🔥';
      case 'base': return '💎';
      case 'time': return '⏱️';
      case 'speed': return '⚡';
      case 'length': return '📏';
      case 'perfect': return '✨';
      default: return '•';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.musicPlayerContainer}>
        <GameMusicPlayer palette={currentPalette} isPaused={false} />
      </div>
      
      <div 
        className={styles.modal}
        style={{
          '--primary-color': currentPalette.uiColors.primary,
          '--secondary-color': currentPalette.uiColors.secondary,
        } as React.CSSProperties}
      >
        {/* Victory/Defeat Banner */}
        <div className={isVictory ? styles.victoryBanner : styles.defeatBanner} />

        {/* Compact Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2 className={styles.title} style={{
              textShadow: `0 0 20px ${hexToRgba(currentPalette.uiColors.primary, 0.6)}`,
            }}>
              {isVictory ? 'Level Complete!' : "Time's Up!"}
            </h2>
            <div className={styles.levelBadge}>
              <span>Level {level}</span>
              <span>•</span>
              <span>{difficultyLabel}</span>
            </div>
          </div>
          
          {score.performanceRating && (
            <div 
              className={styles.performanceRating}
              style={{
                background: `linear-gradient(135deg, ${hexToRgba(ratingColor, 0.2)} 0%, ${hexToRgba(ratingColor, 0.1)} 100%)`,
                borderColor: hexToRgba(ratingColor, 0.6),
                boxShadow: `0 0 25px ${hexToRgba(ratingColor, 0.4)}`,
              }}
            >
              <span 
                className={styles.ratingLetter}
                style={{
                  color: ratingColor,
                  textShadow: `0 0 12px ${hexToRgba(ratingColor, 0.9)}`,
                }}
              >
                {score.performanceRating}
              </span>
              <span className={styles.ratingLabel}>RANK</span>
            </div>
          )}
        </div>

        {/* Score Section */}
        <div className={styles.scoreSection}>
          {/* Main Scores */}
          <div className={styles.scoresRow}>
            <div className={`${styles.scoreBox} ${styles.primary}`}>
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
            
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>Total Score</span>
              <span 
                className={`${styles.scoreValue} ${styles.totalScoreValue}`}
                style={{
                  color: currentPalette.uiColors.secondary,
                  textShadow: `0 0 15px ${hexToRgba(currentPalette.uiColors.secondary, 0.4)}`,
                }}
              >
                {totalScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats Grid - Compact 3 Column */}
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>{getStatIcon('words')}</span>
              <span className={styles.statLabel}>Words</span>
              <span className={styles.statValue}>{score.wordsFound}</span>
            </div>
            
            <div className={styles.stat}>
              <span className={styles.statIcon}>{getStatIcon('accuracy')}</span>
              <span className={styles.statLabel}>Accuracy</span>
              <span 
                className={styles.statValue}
                style={{
                  color: score.accuracy >= 90 ? '#4ade80' : score.accuracy >= 70 ? '#fb923c' : '#f87171'
                }}
              >
                {score.accuracy.toFixed(0)}%
              </span>
            </div>

            <div className={styles.stat}>
              <span className={styles.statIcon}>{getStatIcon('base')}</span>
              <span className={styles.statLabel}>Base Pts</span>
              <span className={styles.statValue}>{score.totalPoints.toLocaleString()}</span>
            </div>

            {score.timeBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('time')}</span>
                <span className={styles.statLabel}>Time +</span>
                <span className={`${styles.statValue} ${styles.bonusValue}`}>
                  +{score.timeBonus.toLocaleString()}
                </span>
              </div>
            )}

            {score.comboMultiplier > 1 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('combo')}</span>
                <span className={styles.statLabel}>Combo</span>
                <span className={styles.statValue} style={{ color: '#fbbf24' }}>
                  x{score.comboMultiplier.toFixed(1)}
                </span>
              </div>
            )}

            {score.speedBonus !== undefined && score.speedBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('speed')}</span>
                <span className={styles.statLabel}>Speed +</span>
                <span className={`${styles.statValue} ${styles.bonusValue}`}>
                  +{score.speedBonus.toLocaleString()}
                </span>
              </div>
            )}

            {score.accuracyBonus !== undefined && score.accuracyBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('accuracy')}</span>
                <span className={styles.statLabel}>Acc +</span>
                <span className={`${styles.statValue} ${styles.bonusValue}`}>
                  +{score.accuracyBonus.toLocaleString()}
                </span>
              </div>
            )}

            {score.perfectAccuracyBonus && score.perfectAccuracyBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('perfect')}</span>
                <span className={styles.statLabel}>Perfect</span>
                <span className={styles.statValue} style={{ color: '#fbbf24' }}>
                  +{score.perfectAccuracyBonus.toLocaleString()}
                </span>
              </div>
            )}

            {score.wordLengthBonus !== undefined && score.wordLengthBonus > 0 && (
              <div className={styles.stat}>
                <span className={styles.statIcon}>{getStatIcon('length')}</span>
                <span className={styles.statLabel}>Length +</span>
                <span className={`${styles.statValue} ${styles.bonusValue}`}>
                  +{score.wordLengthBonus.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Multipliers Row */}
          {(score.levelMultiplier || score.difficultyMultiplier) && (
            <div className={styles.multipliersRow}>
              {score.levelMultiplier && score.levelMultiplier > 1 && (
                <div className={styles.multiplier}>
                  <span className={styles.multiplierLabel}>Lv.{level}</span>
                  <span className={styles.multiplierValue}>×{score.levelMultiplier.toFixed(1)}</span>
                </div>
              )}
              {score.difficultyMultiplier && (
                <div className={styles.multiplier}>
                  <span className={styles.multiplierLabel}>{difficultyLabel}</span>
                  <span className={styles.multiplierValue}>×{score.difficultyMultiplier.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Time Row */}
          {score.levelTime !== undefined && (
            <div className={styles.timeRow}>
              <div className={styles.timeStat}>
                <span className={styles.timeIcon}>⏱️</span>
                <div>
                  <span className={styles.timeLabel}>Level Time</span>
                  <span className={styles.timeValue}>{formatTime(score.levelTime)}</span>
                </div>
              </div>
              <div className={styles.timeStat}>
                <span className={styles.timeIcon}>🕐</span>
                <div>
                  <span className={styles.timeLabel}>Total Time</span>
                  <span 
                    className={styles.timeValue}
                    style={{ color: currentPalette.uiColors.primary }}
                  >
                    {formatTime(totalTime)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Breakdown Toggle */}
          {score.scoreBreakdown && (
            <>
              <button 
                className={styles.breakdownToggle}
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <span>Detailed Breakdown</span>
                <span className={`${styles.breakdownIcon} ${showBreakdown ? styles.open : ''}`}>▼</span>
              </button>

              <div className={`${styles.breakdownPanel} ${showBreakdown ? styles.open : ''}`}>
                <div className={styles.breakdownContent}>
                  <div className={styles.breakdownRow}>
                    <span>Base Score</span>
                    <span>{score.scoreBreakdown.baseScore.toLocaleString()}</span>
                  </div>
                  {score.scoreBreakdown.timeBonus > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Time Bonus</span>
                      <span style={{ color: '#4ade80' }}>+{score.scoreBreakdown.timeBonus.toLocaleString()}</span>
                    </div>
                  )}
                  {score.scoreBreakdown.accuracyBonus > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Accuracy Bonus</span>
                      <span style={{ color: '#4ade80' }}>+{score.scoreBreakdown.accuracyBonus.toLocaleString()}</span>
                    </div>
                  )}
                  {score.scoreBreakdown.comboBonus > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Combo Bonus</span>
                      <span style={{ color: '#fbbf24' }}>+{score.scoreBreakdown.comboBonus.toLocaleString()}</span>
                    </div>
                  )}
                  {score.scoreBreakdown.speedBonus > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Speed Bonus</span>
                      <span style={{ color: '#22d3ee' }}>+{score.scoreBreakdown.speedBonus.toLocaleString()}</span>
                    </div>
                  )}
                  {score.scoreBreakdown.wordLengthBonus > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Word Length Bonus</span>
                      <span style={{ color: '#4ade80' }}>+{score.scoreBreakdown.wordLengthBonus.toLocaleString()}</span>
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
                      <span style={{ color: '#fbbf24' }}>×{score.scoreBreakdown.levelMultiplier.toFixed(2)}</span>
                    </div>
                  )}
                  {score.scoreBreakdown.difficultyMultiplier > 1 && (
                    <div className={styles.breakdownRow}>
                      <span>× Difficulty</span>
                      <span style={{ color: '#fbbf24' }}>×{score.scoreBreakdown.difficultyMultiplier.toFixed(1)}</span>
                    </div>
                  )}
                  <div className={styles.breakdownDivider} />
                  <div className={`${styles.breakdownRow} ${styles.breakdownTotal}`}>
                    <span>Final Score</span>
                    <span style={{ color: currentPalette.uiColors.primary }}>
                      {score.scoreBreakdown.finalScore.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions - Horizontal */}
        <div className={styles.actions}>
          {isVictory && (
            <button 
              className={`${styles.button} ${styles.primary}`} 
              onClick={onContinue}
              style={{
                background: `linear-gradient(135deg, ${currentPalette.uiColors.primary} 0%, ${currentPalette.uiColors.secondary} 100%)`,
                boxShadow: `0 4px 20px ${hexToRgba(currentPalette.uiColors.primary, 0.4)}`,
              }}
            >
              Continue
            </button>
          )}
          <button 
            className={`${styles.button} ${styles.secondary}`} 
            onClick={onRetry}
          >
            Retry
          </button>
          <button 
            className={`${styles.button} ${styles.tertiary}`} 
            onClick={onMenu}
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
