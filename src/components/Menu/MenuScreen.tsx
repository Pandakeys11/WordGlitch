'use client';

import React, { useState, useEffect, useRef } from 'react';
import { calculateProfileLevel } from '@/lib/game/profileSystem';
import MenuButton from './MenuButton';
import ProfileCard from './ProfileCard';
import Loader from '../UI/Loader';
import LetterGlitch, { LetterGlitchHandle } from '../Game/LetterGlitch';
import AuthModal from '../Auth/AuthModal';
import { getCurrentLevel } from '@/lib/game/levelSystem';
import { loadProfile } from '@/lib/storage/gameStorage';
import { initializeLevel } from '@/lib/game/difficulty';
import { ColorPalette, getPalette } from '@/lib/colorPalettes';
import { getPaletteForLevel } from '@/lib/game/levelProgression';
import PaletteToggle from '../UI/PaletteToggle';
import { EyeIcon, EyeOffIcon, PlayIcon, UserIcon, TrophyIcon, SettingsIcon } from '../UI/GameIcons';
import { getCurrencyBalance, syncCurrencyWithTotalScore } from '@/lib/currency';
import GameMusicPlayer from '../Game/GameMusicPlayer';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { getGlobalLeaderboard, LeaderboardEntry } from '@/lib/firebase/leaderboard';
import GlitchText from '../UI/GlitchText';
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
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(() => {
    // Get the actual current level from storage, not just default to 1
    const actualLevel = getCurrentLevel();
    const palette = getPaletteForLevel(actualLevel);
    console.log('🎨 Menu initializing with level:', actualLevel, 'palette:', palette.name);
    return palette;
  });
  const [currency, setCurrency] = useState(getCurrencyBalance());
  const [showAuth, setShowAuth] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const { user, isAuthenticated, isSyncInitialized } = useFirebaseSync();
  const glitchRef = useRef<LetterGlitchHandle>(null);
  const screensaverIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load leaderboard
  useEffect(() => {
    loadLeaderboardData();
    const interval = setInterval(loadLeaderboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Refresh leaderboard when user changes (login/logout)
  useEffect(() => {
    if (user) {
      console.log('👤 User changed, refreshing leaderboard...');
      loadLeaderboardData();
    }
  }, [user]);

  const loadLeaderboardData = async () => {
    try {
      console.log('📊 Loading menu leaderboard...');
      const data = await getGlobalLeaderboard(10); // Top 10
      console.log('📊 Menu leaderboard loaded:', data.length, 'entries');
      setLeaderboard(data);
    } catch (error) {
      console.error('❌ Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Sync currency
  useEffect(() => {
    const profile = loadProfile();
    if (profile) {
      syncCurrencyWithTotalScore(profile.totalScore);
    }

    const interval = setInterval(() => {
      const currentProfile = loadProfile();
      if (currentProfile) {
        syncCurrencyWithTotalScore(currentProfile.totalScore);
      }
      setCurrency(getCurrencyBalance());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update palette when level changes
  useEffect(() => {
    const palette = getPaletteForLevel(currentLevel);
    console.log('🎨 Updating palette for level:', currentLevel, '→', palette.name);
    setCurrentPalette(palette);
  }, [currentLevel]);

  // Handle Level & Profile Sync
  useEffect(() => {
    // When sync initializes or user changes, refresh the level from storage
    const level = getCurrentLevel();
    console.log('🔄 Sync State Update - Level:', level, 'SyncInit:', isSyncInitialized);
    setCurrentLevel(level);

    const profile = loadProfile();
    if (profile) {
      setBestScore(profile.totalScore); // Use totalScore instead of bestScore
    }

    // Load profile picture from profile metadata
    const { getAllProfiles, getCurrentProfileId } = require('@/lib/storage/gameStorage');
    const profileId = getCurrentProfileId();
    if (profileId) {
      const profiles = getAllProfiles();
      const currentProfile = profiles.find((p: any) => p.id === profileId);
      if (currentProfile?.profilePicture) {
        setProfilePicture(currentProfile.profilePicture);
      }
    }
  }, [user, isAuthenticated, isSyncInitialized]);

  // Background glitch
  useEffect(() => {
    if (isUIVisible) {
      const interval = setInterval(() => {
        glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 100);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentPalette, isUIVisible]);

  // Screensaver mode
  useEffect(() => {
    if (!isUIVisible) {
      if (screensaverIntervalRef.current) {
        clearInterval(screensaverIntervalRef.current);
      }

      glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 500);

      screensaverIntervalRef.current = setInterval(() => {
        glitchRef.current?.triggerIntenseGlitch(currentPalette.glitchColors, 400);
      }, 1500);

      return () => {
        if (screensaverIntervalRef.current) {
          clearInterval(screensaverIntervalRef.current);
        }
      };
    }
  }, [isUIVisible, currentPalette]);

  const handleToggleUI = () => {
    setIsUIVisible(!isUIVisible);
    if (!isUIVisible) {
      glitchRef.current?.resetToNormal();
    }
  };

  const handleSignOut = async () => {
    try {
      // Import signOut from Firebase auth
      const { signOut } = await import('@/lib/firebase/auth');
      await signOut();

      // Refresh page to reset state
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
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
      <div className={`${styles.background} ${!isUIVisible ? styles.screensaver : ''}`}>
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
      >
        {isUIVisible ? (
          <EyeOffIcon className={styles.toggleIcon} size={20} />
        ) : (
          <EyeIcon className={styles.toggleIcon} size={20} />
        )}
      </button>

      {isUIVisible && (
        <div className={styles.content}>
          {/* Main Unified Card */}
          <div
            className={styles.mainCard}
            style={{
              background: `linear-gradient(135deg, ${hexToRgba(currentPalette.uiColors.background, 0.95)} 0%, ${hexToRgba(currentPalette.uiColors.background, 0.85)} 100%)`,
              borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
              boxShadow: `0 20px 60px ${hexToRgba(currentPalette.uiColors.primary, 0.2)}`,
            }}
          >
            {/* Header Section */}
            {/* Header Section */}
            <div className={styles.cardHeader}>
              {/* Center Identity Section (Logo + Title) */}
              <div className={styles.titleWrapper}>
                {/* Logo Centered Over Title */}
                <a
                  href="https://pgtools.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.logoWrapper}
                >
                  <img
                    src="/Playground_Title_white.png"
                    alt="Playground Tools"
                    className={styles.logo}
                  />
                  <div className={styles.logoGlow} />
                </a>

                <div className={styles.mainTitleRow}>
                  <GlitchText
                    text="WORD GLITCH"
                    palette={currentPalette}
                    as="h1"
                    className={styles.title}
                    glitchIntensity="medium"
                  />
                </div>
                <div className={styles.taglineRow}>
                  <span className={styles.taglineArrow}>►</span>
                  <GlitchText
                    text="Find words in the chaos"
                    palette={currentPalette}
                    as="p"
                    className={styles.subtitle}
                    glitchIntensity="low"
                  />
                </div>
              </div>

              {/* Right Controls - "Omega Player" */}
              <div className={styles.headerRight}>
                <div className={styles.playerContainer}>
                  <div className={styles.playerLabel}>OMEGA AUDIO</div>
                  <GameMusicPlayer palette={currentPalette} isPaused={false} />
                </div>
                <div className={styles.toggleContainer}>
                  <PaletteToggle
                    currentPaletteId={currentPalette.id}
                    onPaletteChange={(paletteId: string) => {
                      const newPalette = getPalette(paletteId);
                      setCurrentPalette(newPalette);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className={styles.statsBar}>
              <div
                className={styles.statCard}
                style={{
                  background: hexToRgba(currentPalette.uiColors.primary, 0.1),
                  borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
                }}
              >
                <span className={styles.statLabel} style={{ color: currentPalette.uiColors.text }}>
                  Level
                </span>
                <span className={styles.statValue} style={{ color: currentPalette.uiColors.primary }}>
                  {currentLevel}
                </span>
              </div>

              {bestScore > 0 && (
                <div
                  className={styles.statCard}
                  style={{
                    background: hexToRgba(currentPalette.uiColors.secondary, 0.1),
                    borderColor: hexToRgba(currentPalette.uiColors.secondary, 0.3),
                  }}
                >
                  <span className={styles.statLabel} style={{ color: currentPalette.uiColors.text }}>
                    Best Score
                  </span>
                  <span className={styles.statValue} style={{ color: currentPalette.uiColors.secondary }}>
                    {bestScore.toLocaleString()}
                  </span>
                </div>
              )}

              <div
                className={styles.statCard}
                style={{
                  background: hexToRgba(currentPalette.uiColors.accent, 0.1),
                  borderColor: hexToRgba(currentPalette.uiColors.accent, 0.3),
                }}
              >
                <span className={styles.statLabel} style={{ color: currentPalette.uiColors.text }}>
                  Currency
                </span>
                <span className={styles.statValue} style={{ color: currentPalette.uiColors.accent }}>
                  {currency.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className={styles.twoColumn}>
              {/* Left: Profile Card & Buttons */}
              <div className={styles.leftColumn}>
                {/* Profile Card */}
                <ProfileCard
                  palette={currentPalette}
                  username={user?.displayName || user?.email?.split('@')[0] || 'Player'}
                  totalScore={bestScore}
                  currentLevel={calculateProfileLevel(bestScore)}
                  profilePicture={profilePicture}
                  onClick={onProfile}
                />

                <MenuButton
                  onClick={onPlay}
                  icon={<PlayIcon size={24} />}
                  label="PLAY"
                  variant="primary"
                  palette={currentPalette}
                />

                {!isAuthenticated && (
                  <MenuButton
                    onClick={() => setShowAuth(true)}
                    icon={<TrophyIcon size={20} />}
                    label="LOGIN / SIGN UP"
                    variant="secondary"
                    palette={currentPalette}
                  />
                )}

                <MenuButton
                  onClick={onSettings}
                  icon={<SettingsIcon size={20} />}
                  label="SETTINGS"
                  variant="secondary"
                  palette={currentPalette}
                />

                {/* User Status - Moved from right column */}
                {isAuthenticated && user && (
                  <div className={styles.userStatusContainer}>
                    <div
                      className={styles.userStatus}
                      style={{
                        background: hexToRgba(currentPalette.uiColors.primary, 0.1),
                        borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
                        color: currentPalette.uiColors.text,
                      }}
                    >
                      <UserIcon size={16} />
                      <span>Signed in as <strong style={{ color: currentPalette.uiColors.primary }}>
                        {user.displayName || user.email || 'Player'}
                      </strong></span>
                    </div>
                    <button
                      className={styles.signOutButton}
                      onClick={handleSignOut}
                      style={{
                        borderColor: hexToRgba(currentPalette.uiColors.text, 0.3),
                        color: currentPalette.uiColors.text,
                      }}
                    >
                      SIGN OUT
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Leaderboard */}
              <div className={styles.rightColumn}>
                <div
                  className={styles.leaderboardCard}
                  style={{
                    background: hexToRgba(currentPalette.uiColors.background, 0.5),
                    borderColor: hexToRgba(currentPalette.uiColors.primary, 0.3),
                  }}
                >
                  <div className={styles.leaderboardHeader}>
                    <TrophyIcon size={20} color={currentPalette.uiColors.primary} />
                    <h3 style={{ color: currentPalette.uiColors.primary }}>
                      GLOBAL LEADERBOARD
                    </h3>
                  </div>

                  {loadingLeaderboard ? (
                    <div className={styles.leaderboardLoading} style={{ color: currentPalette.uiColors.text }}>
                      <Loader type="hatch" size={30} color={currentPalette.uiColors.primary} />
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className={styles.leaderboardEmpty} style={{ color: currentPalette.uiColors.text }}>
                      <p>No players yet!</p>
                      <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                        Be the first!
                      </p>
                    </div>
                  ) : (
                    <div className={styles.leaderboardList}>
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.userId}
                          className={`${styles.leaderboardEntry} ${user?.uid === entry.userId ? styles.currentUser : ''}`}
                          style={{
                            background: user?.uid === entry.userId
                              ? hexToRgba(currentPalette.uiColors.primary, 0.15)
                              : index % 2 === 0
                                ? hexToRgba(currentPalette.uiColors.text, 0.03)
                                : 'transparent',
                            borderColor: user?.uid === entry.userId
                              ? hexToRgba(currentPalette.uiColors.primary, 0.4)
                              : 'transparent',
                          }}
                        >
                          {/* Medal/Rank */}
                          <div
                            className={styles.medalRank}
                            style={{
                              color: entry.rank && entry.rank <= 3
                                ? currentPalette.uiColors.accent
                                : currentPalette.uiColors.text
                            }}
                          >
                            {entry.rank ? getRankEmoji(entry.rank) : '—'}
                          </div>

                          {/* Profile Picture Avatar */}
                          <div
                            className={styles.leaderboardAvatar}
                            style={{
                              ...(entry.profilePicture
                                ? {
                                  backgroundImage: `url(${entry.profilePicture})`,
                                  backgroundSize: 'contain',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat',
                                  backgroundColor: '#000'
                                }
                                : {
                                  background: `linear-gradient(135deg, ${currentPalette.uiColors.primary} 0%, ${currentPalette.uiColors.secondary} 100%)`
                                }
                              ),
                              borderColor: user?.uid === entry.userId ? currentPalette.uiColors.primary : currentPalette.uiColors.text,
                            }}
                          >
                            {!entry.profilePicture && (
                              <span className={styles.leaderboardInitials}>
                                {entry.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            )}
                          </div>

                          {/* Player Info */}
                          <div className={styles.playerInfo}>
                            {/* Username */}
                            <div className={styles.playerName} style={{ color: currentPalette.uiColors.text }}>
                              {entry.username}
                              {user?.uid === entry.userId && (
                                <span style={{ color: currentPalette.uiColors.primary, marginLeft: '0.25rem' }}>(You)</span>
                              )}
                            </div>

                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                              {/* Score */}
                              <div className={styles.statItem}>
                                <span className={styles.statValue} style={{ color: currentPalette.uiColors.primary }}>
                                  {entry.totalScore.toLocaleString()}
                                </span>
                              </div>

                              {/* Level (Profile Level based on Score) */}
                              <div className={styles.statItem}>
                                <span className={styles.statValue} style={{ color: currentPalette.uiColors.text }}>
                                  Lvl {Math.floor(Math.sqrt(entry.totalScore / 500)) + 1}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    className={styles.viewFullButton}
                    onClick={onLeaderboard}
                    style={{
                      borderColor: currentPalette.uiColors.primary,
                      color: currentPalette.uiColors.primary,
                    }}
                  >
                    VIEW FULL LEADERBOARD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          palette={currentPalette}
          onClose={() => setShowAuth(false)}
          onSuccess={() => {
            setShowAuth(false);
            loadLeaderboardData(); // Refresh leaderboard after login
          }}
        />
      )}
    </div>
  );
}
