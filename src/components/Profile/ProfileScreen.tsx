'use client';

import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import AchievementBadge from './AchievementBadge';
import { 
  loadProfile, 
  loadAchievements, 
  getAllProfiles, 
  createProfile, 
  switchProfile,
  getCurrentProfileId,
  deleteProfile,
  resetProfile,
  linkWalletToProfile,
  unlinkWalletFromProfile,
  getProfileByWalletAddress
} from '@/lib/storage/gameStorage';
import { connectWallet, getWalletAddress, formatAddress, isWalletAvailable, onAccountsChanged } from '@/lib/wallet/walletUtils';
import { GameStats } from '@/types/profile';
import { ProfileMetadata } from '@/lib/storage/types';
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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  useEffect(() => {
    refreshData();
    checkWalletConnection();
    
    // Listen for wallet account changes
    if (isWalletAvailable()) {
      const unsubscribe = onAccountsChanged((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);

  const refreshData = async () => {
    const profileId = getCurrentProfileId();
    setCurrentProfileId(profileId);
    const allProfiles = getAllProfiles();
    setProfiles(allProfiles);

    if (profileId) {
      const profile = loadProfile();
      setStats(profile);
      setAchievements(loadAchievements().unlocked);
      setViewMode('profile');
      
      // Check if current profile has a linked wallet
      const currentProfile = allProfiles.find(p => p.id === profileId);
      if (currentProfile?.walletAddress) {
        // If profile has linked wallet, use that address
        setWalletAddress(currentProfile.walletAddress);
      } else {
        // Otherwise, check if wallet is connected but not linked
        if (isWalletAvailable()) {
          const connectedAddress = await getWalletAddress();
          setWalletAddress(connectedAddress);
        } else {
          setWalletAddress(null);
        }
      }
    } else {
      setStats(null);
      setAchievements([]);
      setViewMode(allProfiles.length > 0 ? 'login' : 'create');
      setWalletAddress(null);
    }
  };

  const checkWalletConnection = async () => {
    if (isWalletAvailable()) {
      const address = await getWalletAddress();
      setWalletAddress(address);
    }
  };

  const handleConnectWallet = async () => {
    if (!isWalletAvailable()) {
      setError('No wallet found. Please install MetaMask or another Web3 wallet.');
      return;
    }

    setIsConnectingWallet(true);
    setError(null);

    try {
      const address = await connectWallet();
      if (!address) {
        throw new Error('Failed to get wallet address');
      }

      const profileId = getCurrentProfileId();
      if (!profileId) {
        setError('Please create or select a profile first');
        setWalletAddress(null);
        return;
      }

      // Check if wallet is already linked to another profile
      const existingProfile = getProfileByWalletAddress(address);
      if (existingProfile && existingProfile.id !== profileId) {
        setError(`This wallet is already linked to profile "${existingProfile.name}"`);
        setWalletAddress(null);
        return;
      }

      // Link wallet to current profile
      linkWalletToProfile(profileId, address);
      setWalletAddress(address);
      refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setWalletAddress(null);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = () => {
    const profileId = getCurrentProfileId();
    if (profileId) {
      unlinkWalletFromProfile(profileId);
      setWalletAddress(null);
      refreshData();
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
              <span className={styles.currentProfileName}>{currentProfile.name}</span>
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

        {/* Wallet Connection Section */}
        <div className={styles.walletSection}>
          <h2 className={styles.walletTitle}>Wallet Connection</h2>
          {walletAddress ? (
            <div className={styles.walletConnected}>
              <div className={styles.walletInfo}>
                <span className={styles.walletLabel}>Connected:</span>
                <span className={styles.walletAddress}>{formatAddress(walletAddress)}</span>
              </div>
              <button
                className={styles.disconnectButton}
                onClick={handleDisconnectWallet}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className={styles.walletNotConnected}>
              <p className={styles.walletDescription}>
                Connect your wallet to link it with your profile and stats.
              </p>
              <button
                className={styles.connectButton}
                onClick={handleConnectWallet}
                disabled={isConnectingWallet || !isWalletAvailable()}
              >
                {isConnectingWallet ? 'Connecting...' : isWalletAvailable() ? 'Connect Wallet' : 'Wallet Not Available'}
              </button>
              {!isWalletAvailable() && (
                <p className={styles.walletHint}>
                  Install MetaMask or another Web3 wallet to connect.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className={styles.error} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className={styles.statsGrid}>
          <StatsCard
            label="Total Words Found"
            value={stats.totalWordsFound.toLocaleString()}
            icon="🔍"
            variant="highlight"
          />
          <StatsCard
            label="Levels Completed"
            value={stats.levelsCompleted}
            icon="🎮"
          />
          <StatsCard
            label="Best Score"
            value={stats.bestScore.toLocaleString()}
            icon="⭐"
          />
          <StatsCard
            label="Average Accuracy"
            value={`${stats.averageAccuracy.toFixed(1)}%`}
            icon="🎯"
          />
          <StatsCard
            label="Total Play Time"
            value={formatTime(stats.totalPlayTime)}
            icon="⏱"
          />
          <StatsCard
            label="Current Level"
            value={stats.currentLevel}
            icon="📈"
          />
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

