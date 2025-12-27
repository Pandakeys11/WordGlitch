'use client';

import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import AchievementBadge from './AchievementBadge';
import ProfileCard from './ProfileCard';
import { 
  loadProfile, 
  loadAchievements, 
  getAllProfiles, 
  createProfile, 
  switchProfile,
  getCurrentProfileId,
  deleteProfile,
  resetProfile
} from '@/lib/storage/gameStorage';
import { syncCurrencyWithTotalScore, getCurrencyBalance } from '@/lib/antFarm/currency';
import { GameStats } from '@/types/profile';
import { ProfileMetadata } from '@/lib/storage/types';
import {
  TrophyIcon,
  ClockIcon,
  SearchIcon,
  GamepadIcon,
  StarIcon,
  TrendingUpIcon,
  TargetIcon,
  BarChartIcon,
  ZapIcon,
  RocketIcon,
  HandIcon,
  CheckIcon,
  HundredIcon,
  FlameIcon,
  MedalIcon
} from '@/components/UI/GameIcons';
import styles from './ProfileScreen.module.css';

interface ProfileScreenProps {
  onBack: () => void;
}

type ViewMode = 'login' | 'profile' | 'create';

export default function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [achievements, setAchievements] = useState(loadAchievements().unlocked);
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [profiles, setProfiles] = useState<ProfileMetadata[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currency, setCurrency] = useState<number>(0);

  useEffect(() => {
    refreshData();
  }, []);

  // Update currency when stats change
  useEffect(() => {
    if (stats) {
      syncCurrencyWithTotalScore(stats.totalScore);
      setCurrency(getCurrencyBalance());
    } else {
      setCurrency(0);
    }
  }, [stats]);

  const refreshData = () => {
    const profileId = getCurrentProfileId();
    setCurrentProfileId(profileId);
    const allProfiles = getAllProfiles();
    setProfiles(allProfiles);

    if (profileId) {
      const profile = loadProfile();
      setStats(profile);
      setAchievements(loadAchievements().unlocked);
      setViewMode('profile');
      // Currency will be synced in the useEffect that watches stats
    } else {
      setStats(null);
      setAchievements([]);
      setViewMode(allProfiles.length > 0 ? 'login' : 'create');
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) {
      setError('Please enter a profile name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const profileId = createProfile(newProfileName.trim());
      setNewProfileName('');
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (profileId: string) => {
    try {
      switchProfile(profileId);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to switch profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('word-glitch-current-profile');
    refreshData();
  };

  const handleDeleteProfile = (profileId: string) => {
    if (window.confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      deleteProfile(profileId);
      refreshData();
    }
  };

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset your progress? This will:\n\n• Reset your level to 1\n• Reset all scores to 0\n• Reset total play time to 0\n• Reset unlocked levels\n\nThis action cannot be undone. Achievements will be preserved.')) {
      try {
        resetProfile();
        refreshData();
        alert('Profile has been reset successfully!');
      } catch (err: any) {
        setError(err.message || 'Failed to reset profile');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Login/Create View
  if (viewMode === 'login' || viewMode === 'create') {
    return (
      <div className={styles.profileScreen}>
        <div className={styles.container}>
          <button className={styles.backButton} onClick={onBack}>
            ← Back
          </button>

          <h1 className={styles.title}>
            {viewMode === 'create' ? 'Create Profile' : 'Select Profile'}
          </h1>

          {viewMode === 'create' && (
            <div className={styles.createForm}>
              <input
                type="text"
                className={styles.nameInput}
                placeholder="Enter profile name"
                value={newProfileName}
                onChange={(e) => {
                  setNewProfileName(e.target.value);
                  setError(null);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleCreateProfile();
                  }
                }}
                maxLength={20}
                autoFocus
              />
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.buttonGroup}>
                <button
                  className={styles.primaryButton}
                  onClick={handleCreateProfile}
                  disabled={isLoading || !newProfileName.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create Profile'}
                </button>
                {profiles.length > 0 && (
                  <button
                    className={styles.secondaryButton}
                    onClick={() => setViewMode('login')}
                  >
                    Login Instead
                  </button>
                )}
              </div>
            </div>
          )}

          {viewMode === 'login' && (
            <div className={styles.loginView}>
              {profiles.length === 0 ? (
                <div className={styles.empty}>
                  <p>No profiles found. Create a new profile to get started!</p>
                  <button
                    className={styles.primaryButton}
                    onClick={() => setViewMode('create')}
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.profileList}>
                    {profiles.map((profile) => (
                      <div key={profile.id} className={styles.profileCard}>
                        <div className={styles.profileInfo}>
                          <h3 className={styles.profileName}>{profile.name}</h3>
                          <p className={styles.profileMeta}>
                            Last played: {new Date(profile.lastPlayed).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={styles.profileActions}>
                          <button
                            className={styles.loginButton}
                            onClick={() => handleLogin(profile.id)}
                          >
                            Login
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteProfile(profile.id)}
                            title="Delete profile"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.createNewButton}
                    onClick={() => setViewMode('create')}
                  >
                    + Create New Profile
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Profile View
  if (!stats) {
    return (
      <div className={styles.profileScreen}>
        <div className={styles.container}>
          <button className={styles.backButton} onClick={onBack}>
            ← Back
          </button>
          <div className={styles.empty}>
            <p>No profile data yet. Play the game to start tracking your stats!</p>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  return (
    <div className={styles.profileScreen}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <div className={styles.profileHeader}>
          <h1 className={styles.title}>Profile</h1>
          {currentProfile && (
            <div className={styles.profileHeaderActions}>
              {profiles.length > 1 && (
                <button
                  className={styles.switchButton}
                  onClick={() => setViewMode('login')}
                >
                  Switch Profile
                </button>
              )}
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        {currentProfile && (
          <ProfileCard
            profile={currentProfile}
            onUpdate={refreshData}
            currency={currency}
          />
        )}

        {error && (
          <div className={styles.error} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Overview Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.statsGrid}>
            <StatsCard
              label="Total Score"
              value={stats.totalScore.toLocaleString()}
              icon={<TrophyIcon size={32} />}
              variant="highlight"
            />
            <StatsCard
              label="Total Time"
              value={formatTime(stats.totalPlayTime)}
              icon={<ClockIcon size={32} />}
              variant="highlight"
            />
            <StatsCard
              label="Total Words Found"
              value={stats.totalWordsFound.toLocaleString()}
              icon={<SearchIcon size={32} />}
              variant="highlight"
            />
            <StatsCard
              label="Total Rounds Played"
              value={stats.totalRoundsPlayed || stats.levelsCompleted}
              icon={<GamepadIcon size={32} />}
              variant="highlight"
            />
          </div>
        </div>

        {/* Performance Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Performance</h2>
          <div className={styles.statsGrid}>
            <StatsCard
              label="Best Round Score"
              value={(stats.bestRoundScore || stats.bestScore).toLocaleString()}
              icon={<StarIcon size={32} />}
            />
            <StatsCard
              label="Highest Round"
              value={stats.highestRound || stats.currentLevel}
              icon={<TrendingUpIcon size={32} />}
            />
            <StatsCard
              label="Best Accuracy"
              value={`${(stats.bestAccuracy || stats.averageAccuracy).toFixed(1)}%`}
              icon={<TargetIcon size={32} />}
            />
            <StatsCard
              label="Average Accuracy"
              value={`${stats.averageAccuracy.toFixed(1)}%`}
              icon={<BarChartIcon size={32} />}
            />
            <StatsCard
              label="Fastest Round"
              value={stats.fastestRoundTime !== undefined && stats.fastestRoundTime !== Infinity && stats.fastestRoundTime > 0
                ? formatTime(Math.round(stats.fastestRoundTime))
                : 'N/A'}
              icon={<ZapIcon size={32} />}
            />
            <StatsCard
              label="Average Round Time"
              value={stats.averageRoundTime !== undefined && stats.averageRoundTime > 0 
                ? formatTime(Math.round(stats.averageRoundTime))
                : 'N/A'}
              icon={<ClockIcon size={32} />}
            />
          </div>
        </div>

        {/* Efficiency Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Efficiency</h2>
          <div className={styles.statsGrid}>
            <StatsCard
              label="Words Per Minute"
              value={stats.wordsPerMinute > 0 
                ? stats.wordsPerMinute.toFixed(1)
                : '0.0'}
              icon={<RocketIcon size={32} />}
            />
            <StatsCard
              label="Average Score Per Round"
              value={stats.averageScorePerRound > 0 
                ? Math.round(stats.averageScorePerRound).toLocaleString()
                : '0'}
              icon={<TrendingUpIcon size={32} />}
            />
            <StatsCard
              label="Total Attempts"
              value={(stats.totalAttempts || 0).toLocaleString()}
              icon={<HandIcon size={32} />}
            />
            <StatsCard
              label="Total Correct Finds"
              value={(stats.totalCorrectFinds || stats.totalWordsFound).toLocaleString()}
              icon={<CheckIcon size={32} />}
            />
            {stats.totalAttempts > 0 && (
              <StatsCard
                label="Success Rate"
                value={`${((stats.totalCorrectFinds || stats.totalWordsFound) / stats.totalAttempts * 100).toFixed(1)}%`}
                icon={<TargetIcon size={32} />}
              />
            )}
          </div>
        </div>

        {/* Achievement Stats Section */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          <div className={styles.statsGrid}>
            <StatsCard
              label="Perfect Rounds"
              value={stats.perfectRounds || 0}
              icon={<HundredIcon size={32} />}
            />
            <StatsCard
              label="Longest Combo"
              value={stats.longestCombo || 0}
              icon={<FlameIcon size={32} />}
            />
            <StatsCard
              label="Current Level"
              value={stats.currentLevel}
              icon={<GamepadIcon size={32} />}
            />
            <StatsCard
              label="Levels Completed"
              value={stats.levelsCompleted}
              icon={<MedalIcon size={32} />}
            />
          </div>
        </div>

        <div className={styles.achievementsSection}>
          <h2 className={styles.sectionTitle}>Achievements</h2>
          {achievements.length === 0 ? (
            <div className={styles.emptyAchievements}>
              <p>No achievements unlocked yet. Keep playing to earn badges!</p>
            </div>
          ) : (
            <div className={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </div>
          )}
        </div>

        <div className={styles.resetSection}>
          <button
            className={styles.resetButton}
            onClick={handleResetProfile}
          >
            Reset Progress
          </button>
          <p className={styles.resetDescription}>
            Reset your level to 1, clear all scores and times, and start fresh. Achievements will be preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

