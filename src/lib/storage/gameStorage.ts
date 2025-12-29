import { 
  StoredProfile, 
  StoredProgress, 
  StoredAchievements, 
  StoredLeaderboard,
  GameSettings,
  ProfileMetadata,
  StoredProfiles
} from './types';
import { GameStats, Achievement, LeaderboardEntry } from '@/types/profile';
import { GameSession } from '@/types/game';
import { STORAGE_KEYS } from '@/lib/constants';

// Profile Management
function getProfileKey(profileId: string): string {
  return `${STORAGE_KEYS.PROFILE}-${profileId}`;
}

function getProgressKey(profileId: string): string {
  return `${STORAGE_KEYS.PROGRESS}-${profileId}`;
}

function getAchievementsKey(profileId: string): string {
  return `${STORAGE_KEYS.ACHIEVEMENTS}-${profileId}`;
}

export function getCurrentProfileId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
  } catch {
    return null;
  }
}

export function setCurrentProfileId(profileId: string): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileId);
}

function loadProfilesList(): StoredProfiles {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!data) {
      return { profiles: [] };
    }
    return JSON.parse(data) as StoredProfiles;
  } catch {
    return { profiles: [] };
  }
}

function saveProfilesList(profiles: StoredProfiles): void {
  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
}

export function getAllProfiles(): ProfileMetadata[] {
  const stored = loadProfilesList();
  return stored.profiles.sort((a, b) => b.lastPlayed - a.lastPlayed);
}

export function createProfile(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Profile name cannot be empty');
  }

  const profiles = loadProfilesList();
  
  // Check if name already exists
  if (profiles.profiles.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('A profile with this name already exists');
  }

  const profileId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const newProfile: ProfileMetadata = {
    id: profileId,
    name: trimmedName,
    createdAt: now,
    lastPlayed: now,
  };

  profiles.profiles.push(newProfile);
  saveProfilesList(profiles);

  // Initialize empty stats for new profile
  const initialStats: GameStats = {
    totalWordsFound: 0,
    levelsCompleted: 0,
    bestScore: 0,
    totalScore: 0,
    averageAccuracy: 100,
    totalPlayTime: 0,
    currentLevel: 1,
    unlockedLevels: [1],
    // Extended statistics
    totalRoundsPlayed: 0,
    highestRound: 1,
    bestRoundScore: 0,
    fastestRoundTime: Infinity,
    averageRoundTime: 0,
    averageScorePerRound: 0,
    totalAttempts: 0,
    totalCorrectFinds: 0,
    longestCombo: 0,
    perfectRounds: 0,
    wordsPerMinute: 0,
    bestAccuracy: 0,
  };

  saveProfileForId(profileId, initialStats);
  setCurrentProfileId(profileId);

  return profileId;
}

export function switchProfile(profileId: string): void {
  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Update last played
  profile.lastPlayed = Date.now();
  saveProfilesList(profiles);
  setCurrentProfileId(profileId);
}

export function linkWalletToProfile(profileId: string, walletAddress: string): void {
  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Check if wallet is already linked to another profile
  const existingProfile = profiles.profiles.find(
    p => p.id !== profileId && p.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
  );
  
  if (existingProfile) {
    throw new Error(`This wallet is already linked to profile "${existingProfile.name}"`);
  }

  profile.walletAddress = walletAddress;
  saveProfilesList(profiles);
}

export function unlinkWalletFromProfile(profileId: string): void {
  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  profile.walletAddress = undefined;
  saveProfilesList(profiles);
}

export function getProfileByWalletAddress(walletAddress: string): ProfileMetadata | null {
  const profiles = loadProfilesList();
  return profiles.profiles.find(
    p => p.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
  ) || null;
}

export function updateProfileName(profileId: string, newName: string): void {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    throw new Error('Profile name cannot be empty');
  }

  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Check if name already exists (excluding current profile)
  if (profiles.profiles.some(p => p.id !== profileId && p.name.toLowerCase() === trimmedName.toLowerCase())) {
    throw new Error('A profile with this name already exists');
  }

  profile.name = trimmedName;
  saveProfilesList(profiles);
}

