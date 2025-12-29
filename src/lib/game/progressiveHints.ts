/**
 * Progressive Hints System
 * Provides hints that adapt to player skill and difficulty
 */

export interface ProgressiveHint {
  id: string;
  message: string;
  category: 'general' | 'visual' | 'strategy' | 'pattern';
  difficulty: 'easy' | 'average' | 'hard';
  shownCount: number;
  lastShown: number;
}

const HINT_COOLDOWN = 30000; // 30 seconds between hints
const MAX_HINTS_PER_SESSION = 5;

const HINTS: Record<string, ProgressiveHint[]> = {
  easy: [
    {
      id: 'easy-1',
      message: 'Hidden words appear in a special color - look for the glowing letters!',
      category: 'visual',
      difficulty: 'easy',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'easy-2',
      message: 'Words stay visible for several seconds - you have time to find them',
      category: 'general',
      difficulty: 'easy',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'easy-3',
      message: 'Click on words when they appear to score points',
      category: 'strategy',
      difficulty: 'easy',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'easy-4',
      message: 'Words are usually placed away from the center of the screen',
      category: 'pattern',
      difficulty: 'easy',
      shownCount: 0,
      lastShown: 0,
    },
  ],
  average: [
    {
      id: 'avg-1',
      message: 'Look for patterns in word lengths and starting letters',
      category: 'pattern',
      difficulty: 'average',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'avg-2',
      message: 'Building combos increases your score multiplier',
      category: 'strategy',
      difficulty: 'average',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'avg-3',
      message: 'Words appear for shorter periods - stay focused!',
      category: 'general',
      difficulty: 'average',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'avg-4',
      message: 'The color of hidden words contrasts with the glitch colors',
      category: 'visual',
      difficulty: 'average',
      shownCount: 0,
      lastShown: 0,
    },
  ],
  hard: [
    {
      id: 'hard-1',
      message: 'Hard palettes use subtle colors - look carefully!',
      category: 'visual',
      difficulty: 'hard',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'hard-2',
      message: 'Maintain your combo for maximum points',
      category: 'strategy',
      difficulty: 'hard',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'hard-3',
      message: 'Words blend more with the background - use the glow effect',
      category: 'visual',
      difficulty: 'hard',
      shownCount: 0,
      lastShown: 0,
    },
    {
      id: 'hard-4',
      message: 'Pattern recognition is key - look for word structure',
      category: 'pattern',
      difficulty: 'hard',
      shownCount: 0,
      lastShown: 0,
    },
  ],
};

/**
 * Get available hints for difficulty
 */
export function getAvailableHints(difficulty: 'easy' | 'average' | 'hard'): ProgressiveHint[] {
  return HINTS[difficulty] || [];
}

/**
 * Get a hint that should be shown
 */
export function getHintToShow(
  difficulty: 'easy' | 'average' | 'hard',
  hintsShownThisSession: number
): ProgressiveHint | null {
  if (hintsShownThisSession >= MAX_HINTS_PER_SESSION) {
    return null;
  }
  
  const availableHints = getAvailableHints(difficulty);
  const now = Date.now();
  
  // Filter hints that are ready to show (cooldown passed)
  const readyHints = availableHints.filter(
    hint => now - hint.lastShown >= HINT_COOLDOWN
  );
  
  if (readyHints.length === 0) {
    return null;
  }
  
  // Prefer hints that haven't been shown much
  const sortedHints = readyHints.sort((a, b) => a.shownCount - b.shownCount);
  return sortedHints[0];
}

/**
 * Mark hint as shown
 */
export function markHintShown(hint: ProgressiveHint): void {
  hint.shownCount++;
  hint.lastShown = Date.now();
}


