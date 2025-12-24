import { GameStats, Achievement, LeaderboardEntry } from '@/types/profile';
import { GameSession } from '@/types/game';

export interface StoredProfile {
  stats: GameStats;
  lastPlayed: number;
}

export interface StoredProgress {
  currentLevel: number;
  unlockedLevels: number[];
  bestScores: Record<number, number>; // level -> best score
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
}

export interface StoredProfiles {
  profiles: ProfileMetadata[];
}

