'use client';

import React, { useState, useEffect, useRef } from 'react';
import MenuButton from './MenuButton';
import MenuProfileCard from './MenuProfileCard';
import LetterGlitch, { LetterGlitchHandle } from '../Game/LetterGlitch';
import { getCurrentLevel, getUnlockedLevels } from '@/lib/game/levelSystem';
import { loadProfile, loadSettings, saveSettings } from '@/lib/storage/gameStorage';
import { initializeLevel } from '@/lib/game/difficulty';
import { getPalette, DEFAULT_PALETTE_ID, ColorPalette } from '@/lib/colorPalettes';
import { getPaletteForLevel } from '@/lib/game/levelProgression';
import PaletteToggle from '../UI/PaletteToggle';
import { EyeIcon, EyeOffIcon, PlayIcon, UserIcon, TrophyIcon, BookIcon, ZapIcon } from '../UI/GameIcons';
import { getCurrencyBalance, syncCurrencyWithTotalScore } from '@/lib/currency';
import GameMusicPlayer from '../Game/GameMusicPlayer';
import styles from './MenuScreen.module.css';

interface MenuScreenProps {
  onPlay: () => void;
  onProfile: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export default function MenuScreen({
  onPlay,
  onProfile,
  onLeaderboard,
  onSettings,
}: MenuScreenProps) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(() => {
    // Get palette based on current level progression
    const level = getCurrentLevel();
    return getPaletteForLevel(level);
  });
  const [currency, setCurrency] = useState(getCurrencyBalance());
  const glitchRef = useRef<LetterGlitchHandle>(null);
  const screensaverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync currency with total score on mount and update periodically
  useEffect(() => {
    // Sync currency with total score when menu loads
    const profile = loadProfile();
    if (profile) {
      syncCurrencyWithTotalScore(profile.totalScore);
    }

    // Update currency display periodically
    const interval = setInterval(() => {
      // Re-sync to ensure currency matches total score
      const currentProfile = loadProfile();
      if (currentProfile) {
        syncCurrencyWithTotalScore(currentProfile.totalScore);
      }
      setCurrency(getCurrencyBalance());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const level = getCurrentLevel();
    setCurrentLevel(level);

    const profile = loadProfile();
    if (profile) {
      setBestScore(profile.bestScore);
    }
  }, []);

  // Subtle background glitch (normal mode)
  useEffect(() => {
    if (isUIVisible) {
      const level = initializeLevel(1);
      const interval = setInterval(() => {
        // Use current palette colors for glitch effect
        glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 100);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentPalette, isUIVisible]);

  // Enhanced screensaver mode - more frequent and intense glitches
  useEffect(() => {
    if (!isUIVisible) {
      // Clear any existing interval
      if (screensaverIntervalRef.current) {
        clearInterval(screensaverIntervalRef.current);
      }

      // Trigger initial intense glitch
      glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 500);

      // More frequent glitches in screensaver mode
      screensaverIntervalRef.current = setInterval(() => {
        glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 400);
      }, 1500);

      return () => {
        if (screensaverIntervalRef.current) {
          clearInterval(screensaverIntervalRef.current);
        }
      };
    } else {
      // Clear screensaver interval when UI is visible
      if (screensaverIntervalRef.current) {
        clearInterval(screensaverIntervalRef.current);
        screensaverIntervalRef.current = null;
      }
    }
  }, [isUIVisible, currentPalette]);

  const handleButtonHover = () => {
    glitchRef.current?.triggerHoverGlitch(undefined, 500);
  };

  const handleButtonLeave = () => {
    glitchRef.current?.stopHoverGlitch();
  };

  const handlePaletteChange = (paletteId: string) => {
    const newPalette = getPalette(paletteId);
    setCurrentPalette(newPalette);
    const settings = loadSettings();
    saveSettings({ ...settings, colorPalette: paletteId });
    // Trigger glitch effect on palette change
    glitchRef.current?.triggerIntenseGlitch(newPalette.glitchColors, 300);
  };

  const handleToggleUI = () => {
    setIsUIVisible(prev => !prev);
  };

  // Convert hex to rgba for text shadows
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className={styles.menuScreen}
      style={{
        '--palette-primary': currentPalette.uiColors.primary,
        '--palette-secondary': currentPalette.uiColors.secondary,
        '--palette-accent': currentPalette.uiColors.accent,
        '--palette-text': currentPalette.uiColors.text,
        '--palette-bg': currentPalette.uiColors.background,
      } as React.CSSProperties}
    >
      <div
        className={`${styles.background} ${!isUIVisible ? styles.screensaver : ''}`}
      >
        <LetterGlitch
          ref={glitchRef}
          level={initializeLevel(1)}
          words={[]}
          onWordFound={() => { }}
          isPaused={false}
          palette={currentPalette}
          menuDisplayWords={['WORD GLITCH', 'by PGT']}
        />
      </div>

      <button
        className={`${styles.hideToggle} ${!isUIVisible ? styles.active : ''}`}
        onClick={handleToggleUI}
        aria-label={isUIVisible ? 'Hide UI' : 'Show UI'}
        title={isUIVisible ? 'Hide menu (screensaver mode)' : 'Show menu'}
      >
        {isUIVisible ? (
          <EyeOffIcon className={styles.toggleIcon} size={20} />
        ) : (
          <EyeIcon className={styles.toggleIcon} size={20} />
        )}
      </button>

      {isUIVisible && (
        <div className={styles.content}>
          <img
            src="/Playground_Title_white.png"
            alt="Playground Tools"
            className={styles.logo}
          />
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <h1
                className={styles.title}
                style={{
                  textShadow: `
                  0 0 20px ${hexToRgba(currentPalette.uiColors.primary, 0.5)},
                  0 0 40px ${hexToRgba(currentPalette.uiColors.primary, 0.3)},
                  0 4px 8px rgba(0, 0, 0, 0.5)
                `,
                }}
              >
                WORD GLITCH
              </h1>
              <div className={styles.musicPlayerWrapper}>
                <GameMusicPlayer palette={currentPalette} isPaused={false} />
              </div>
            </div>
            <p className={styles.subtitle}>Find words in the chaos</p>
          </div>

          {/* Profile Card - Only shows if logged in */}
          <div className={styles.profileSection}>
            <MenuProfileCard
              palette={currentPalette}
              onClick={onProfile}
            />
          </div>

          <div className={styles.stats}>
            <div
              className={styles.stat}
              style={{
                borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
              }}
            >
              <span className={styles.statLabel}>Level</span>
              <span
                className={styles.statValue}
                style={{ color: currentPalette.uiColors.primary }}
              >
                {currentLevel}
              </span>
            </div>
            {bestScore > 0 && (
              <div
                className={styles.stat}
                style={{
                  borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
                }}
              >
                <span className={styles.statLabel}>Best Score</span>
                <span
                  className={styles.statValue}
                  style={{ color: currentPalette.uiColors.primary }}
                >
                  {bestScore.toLocaleString()}
                </span>
              </div>
            )}
            <div
              className={styles.stat}
              style={{
                borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
              }}
            >
              <span className={styles.statLabel}>Currency</span>
              <span
                className={styles.statValue}
                style={{ color: '#ff0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {currency} <ZapIcon size={18} />
              </span>
            </div>
          </div>

          <div className={styles.buttons}>
            <MenuButton
              label="Play"
              onClick={onPlay}
              variant="primary"
              icon={<PlayIcon size={24} />}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              palette={currentPalette}
            />
            <MenuButton
              label="Profile"
              onClick={onProfile}
              variant="secondary"
              icon={<UserIcon size={24} />}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              palette={currentPalette}
            />
            <MenuButton
              label="Leaderboard"
              onClick={onLeaderboard}
              variant="secondary"
              icon={<TrophyIcon size={24} />}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              palette={currentPalette}
            />
            <MenuButton
              label="Rules"
              onClick={onSettings}
              variant="tertiary"
              icon={<BookIcon size={24} />}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              palette={currentPalette}
            />
          </div>

          <div className={styles.paletteSection}>
            <PaletteToggle
              currentPaletteId={currentPalette.id}
              onPaletteChange={handlePaletteChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

