export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface Level {
  level: number;
  difficulty: Difficulty;
  wordCount: number;
  minWordLength: number;
  maxWordLength: number;
  glitchSpeed: number;        // ms between updates
  letterUpdateRate: number;   // % of letters updated per cycle
  timeLimit?: number;         // seconds (optional)
  vortexStrength: number;     // 0-1
}

export interface GameWord {
  word: string;
  startCol: number;
  startRow: number;
  found: boolean;
  foundAt?: number;           // timestamp
  points: number;
  isVisible: boolean;         // whether word is currently showing
  visibleAt?: number;         // timestamp when word became visible
  visibleDuration: number;    // how long word will be visible (ms)
  clickableAt?: number;       // timestamp when word becomes clickable (after fully appearing)
  clickableUntil?: number;    // timestamp when word stops being clickable
}

export interface GameScore {
  wordsFound: number;
  totalPoints: number;
  timeBonus: number;
  comboMultiplier: number;
  accuracy: number;
  finalScore: number;
  levelTime?: number; // Time taken to complete the level in seconds
  
  // Enhanced scoring breakdown
  levelMultiplier?: number; // Multiplier based on level number
  difficultyMultiplier?: number; // Multiplier based on palette difficulty
  speedBonus?: number; // Bonus for completing level quickly
  accuracyBonus?: number; // Bonus points for accuracy
  perfectAccuracyBonus?: number; // Extra bonus for 100% accuracy
  comboBonus?: number; // Bonus points from combos
  wordLengthBonus?: number; // Bonus for finding longer words
  performanceRating?: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'; // Performance grade
  scoreBreakdown?: {
    baseScore: number;
    timeBonus: number;
    accuracyBonus: number;
    comboBonus: number;
    speedBonus: number;
    wordLengthBonus: number;
    beforeMultipliers: number;
    levelMultiplier: number;
    difficultyMultiplier: number;
    finalScore: number;
  };
}

export interface GameSession {
  level: number;
  startTime: number;
  endTime?: number;
  words: GameWord[];
  score: GameScore;
  combo: number;
  maxCombo: number;
  attempts: number;
  correctFinds: number;
}