export function updateProfilePicture(profileId: string, pictureDataUrl: string | null): void {
  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  profile.profilePicture = pictureDataUrl || undefined;
  saveProfilesList(profiles);
}

export function getProfileMetadata(profileId: string): ProfileMetadata | null {
  const profiles = loadProfilesList();
  return profiles.profiles.find(p => p.id === profileId) || null;
}

export function deleteProfile(profileId: string): void {
  const profiles = loadProfilesList();
  profiles.profiles = profiles.profiles.filter(p => p.id !== profileId);
  saveProfilesList(profiles);

  // Clean up profile data
  localStorage.removeItem(getProfileKey(profileId));
  localStorage.removeItem(getProgressKey(profileId));
  localStorage.removeItem(getAchievementsKey(profileId));

  // If this was the current profile, clear it
  if (getCurrentProfileId() === profileId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
  }
}

// Profile Storage (now profile-specific)
function saveProfileForId(profileId: string, stats: GameStats): void {
  const profile: StoredProfile = {
    stats,
    lastPlayed: Date.now(),
  };
  localStorage.setItem(getProfileKey(profileId), JSON.stringify(profile));
}

export function saveProfile(stats: GameStats): void {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    throw new Error('No active profile. Please create or login to a profile first.');
  }
  saveProfileForId(profileId, stats);
  
  // Update last played in profiles list
  const profiles = loadProfilesList();
  const profile = profiles.profiles.find(p => p.id === profileId);
  if (profile) {
    profile.lastPlayed = Date.now();
    saveProfilesList(profiles);
  }
}

/**
 * Migrate old GameStats to include new extended statistics fields
 */
function migrateStats(stats: GameStats): GameStats {
  // If stats already has all new fields, return as-is
  if ('totalRoundsPlayed' in stats && stats.totalRoundsPlayed !== undefined) {
    return stats;
  }

  // Migrate old stats to new format
  return {
    ...stats,
    totalRoundsPlayed: stats.levelsCompleted,
    highestRound: stats.currentLevel,
    bestRoundScore: stats.bestScore,
    fastestRoundTime: Infinity, // Unknown for old profiles - will be set on next round
    averageRoundTime: stats.levelsCompleted > 0 ? stats.totalPlayTime / stats.levelsCompleted : 0,
    averageScorePerRound: stats.levelsCompleted > 0 ? stats.totalScore / stats.levelsCompleted : 0,
    totalAttempts: stats.totalWordsFound, // Estimate: assume 1 attempt per word found
    totalCorrectFinds: stats.totalWordsFound,
    longestCombo: 0, // Unknown for old profiles
    perfectRounds: 0, // Unknown for old profiles
    wordsPerMinute: stats.totalPlayTime > 0 ? (stats.totalWordsFound / stats.totalPlayTime) * 60 : 0,
    bestAccuracy: stats.averageAccuracy, // Use average as best estimate
  };
}

function loadProfileForId(profileId: string): GameStats | null {
  try {
    const data = localStorage.getItem(getProfileKey(profileId));
    if (!data) return null;
    const profile: StoredProfile = JSON.parse(data);
    const stats = profile.stats;
    // Migrate stats if needed
    const migratedStats = migrateStats(stats);
    // Save migrated stats back if migration occurred
    if (migratedStats !== stats) {
      saveProfileForId(profileId, migratedStats);
    }
    return migratedStats;
  } catch {
    return null;
  }
}

export function loadProfile(): GameStats | null {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    // Backward compatibility: try to load old profile format
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        const profile: StoredProfile = JSON.parse(data);
        // Migrate old profile to new system
        const migratedId = createProfile('Player');
        saveProfileForId(migratedId, profile.stats);
        setCurrentProfileId(migratedId);
        return profile.stats;
      }
    } catch {
      // Ignore migration errors
    }
    return null;
  }
  return loadProfileForId(profileId);
}

