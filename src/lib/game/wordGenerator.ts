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

  // Generate real words first
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
        isFake: false,
      });
      // Mark all character positions as used to prevent overlaps
      for (let i = 0; i < word.length; i++) {
        usedPositions.add(`${position.col + i},${position.row}`);
      }
      usedWords.add(word);
    }
  }

  // Generate fake/tricky words
  const fakeWordCount = getFakeWordCount(level);
  const fakeWordsGenerated: string[] = [];
  let fakeAttempts = 0;
  const maxFakeAttempts = fakeWordCount * 50;

  // Use real words as base to generate fake words
  const realWordsForFakes = words.filter(w => !w.isFake).map(w => w.word);
  
  while (fakeWordsGenerated.length < fakeWordCount && fakeAttempts < maxFakeAttempts && realWordsForFakes.length > 0) {
    fakeAttempts++;
    
    // Pick a random real word to create a fake version of
    const baseWord = realWordsForFakes[Math.floor(Math.random() * realWordsForFakes.length)];
    const fakeWord = generateFakeWord(baseWord);
    
    // Make sure fake word is different from all real words and other fake words
    if (fakeWordsGenerated.includes(fakeWord) || validWords.includes(fakeWord)) {
      continue;
    }
    
    // Check if fake word meets length requirements
    if (fakeWord.length < level.minWordLength || fakeWord.length > level.maxWordLength) {
      continue;
    }
    
    const position = findValidPosition(
      fakeWord, 
      cols, 
      playableRows, 
      usedPositions, 
      level,
      playableStartRow
    );

    if (position) {
      // Fake words don't give points, but use same visibility duration
      const durationRange = getWordVisibilityDuration(level.level);
      const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
      words.push({
        word: fakeWord,
        startCol: position.col,
        startRow: position.row,
        found: false,
        points: 0, // Fake words don't give points
        isVisible: false, // Start hidden
        visibleDuration,
        isFake: true, // Mark as fake word
      });
      // Mark all character positions as used to prevent overlaps
      for (let i = 0; i < fakeWord.length; i++) {
        usedPositions.add(`${position.col + i},${position.row}`);
      }
      fakeWordsGenerated.push(fakeWord);
    }
  }

  return words;
}

function getWordsForDifficulty(level: Level): string[] {
  // ALL words are available at ALL levels - no restrictions!
  // This includes all hidden words, comedic words, horror, fantasy, sci-fi, etc.
  // The word length requirements (minWordLength/maxWordLength) will filter appropriately
  const allWords: string[] = [
    ...WORD_LISTS.easy,
    ...WORD_LISTS.medium,
    ...WORD_LISTS.hard,
    ...WORD_LISTS.extreme,
  ];
  
  // Remove duplicates for cleaner selection
  const uniqueWords = [...new Set(allWords)];
  
  // Shuffle the array to ensure truly random selection across all categories
  return shuffleArray(uniqueWords);
}

/**
 * Fisher-Yates shuffle algorithm for truly random word selection
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
  // Fun fallback words including hidden gems from all categories!
  const baseWords = [
    // Classics
    'WORD', 'GLITCH', 'GAME', 'FIND', 'PLAY',
    // Comedic
    'YEET', 'BONK', 'VIBE', 'MEME', 'BRUH', 'POGGERS', 'SLAY', 'FLEX',
    // Horror hidden
    'DOOM', 'GHOST', 'SKULL', 'CURSE', 'DEMON', 'REAPER',
    // Fantasy hidden
    'MAGE', 'WIZARD', 'DRAGON', 'KNIGHT', 'RUNE', 'SPELL',
    // Sci-Fi hidden
    'WARP', 'LASER', 'ALIEN', 'NEXUS', 'CYBER', 'DROID',
    // Gaming
    'BOSS', 'LOOT', 'QUEST', 'COMBO', 'EPIC', 'LEVEL',
    // Internet
    'BASED', 'GOAT', 'CHAD', 'SIGMA', 'RIZZ', 'COPE'
  ];
  
  // Shuffle fallback words for variety
  const shuffledWords = shuffleArray(baseWords);
  
  const playableStartRow = topExclusionRows;
  const playableEndRow = rows - bottomExclusionRows;
  const playableRows = Math.max(1, playableEndRow - playableStartRow);
  
  // Use level-based visibility duration
  const durationRange = getWordVisibilityDuration(level.level);
  
  for (let i = 0; i < level.wordCount; i++) {
    const word = shuffledWords[i % shuffledWords.length];
    
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
      isFake: false,
    });
  }
  
  return words;
}

/**
 * Generate fake/tricky words that look similar to real words
 * These are designed to confuse players and trick them into clicking
 */
