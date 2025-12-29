/**
 * Daily Challenges System
 * Provides daily goals to keep players engaged
 */

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'words' | 'score' | 'combo' | 'streak' | 'levels' | 'perfect';
  target: number;
  reward: number; // Currency reward
  progress: number;
  completed: boolean;
  title: string;
  description: string;
}

const CHALLENGE_TYPES = {
  words: {
    title: 'Word Hunter',
    description: 'Find {target} words today',
  },
  score: {
    title: 'Score Master',
    description: 'Score {target} points today',
  },
  combo: {
    title: 'Combo King',
    description: 'Achieve a {target}x combo',
  },
  streak: {
    title: 'Streak Champion',
    description: 'Complete {target} levels in a row',
  },
  levels: {
    title: 'Level Up',
    description: 'Complete {target} levels today',
  },
  perfect: {
    title: 'Perfect Player',
    description: 'Complete {target} levels with 100% accuracy',
  },
};

/**
 * Generate daily challenges for a date
 */
export function generateDailyChallenges(date: Date = new Date()): DailyChallenge[] {
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();
  
  // Vary challenges based on day of week
  const baseMultiplier = 1 + (dayOfWeek * 0.1); // Slightly harder on weekends
  
  const challenges: DailyChallenge[] = [
    {
      id: `words-${dateStr}`,
      date: dateStr,
      type: 'words',
      target: Math.round(50 * baseMultiplier),
      reward: 100,
      progress: 0,
      completed: false,
      title: CHALLENGE_TYPES.words.title,
      description: CHALLENGE_TYPES.words.description.replace('{target}', String(Math.round(50 * baseMultiplier))),
    },
    {
      id: `score-${dateStr}`,
      date: dateStr,
      type: 'score',
      target: Math.round(5000 * baseMultiplier),
      reward: 150,
      progress: 0,
      completed: false,
      title: CHALLENGE_TYPES.score.title,
      description: CHALLENGE_TYPES.score.description.replace('{target}', String(Math.round(5000 * baseMultiplier))),
    },
    {
      id: `combo-${dateStr}`,
      date: dateStr,
      type: 'combo',
      target: Math.round(10 + dayOfWeek),
      reward: 200,
      progress: 0,
      completed: false,
      title: CHALLENGE_TYPES.combo.title,
      description: CHALLENGE_TYPES.combo.description.replace('{target}', String(Math.round(10 + dayOfWeek))),
    },
  ];
  
  // Add weekend bonus challenge
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    challenges.push({
      id: `streak-${dateStr}`,
      date: dateStr,
      type: 'streak',
      target: 5,
      reward: 250,
      progress: 0,
      completed: false,
      title: CHALLENGE_TYPES.streak.title,
      description: CHALLENGE_TYPES.streak.description.replace('{target}', '5'),
    });
  }
  
  return challenges;
}

/**
 * Get today's challenges
 */
export function getTodaysChallenges(): DailyChallenge[] {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Try to load from storage
  const stored = localStorage.getItem(`daily-challenges-${dateStr}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // If parse fails, generate new
    }
  }
  
  // Generate new challenges
  const challenges = generateDailyChallenges(today);
  saveChallenges(challenges);
  return challenges;
}

/**
 * Save challenges to storage
 */
export function saveChallenges(challenges: DailyChallenge[]): void {
  if (challenges.length === 0) return;
  const dateStr = challenges[0].date;
  localStorage.setItem(`daily-challenges-${dateStr}`, JSON.stringify(challenges));
}

/**
 * Update challenge progress
 */
export function updateChallengeProgress(
  challengeId: string,
  progress: number,
  completed: boolean = false
): DailyChallenge | null {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const stored = localStorage.getItem(`daily-challenges-${dateStr}`);
  
  if (!stored) return null;
  
  try {
    const challenges: DailyChallenge[] = JSON.parse(stored);
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) return null;
    
    challenge.progress = Math.max(challenge.progress, progress);
    challenge.completed = challenge.completed || completed;
    
    saveChallenges(challenges);
    return challenge;
  } catch {
    return null;
  }
}

/**
 * Check if challenge should be completed
 */
export function checkChallengeCompletion(
  type: DailyChallenge['type'],
  value: number
): DailyChallenge[] {
  const challenges = getTodaysChallenges();
  const updated: DailyChallenge[] = [];
  
  challenges.forEach(challenge => {
    if (challenge.type === type && !challenge.completed) {
      const newProgress = Math.max(challenge.progress, value);
      const shouldComplete = newProgress >= challenge.target;
      
      if (shouldComplete) {
        challenge.progress = challenge.target;
        challenge.completed = true;
        updated.push(challenge);
      } else if (newProgress > challenge.progress) {
        challenge.progress = newProgress;
        updated.push(challenge);
      }
    }
  });
  
  if (updated.length > 0) {
    saveChallenges(challenges);
  }
  
  return updated.filter(c => c.completed);
}

/**
 * Get challenge progress percentage
 */
export function getChallengeProgress(challenge: DailyChallenge): number {
  return Math.min(100, (challenge.progress / challenge.target) * 100);
}


