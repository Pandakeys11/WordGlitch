import { Level, GameWord } from '@/types/game';
import { WORD_LISTS, getWordVisibilityDuration, CHAR_WIDTH, CHAR_HEIGHT } from '@/lib/constants';
import { getTextSizingForDifficulty } from './difficulty';
import { PaletteDifficulty } from '@/lib/colorPalettes';

export function generateWords(
  level: Level, 
  canvasWidth: number, 
  canvasHeight: number,
  topExclusionRows: number = 0,
  bottomExclusionRows: number = 0,
  charWidth?: number,
  charHeight?: number,
  paletteDifficulty?: PaletteDifficulty
): GameWord[] {
  const words: GameWord[] = [];
  const availableWords = getWordsForDifficulty(level);
  
  // Use dynamic sizing if provided, otherwise use defaults based on palette difficulty and level
  const textSizing = paletteDifficulty 
    ? getTextSizingForDifficulty(paletteDifficulty, level.level)
    : getTextSizingForDifficulty('easy', level.level); // Default to easy if not provided
  const width = charWidth ?? textSizing.charWidth;
  const height = charHeight ?? textSizing.charHeight;
  
  // Ensure minimum dimensions for mobile (prevent division by zero or invalid calculations)
  // After level 14, text gets smaller, so we need minimum safe dimensions
  const safeWidth = Math.max(width, 6); // Minimum 6px per character (smaller for level 14+)
  const safeHeight = Math.max(height, 10); // Minimum 10px per character
  
  const cols = Math.max(15, Math.floor(canvasWidth / safeWidth)); // Minimum 15 columns for mobile
  const rows = Math.max(15, Math.floor(canvasHeight / safeHeight)); // Minimum 15 rows for mobile
  
  // Calculate playable area (excluding UI sections)
  // Adjust exclusion zones if playable area is too small (mobile-specific fix for level 14+)
  let adjustedTopExclusion = topExclusionRows;
  let adjustedBottomExclusion = bottomExclusionRows;
  
  let playableStartRow = Math.max(0, adjustedTopExclusion);
  let playableEndRow = Math.max(playableStartRow + 1, rows - adjustedBottomExclusion);
  let playableRows = Math.max(1, playableEndRow - playableStartRow);
  
  // Mobile-specific validation: ensure we have enough space for words
  // After level 14, text gets smaller, so we need to ensure minimum playable area
  if (playableRows < 5) {
    // If playable area is too small, reduce exclusion zones
    adjustedBottomExclusion = Math.max(0, bottomExclusionRows - 3);
    adjustedTopExclusion = Math.max(0, topExclusionRows - 2);
    playableEndRow = Math.max(playableStartRow + 1, rows - adjustedBottomExclusion);
    playableRows = Math.max(5, playableEndRow - playableStartRow);
  }
  
  // Final safety check: ensure minimum playable area
  // If still too small, use fallback exclusion zones
  if (playableRows < 3 || cols < 10) {
    adjustedTopExclusion = Math.max(0, Math.floor(rows * 0.05));
    adjustedBottomExclusion = Math.max(0, Math.floor(rows * 0.1));
    playableStartRow = Math.max(0, adjustedTopExclusion);
    playableEndRow = Math.max(playableStartRow + 1, rows - adjustedBottomExclusion);
    playableRows = Math.max(3, playableEndRow - playableStartRow);
  }
  
  // Use adjusted exclusion values for the rest of the function
  const finalTopExclusion = adjustedTopExclusion;
  const finalBottomExclusion = adjustedBottomExclusion;

  // Filter words by length requirements
  const validWords = availableWords.filter(
    word => word.length >= level.minWordLength && word.length <= level.maxWordLength
  );

  if (validWords.length === 0) {
    // Fallback to any words if none match
    return generateFallbackWords(level, cols, rows, topExclusionRows, bottomExclusionRows);
  }

  const usedPositions = new Set<string>();
  const usedWords = new Set<string>(); // Track used words to avoid duplicates
  let attempts = 0;
  const maxAttempts = level.wordCount * 50; // More attempts for more words

  while (words.length < level.wordCount && attempts < maxAttempts) {
    attempts++;
    
    // Select a word that hasn't been used yet
    const availableWords = validWords.filter(w => !usedWords.has(w));
    if (availableWords.length === 0) {
      // If all words are used, reset and allow reuse
      usedWords.clear();
    }
    
    const wordPool = availableWords.length > 0 ? availableWords : validWords;
    const word = wordPool[Math.floor(Math.random() * wordPool.length)];
    const position = findValidPosition(
      word, 
      cols, 
      playableRows, 
      usedPositions, 
      level,
      playableStartRow
    );

    if (position) {
      const points = calculateWordPoints(word, level);
      // Use level-based visibility duration
      const durationRange = getWordVisibilityDuration(level.level);
      const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
      words.push({
        word,
        startCol: position.col,
        startRow: position.row,
        found: false,
        points,
        isVisible: false, // Start hidden
        visibleDuration,
      });
      // Mark all character positions as used to prevent overlaps
      for (let i = 0; i < word.length; i++) {
        usedPositions.add(`${position.col + i},${position.row}`);
      }
      usedWords.add(word);
    }
  }

  return words;
}