function generateFakeWord(realWord: string): string {
  const word = realWord.toUpperCase();
  const length = word.length;
  
  // Different strategies for creating fake words
  const strategies = [
    // Strategy 1: Change one letter (most common)
    () => {
      if (length < 2) return null;
      const pos = Math.floor(Math.random() * length);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const newChar = chars[Math.floor(Math.random() * chars.length)];
      return word.substring(0, pos) + newChar + word.substring(pos + 1);
    },
    // Strategy 2: Swap two adjacent letters
    () => {
      if (length < 2) return null;
      const pos = Math.floor(Math.random() * (length - 1));
      const chars = word.split('');
      [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
      return chars.join('');
    },
    // Strategy 3: Add an extra letter
    () => {
      if (length >= 8) return null; // Don't make words too long
      const pos = Math.floor(Math.random() * (length + 1));
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const newChar = chars[Math.floor(Math.random() * chars.length)];
      return word.substring(0, pos) + newChar + word.substring(pos);
    },
    // Strategy 4: Remove one letter (only for longer words)
    () => {
      if (length <= 3) return null; // Don't make words too short
      const pos = Math.floor(Math.random() * length);
      return word.substring(0, pos) + word.substring(pos + 1);
    },
    // Strategy 5: Change last letter to similar looking letter
    () => {
      if (length < 2) return null;
      const lastChar = word[length - 1];
      const similarChars: { [key: string]: string[] } = {
        'I': ['L', '1', 'T'],
        'O': ['0', 'Q', 'D'],
        'E': ['F', 'B'],
        'S': ['5', 'Z'],
        'Z': ['2', 'S'],
        'A': ['4', 'H'],
        'R': ['P', 'B'],
        'N': ['M', 'H'],
        'U': ['V', 'Y'],
        'V': ['U', 'Y'],
      };
      const replacements = similarChars[lastChar] || ['X', 'Y', 'Z'];
      const newChar = replacements[Math.floor(Math.random() * replacements.length)];
      return word.substring(0, length - 1) + newChar;
    },
  ];
  
  // Try each strategy until one works
  for (let i = 0; i < strategies.length * 2; i++) {
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const fakeWord = strategy();
    if (fakeWord && fakeWord !== word && fakeWord.length >= 2) {
      return fakeWord;
    }
  }
  
  // Fallback: just change a random letter
  if (length >= 2) {
    const pos = Math.floor(Math.random() * length);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let newChar = chars[Math.floor(Math.random() * chars.length)];
    while (newChar === word[pos]) {
      newChar = chars[Math.floor(Math.random() * chars.length)];
    }
    return word.substring(0, pos) + newChar + word.substring(pos + 1);
  }
  
  return word + 'X'; // Last resort fallback
}

/**
 * Calculate how many fake words to generate based on level
 * More fake words appear at higher levels
 */
function getFakeWordCount(level: Level): number {
  if (level.level <= 5) return 0; // No fake words in early levels
  if (level.level <= 10) return 1; // 1 fake word in levels 6-10
  if (level.level <= 20) return Math.floor(level.wordCount * 0.2); // 20% fake words
  if (level.level <= 30) return Math.floor(level.wordCount * 0.25); // 25% fake words
  return Math.floor(level.wordCount * 0.3); // 30% fake words at higher levels
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