// Progress Storage (now profile-specific)
function saveProgressForId(profileId: string, level: number, unlockedLevels: number[], bestScore: number): void {
  const existing = loadProgressForId(profileId);
  const progress: StoredProgress = {
    currentLevel: level,
    unlockedLevels: [...new Set([...unlockedLevels, level])],
    bestScores: {
      ...existing?.bestScores,
      [level]: Math.max(existing?.bestScores[level] || 0, bestScore),
    },
  };
  localStorage.setItem(getProgressKey(profileId), JSON.stringify(progress));
}

export function saveProgress(level: number, unlockedLevels: number[], bestScore: number): void {
  const profileId = getCurrentProfileId();
  if (!profileId) return;
  saveProgressForId(profileId, level, unlockedLevels, bestScore);
}

function loadProgressForId(profileId: string): StoredProgress | null {
  try {
    const data = localStorage.getItem(getProgressKey(profileId));
    if (!data) return null;
    return JSON.parse(data) as StoredProgress;
  } catch {
    return null;
  }
}

export function loadProgress(): StoredProgress | null {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    // Backward compatibility
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) return JSON.parse(data) as StoredProgress;
    } catch {
      // Ignore
    }
    return null;
  }
  return loadProgressForId(profileId);
}

// Achievement Storage (now profile-specific)
function saveAchievementForId(profileId: string, achievement: Achievement): void {
  const existing = loadAchievementsForId(profileId);
  const achievements: StoredAchievements = {
    unlocked: [
      ...existing.unlocked.filter(a => a.id !== achievement.id),
      { ...achievement, unlockedAt: Date.now() },
    ],
  };
  localStorage.setItem(getAchievementsKey(profileId), JSON.stringify(achievements));
}

export function saveAchievement(achievement: Achievement): void {
  const profileId = getCurrentProfileId();
  if (!profileId) return;
  saveAchievementForId(profileId, achievement);
}

function loadAchievementsForId(profileId: string): StoredAchievements {
  try {
    const data = localStorage.getItem(getAchievementsKey(profileId));
    if (!data) {
      return { unlocked: [] };
    }
    return JSON.parse(data) as StoredAchievements;
  } catch {
    return { unlocked: [] };
  }
}

export function loadAchievements(): StoredAchievements {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    // Backward compatibility
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) return JSON.parse(data) as StoredAchievements;
    } catch {
      // Ignore
    }
    return { unlocked: [] };
  }
  return loadAchievementsForId(profileId);
}

export function hasAchievement(achievementId: string): boolean {
  const achievements = loadAchievements();
  return achievements.unlocked.some(a => a.id === achievementId);
}

// Leaderboard Storage
export function saveScore(entry: LeaderboardEntry): void {
  const profileId = getCurrentProfileId();
  if (profileId) {
    const profiles = loadProfilesList();
    const profile = profiles.profiles.find(p => p.id === profileId);
    if (profile) {
      entry.profileName = profile.name;
      entry.profileId = profileId;
      entry.walletAddress = profile.walletAddress;
    }
  }
  
  const leaderboard = loadLeaderboard();
  leaderboard.entries.push(entry);
  // Sort by time (faster is better) and accuracy (higher is better)
  // Primary sort: time (ascending - lower time is better)
  // Secondary sort: accuracy (descending - higher accuracy is better)
  leaderboard.entries.sort((a, b) => {
    // If both have levelTime, sort by time first
    if (a.levelTime !== undefined && b.levelTime !== undefined) {
      const timeDiff = a.levelTime - b.levelTime;
      if (timeDiff !== 0) return timeDiff; // Faster time wins
      // If times are equal, sort by accuracy (higher is better)
      return b.accuracy - a.accuracy;
    }
    // If only one has levelTime, prioritize it
    if (a.levelTime !== undefined) return -1;
    if (b.levelTime !== undefined) return 1;
    // If neither has levelTime, fall back to accuracy
    return b.accuracy - a.accuracy;
  });
  leaderboard.entries = leaderboard.entries.slice(0, leaderboard.maxEntries);
  localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
}

/**
 * Get leaderboard with only top score per profile
 * Groups entries by profile and shows the best entry for each profile
 */
