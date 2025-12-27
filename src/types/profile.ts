export interface GameStats {
  totalWordsFound: number;
  levelsCompleted: number;
  bestScore: number;
  totalScore: number;          // Cumulative score across all levels
  averageAccuracy: number;
  totalPlayTime: number;      // seconds
  currentLevel: number;
  unlockedLevels: number[];
  
  // Extended statistics
  totalRoundsPlayed: number;  // Same as levelsCompleted, but clearer naming
  highestRound: number;        // Same as currentLevel, but clearer naming
  bestRoundScore: number;      // Same as bestScore, but clearer naming
  fastestRoundTime: number;    // Best (fastest) round time in seconds
  averageRoundTime: number;    // Average time per round in seconds
  averageScorePerRound: number; // Average score per round
  totalAttempts: number;       // Total clicks/attempts across all rounds
  totalCorrectFinds: number;   // Total correct word finds
  longestCombo: number;        // Longest combo achieved
  perfectRounds: number;       // Number of rounds with 100% accuracy
  wordsPerMinute: number;      // Average words found per minute
  bestAccuracy: number;        // Best accuracy achieved in a single round
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt?: number;        // timestamp
  icon?: string;
}

export type AchievementId = 
  | 'first_word'
  | 'ten_words'
  | 'fifty_words'
  | 'hundred_words'
  | 'perfect_accuracy'
  | 'speed_demon'
  | 'combo_master'
  | 'level_10'
  | 'level_25'
  | 'level_50'
  | 'level_100';

export interface LeaderboardEntry {
  id: string;
  score: number;
  level: number;
  wordsFound: number;
  timestamp: number;
  accuracy: number;
  levelTime?: number; // Time taken to complete the level in seconds (for ranking)
  profileName?: string; // Optional for backward compatibility
  profileId?: string; // Optional for backward compatibility
  walletAddress?: string; // Wallet address if linked
  totalScore?: number; // Total score across all levels from profile stats
  totalTime?: number; // Total play time in seconds from profile stats
}