function getWordsForDifficulty(level: Level): string[] {
  const allWords: string[] = [];
  
  // Include words from current and easier difficulties
  if (level.difficulty === 'easy' || level.level <= 5) {
    allWords.push(...WORD_LISTS.easy);
  }
  if (level.difficulty === 'medium' || level.level <= 10) {
    allWords.push(...WORD_LISTS.medium);
  }
  if (level.difficulty === 'hard' || level.level <= 20) {
    allWords.push(...WORD_LISTS.hard);
  }
  if (level.difficulty === 'extreme') {
    allWords.push(...WORD_LISTS.extreme);
  }

  return allWords;
}

function findValidPosition(
  word: string,
  cols: number,
  rows: number,
  usedPositions: Set<string>,
  level: Level,
  rowOffset: number = 0
): { col: number; row: number } | null {
  // Ensure word fits in the available columns
  if (word.length > cols) {
    return null; // Word is too long for the canvas
  }

  // Avoid center 50% area (vortex zone) - but within playable area
  const centerCol = cols / 2;
  const centerRow = rows / 2 + rowOffset;
  const avoidRadius = Math.min(cols, rows) * 0.25;

  for (let attempt = 0; attempt < 50; attempt++) {
    // Ensure word fits: col + word.length <= cols, so col <= cols - word.length
    const maxCol = Math.max(0, cols - word.length);
    if (maxCol < 0) return null; // Word doesn't fit
    const col = Math.floor(Math.random() * (maxCol + 1));
    const row = Math.floor(Math.random() * rows) + rowOffset; // Add offset for playable area

    // Check if too close to center
    const distFromCenter = Math.sqrt(
      Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2)
    );
    if (distFromCenter < avoidRadius) continue;

    // Check if position is available
    let valid = true;
    for (let i = 0; i < word.length; i++) {
      const key = `${col + i},${row}`;
      if (usedPositions.has(key)) {
        valid = false;
        break;
      }
    }

    if (valid) {
      return { col, row };
    }
  }

  // Fallback: any position in playable area (with bounds check)
  const maxCol = Math.max(0, cols - word.length);
  if (maxCol < 0) return null; // Word doesn't fit
  const col = Math.floor(Math.random() * (maxCol + 1));
  const row = Math.floor(Math.random() * rows) + rowOffset;
  return { col, row };
}

function generateFallbackWords(
  level: Level, 
  cols: number, 
  rows: number,
  topExclusionRows: number = 0,
  bottomExclusionRows: number = 0
): GameWord[] {
  const words: GameWord[] = [];
  const baseWords = ['WORD', 'GLITCH', 'GAME', 'FIND', 'PLAY'];
  const playableStartRow = topExclusionRows;
  const playableEndRow = rows - bottomExclusionRows;
  const playableRows = Math.max(1, playableEndRow - playableStartRow);
  
  // Use level-based visibility duration
  const durationRange = getWordVisibilityDuration(level.level);
  
  for (let i = 0; i < level.wordCount; i++) {
    const word = baseWords[i % baseWords.length];
    
    // Ensure word fits in the available columns
    if (word.length > cols) continue; // Skip words that don't fit
    
    const maxCol = Math.max(0, cols - word.length);
    const col = Math.floor(Math.random() * (maxCol + 1));
    const row = Math.floor(Math.random() * playableRows) + playableStartRow;
    
    const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
    
    words.push({
      word,
      startCol: col,
      startRow: row,
      found: false,
      points: calculateWordPoints(word, level),
      isVisible: false,
      visibleDuration,
    });
  }
  
  return words;
}

function calculateWordPoints(word: string, level: Level): number {
  const basePoints = word.length * 10;
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.2,
    hard: 1.5,
    extreme: 2,
  }[level.difficulty];
  
  return Math.floor(basePoints * difficultyMultiplier);
}

