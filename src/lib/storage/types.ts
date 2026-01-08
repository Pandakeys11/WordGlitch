import { GameStats, Achievement, LeaderboardEntry } from '@/types/profile';
export type { GameStats, Achievement, LeaderboardEntry };
import { GameSession } from '@/types/game';

export interface StoredProfile {
  stats: GameStats;
  lastPlayed: number;
}

export interface StoredProgress {
  currentLevel: number;
  unlockedLevels: number[];
  bestScores: Record<number, number>; // level -> best score
  achievements?: Array<{ id: string; unlockedAt: number }>; // Added for Firebase
}

export interface StoredAchievements {
  unlocked: Achievement[];
}

export interface StoredLeaderboard {
  entries: LeaderboardEntry[];
  maxEntries: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  difficultyPreference?: 'easy' | 'medium' | 'hard' | 'extreme';
  colorPalette?: string; // ID of selected color palette
}

export interface ProfileMetadata {
  id: string;
  name: string;
  createdAt: number;
  lastPlayed: number;
  walletAddress?: string; // Optional wallet address linked to profile
  profilePicture?: string; // Base64 data URL or image URL for profile picture
}

export interface StoredProfiles {
  profiles: ProfileMetadata[];
}