export function getLeaderboard(limit?: number): LeaderboardEntry[] {
  const leaderboard = loadLeaderboard();
  const profiles = loadProfilesList();
  
  // Group entries by profileId
  const entriesByProfile = new Map<string, LeaderboardEntry[]>();
  
  leaderboard.entries.forEach(entry => {
    if (entry.profileId) {
      if (!entriesByProfile.has(entry.profileId)) {
        entriesByProfile.set(entry.profileId, []);
      }
      entriesByProfile.get(entry.profileId)!.push(entry);
    }
  });
  
  // For each profile, get the best entry (highest score)
  const topEntries: LeaderboardEntry[] = [];
  
  entriesByProfile.forEach((entries, profileId) => {
    // Find the best entry (highest score)
    const bestEntry = entries.reduce((best, current) => {
      if (current.score > best.score) return current;
      if (current.score === best.score) {
        // If scores are equal, prefer faster time and higher accuracy
        if (current.levelTime !== undefined && best.levelTime !== undefined) {
          if (current.levelTime < best.levelTime) return current;
          if (current.levelTime === best.levelTime && current.accuracy > best.accuracy) return current;
        }
        if (current.levelTime !== undefined) return current;
        if (current.accuracy > best.accuracy) return current;
      }
      return best;
    });
    
    // Get profile metadata and stats
    const profile = profiles.profiles.find(p => p.id === profileId);
    const profileStats = profile ? loadProfileForId(profileId) : null;
    
    // Create enhanced entry with profile data
    const enhancedEntry: LeaderboardEntry = {
      ...bestEntry,
      profileName: profile?.name || bestEntry.profileName,
      profileId: profileId,
      walletAddress: profile?.walletAddress,
      totalScore: profileStats?.totalScore || 0,
      totalTime: profileStats?.totalPlayTime || 0,
    };
    
    topEntries.push(enhancedEntry);
  });
  
  // Sort by total score (descending), then by total time (ascending - faster is better)
  topEntries.sort((a, b) => {
    const totalScoreA = a.totalScore || a.score;
    const totalScoreB = b.totalScore || b.score;
    
    if (totalScoreB !== totalScoreA) {
      return totalScoreB - totalScoreA; // Higher total score is better
    }
    
    // If total scores are equal, sort by total time (faster is better)
    const totalTimeA = a.totalTime || 0;
    const totalTimeB = b.totalTime || 0;
    
    if (totalTimeA !== totalTimeB) {
      return totalTimeA - totalTimeB; // Faster time is better
    }
    
    // If times are equal, sort by level (higher is better)
    return b.level - a.level;
  });
  
  return limit ? topEntries.slice(0, limit) : topEntries;
}

export function getLeaderboardByLevel(level: number, limit = 10): LeaderboardEntry[] {
  const leaderboard = loadLeaderboard();
  const profiles = loadProfilesList();
  
  // Filter entries by level and group by profileId
  const entriesByProfile = new Map<string, LeaderboardEntry[]>();
  
  leaderboard.entries
    .filter(entry => entry.level === level && entry.profileId)
    .forEach(entry => {
      if (!entriesByProfile.has(entry.profileId!)) {
        entriesByProfile.set(entry.profileId!, []);
      }
      entriesByProfile.get(entry.profileId!)!.push(entry);
    });
  
  // For each profile, get the best entry for this level
  const topEntries: LeaderboardEntry[] = [];
  
  entriesByProfile.forEach((entries, profileId) => {
    // Find the best entry (highest score, then fastest time, then highest accuracy)
    const bestEntry = entries.reduce((best, current) => {
      if (current.score > best.score) return current;
      if (current.score === best.score) {
        if (current.levelTime !== undefined && best.levelTime !== undefined) {
          if (current.levelTime < best.levelTime) return current;
          if (current.levelTime === best.levelTime && current.accuracy > best.accuracy) return current;
        }
        if (current.levelTime !== undefined) return current;
        if (current.accuracy > best.accuracy) return current;
      }
      return best;
    });
    
    // Get profile metadata and stats
    const profile = profiles.profiles.find(p => p.id === profileId);
    const profileStats = profile ? loadProfileForId(profileId) : null;
    
    // Create enhanced entry with profile data
    const enhancedEntry: LeaderboardEntry = {
      ...bestEntry,
      profileName: profile?.name || bestEntry.profileName,
      profileId: profileId,
      walletAddress: profile?.walletAddress,
      totalScore: profileStats?.totalScore || 0,
      totalTime: profileStats?.totalPlayTime || 0,
    };
    
    topEntries.push(enhancedEntry);
  });
  
  // Sort by level time (faster is better) and accuracy (higher is better)
  topEntries.sort((a, b) => {
    if (a.levelTime !== undefined && b.levelTime !== undefined) {
      const timeDiff = a.levelTime - b.levelTime;
      if (timeDiff !== 0) return timeDiff; // Faster time wins
      return b.accuracy - a.accuracy; // Higher accuracy wins if times are equal
    }
    if (a.levelTime !== undefined) return -1;
    if (b.levelTime !== undefined) return 1;
    return b.accuracy - a.accuracy;
  });
  
  return topEntries.slice(0, limit);
}

