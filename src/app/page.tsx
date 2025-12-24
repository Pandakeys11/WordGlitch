'use client';

import React, { useState, useEffect } from 'react';
import MenuScreen from '@/components/Menu/MenuScreen';
import GameScreen from '@/components/Game/GameScreen';
import ProfileScreen from '@/components/Profile/ProfileScreen';
import LeaderboardScreen from '@/components/Leaderboard/LeaderboardScreen';
import SettingsScreen from '@/components/Settings/SettingsScreen';

type Screen = 'menu' | 'game' | 'profile' | 'leaderboard' | 'settings';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameLevel, setGameLevel] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved level
    try {
      const { getCurrentLevel } = require('@/lib/game/levelSystem');
      setGameLevel(getCurrentLevel());
    } catch (e) {
      console.error('Error loading level:', e);
    }
  }, []);

  // Refresh level when returning to menu (in case profile was reset)
  useEffect(() => {
    if (screen === 'menu') {
      try {
        const { getCurrentLevel } = require('@/lib/game/levelSystem');
        setGameLevel(getCurrentLevel());
      } catch (e) {
        console.error('Error loading level:', e);
      }
    }
  }, [screen]);

  if (!mounted) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
      }}>
        Loading...
      </div>
    );
  }

  const handlePlay = () => {
    setScreen('game');
  };

  const handleProfile = () => {
    setScreen('profile');
  };

  const handleLeaderboard = () => {
    setScreen('leaderboard');
  };

  const handleSettings = () => {
    setScreen('settings');
  };

  const handleMenu = () => {
    setScreen('menu');
  };

  const handleLevelComplete = (newLevel: number) => {
    setGameLevel(newLevel);
    // Automatically continue to next level instead of going to menu
    setScreen('game');
  };

  switch (screen) {
    case 'game':
      return (
        <GameScreen
          level={gameLevel}
          onMenu={handleMenu}
          onLevelComplete={handleLevelComplete}
        />
      );
    case 'profile':
      return <ProfileScreen onBack={handleMenu} />;
    case 'leaderboard':
      return <LeaderboardScreen onBack={handleMenu} />;
    case 'settings':
      return <SettingsScreen onBack={handleMenu} />;
    default:
      return (
        <MenuScreen
          onPlay={handlePlay}
          onProfile={handleProfile}
          onLeaderboard={handleLeaderboard}
          onSettings={handleSettings}
        />
      );
  }
}