function loadLeaderboard(): StoredLeaderboard {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!data) {
      return { entries: [], maxEntries: 100 };
    }
    return JSON.parse(data) as StoredLeaderboard;
  } catch {
    return { entries: [], maxEntries: 100 };
  }
}

// Settings Storage
export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadSettings(): GameSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      return {
        soundEnabled: true,
        musicEnabled: false,
        vibrationEnabled: true,
        colorPalette: 'ocean', // Default palette
      };
    }
    const settings = JSON.parse(data) as GameSettings;
    // Ensure colorPalette is set (for backward compatibility)
    if (!settings.colorPalette) {
      settings.colorPalette = 'ocean';
    }
    return settings;
  } catch {
    return {
      soundEnabled: true,
      musicEnabled: false,
      vibrationEnabled: true,
      colorPalette: 'ocean',
    };
  }
}

// Update Stats
/**
 * Reset profile to initial state (level 1, all scores and times reset)
 */
export function resetProfile(): void {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    throw new Error('No active profile. Please create or login to a profile first.');
  }

  // Reset profile stats to initial values
  const initialStats: GameStats = {
    totalWordsFound: 0,
    levelsCompleted: 0,
    bestScore: 0,
    totalScore: 0,
    averageAccuracy: 100,
    totalPlayTime: 0,
    currentLevel: 1,
    unlockedLevels: [1],
    // Extended statistics
    totalRoundsPlayed: 0,
    highestRound: 1,
    bestRoundScore: 0,
    fastestRoundTime: Infinity,
    averageRoundTime: 0,
    averageScorePerRound: 0,
    totalAttempts: 0,
    totalCorrectFinds: 0,
    longestCombo: 0,
    perfectRounds: 0,
    wordsPerMinute: 0,
    bestAccuracy: 0,
  };
  saveProfileForId(profileId, initialStats);

  // Reset progress to initial values
  const initialProgress: StoredProgress = {
    currentLevel: 1,
    unlockedLevels: [1],
    bestScores: {},
  };
  localStorage.setItem(getProgressKey(profileId), JSON.stringify(initialProgress));
}

export function updateStats(session: GameSession): void {
  const profileId = getCurrentProfileId();
  if (!profileId) {
    // Silently fail if no profile is active - user should create/login first
    console.warn('Cannot update stats: No active profile');
    return;
  }

  const existing = loadProfile();
  if (!existing) {
    // Use levelTime from score if available, otherwise calculate from session times
    // Use consistent rounding (round to nearest second) for accuracy
    const playTime = session.score.levelTime !== undefined
      ? Math.round(session.score.levelTime)
      : (session.endTime && session.startTime 
          ? Math.round((session.endTime - session.startTime) / 1000)
          : 0);

    const isPerfectRound = session.score.accuracy >= 100;
    const wordsPerMin = playTime > 0 ? (session.score.wordsFound / playTime) * 60 : 0;

    const newStats: GameStats = {
      totalWordsFound: session.score.wordsFound,
      levelsCompleted: 1,
      bestScore: session.score.finalScore,
      totalScore: session.score.finalScore, // First level, so total = level score
      averageAccuracy: session.score.accuracy,
      totalPlayTime: playTime,
      currentLevel: session.level,
      unlockedLevels: [session.level],
      // Extended statistics
      totalRoundsPlayed: 1,
      highestRound: session.level,
      bestRoundScore: session.score.finalScore,
      fastestRoundTime: playTime,
      averageRoundTime: playTime,
      averageScorePerRound: session.score.finalScore,
      totalAttempts: session.attempts,
      totalCorrectFinds: session.correctFinds,
      longestCombo: session.maxCombo,
      perfectRounds: isPerfectRound ? 1 : 0,
      wordsPerMinute: wordsPerMin,
      bestAccuracy: session.score.accuracy,
    };
    try {
      saveProfile(newStats);
    } catch (err) {
      console.error('Failed to save profile stats:', err);
    }
    return;
  }

  // Use levelTime from score if available, otherwise calculate from session times
  // Use consistent rounding (round to nearest second) for accuracy
  const playTime = session.score.levelTime !== undefined 
    ? Math.round(session.score.levelTime)
    : (session.endTime && session.startTime
        ? Math.round((session.endTime - session.startTime) / 1000)
        : 0);

  const newRoundsPlayed = existing.levelsCompleted + 1;
  const isPerfectRound = session.score.accuracy >= 100;
  const totalWords = existing.totalWordsFound + session.score.wordsFound;
  const totalTime = existing.totalPlayTime + playTime;
  const wordsPerMin = totalTime > 0 ? (totalWords / totalTime) * 60 : 0;

  // Calculate fastest round time (handle Infinity/undefined for first round)
  const existingFastest = existing.fastestRoundTime !== undefined && existing.fastestRoundTime !== Infinity
    ? existing.fastestRoundTime
    : Infinity;
  const fastestTime = existingFastest === Infinity 
    ? playTime 
    : Math.min(existingFastest, playTime);

  // Calculate average round time
  const avgRoundTime = totalTime / newRoundsPlayed;

  // Calculate average score per round
  const avgScorePerRound = (existing.totalScore + session.score.finalScore) / newRoundsPlayed;

  const updatedStats: GameStats = {
    totalWordsFound: totalWords,
    levelsCompleted: newRoundsPlayed,
    bestScore: Math.max(existing.bestScore, session.score.finalScore),
    totalScore: existing.totalScore + session.score.finalScore, // Accumulate total score across all levels
    averageAccuracy: (existing.averageAccuracy * existing.levelsCompleted + session.score.accuracy) / newRoundsPlayed,
    totalPlayTime: totalTime,
    currentLevel: Math.max(existing.currentLevel, session.level),
    unlockedLevels: [...new Set([...existing.unlockedLevels, session.level])],
    // Extended statistics
    totalRoundsPlayed: newRoundsPlayed,
    highestRound: Math.max(existing.highestRound || existing.currentLevel, session.level),
    bestRoundScore: Math.max(existing.bestRoundScore || existing.bestScore, session.score.finalScore),
    fastestRoundTime: fastestTime,
    averageRoundTime: avgRoundTime,
    averageScorePerRound: avgScorePerRound,
    totalAttempts: (existing.totalAttempts || 0) + session.attempts,
    totalCorrectFinds: (existing.totalCorrectFinds || 0) + session.correctFinds,
    longestCombo: Math.max(existing.longestCombo || 0, session.maxCombo),
    perfectRounds: (existing.perfectRounds || 0) + (isPerfectRound ? 1 : 0),
    wordsPerMinute: wordsPerMin,
    bestAccuracy: Math.max(existing.bestAccuracy || existing.averageAccuracy, session.score.accuracy),
  };

  try {
    saveProfile(updatedStats);
  } catch (err) {
    console.error('Failed to save profile stats:', err);
  }
}


