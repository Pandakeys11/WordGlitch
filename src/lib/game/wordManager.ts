import { GameWord, Level } from '@/types/game';
import { CHAR_WIDTH, CHAR_HEIGHT, getWordVisibilityDuration, getWordClickableDuration } from '@/lib/constants';

/**
 * Manages word visibility, timing, and repositioning
 */
export class WordManager {
  private words: GameWord[];
  private canvasWidth: number;
  private canvasHeight: number;
  private topExclusionRows: number;
  private bottomExclusionRows: number;
  private cols: number;
  private rows: number;
  private playableStartRow: number;
  private playableEndRow: number;
  private level: number;
  private wordCooldowns: Map<string, number>; // Track when words last appeared
  private maxVisibleWords: number; // Max words visible at once (1-2 based on level)

  constructor(
    words: GameWord[],
    canvasWidth: number,
    canvasHeight: number,
    topExclusionRows: number,
    bottomExclusionRows: number,
    level: number
  ) {
    this.words = words;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.topExclusionRows = topExclusionRows;
    this.bottomExclusionRows = bottomExclusionRows;
    this.cols = Math.floor(canvasWidth / CHAR_WIDTH);
    this.rows = Math.floor(canvasHeight / CHAR_HEIGHT);
    this.playableStartRow = Math.max(0, topExclusionRows);
    this.playableEndRow = Math.max(this.playableStartRow + 1, this.rows - bottomExclusionRows);
    this.level = level;
    this.wordCooldowns = new Map();
    
    // Max visible words: 1 for levels 1-10, 2 for levels 11+
    // This creates a nice progression where early levels are simpler
    this.maxVisibleWords = level <= 10 ? 1 : 2;
    
    // Ensure valid playable area
    if (this.playableEndRow <= this.playableStartRow || this.cols <= 0) {
      // Fallback: use most of the screen
      this.playableStartRow = Math.max(0, Math.floor(this.rows * 0.1));
      this.playableEndRow = Math.max(this.playableStartRow + 1, Math.floor(this.rows * 0.9));
    }
  }

  /**
   * Update word visibility states and handle timing
   */
  updateWords(): GameWord[] {
    const now = Date.now();
    
    // Update the words array
    this.words = this.words.map(word => {
      // Skip found words
      if (word.found) return word;

      // If word is visible, check if it should disappear
      if (word.isVisible && word.visibleAt) {
        const visibleTime = now - word.visibleAt;
        
        // Word has been visible long enough, hide it
        if (visibleTime >= word.visibleDuration) {
          return {
            ...word,
            isVisible: false,
            visibleAt: undefined,
            clickableAt: undefined,
            clickableUntil: undefined,
          };
        }

        // Word is visible, ensure clickable window is set (level-based duration)
        if (!word.clickableAt && word.visibleAt) {
          // Word becomes clickable after fully visible (200ms delay to ensure rendering)
          const fullyVisibleDelay = 200;
          const clickableDuration = getWordClickableDuration(this.level);
          word.clickableAt = word.visibleAt + fullyVisibleDelay;
          word.clickableUntil = word.visibleAt + fullyVisibleDelay + clickableDuration;
        }

        // Check if clickable window has expired
        if (word.clickableUntil && now > word.clickableUntil) {
          return {
            ...word,
            isVisible: false,
            visibleAt: undefined,
            clickableAt: undefined,
            clickableUntil: undefined,
          };
        }
      }

      // If word is not visible, check if it can appear
      if (!word.isVisible && !word.visibleAt) {
        // Check cooldown - prevent same word from appearing too soon
        const lastAppeared = this.wordCooldowns.get(word.word);
        if (lastAppeared) {
          const cooldownTime = this.getWordCooldown();
          const timeSinceLastAppearance = now - lastAppeared;
          if (timeSinceLastAppearance < cooldownTime) {
            // Still in cooldown, skip this word
            return word;
          }
        }

        // Check current visible word count - enforce max limit
        const visibleWords = this.words.filter(w => w.isVisible && !w.found).length;
        
        // Don't allow more than maxVisibleWords to be visible
        if (visibleWords >= this.maxVisibleWords) {
          return word; // Skip, already at max
        }

        // Calculate appear chance based on visible word count and level
        let appearChance: number;
        if (visibleWords === 0) {
          // No words visible - VERY high chance to appear (ensures at least one word shows quickly)
          // Base chance scales with level: easier levels = higher chance
          const baseChance = this.level <= 5 ? 0.9 : this.level <= 10 ? 0.8 : 0.7;
          appearChance = Math.min(0.95, baseChance);
        } else if (visibleWords === 1) {
          // One word visible - chance to add second (only if maxVisibleWords >= 2)
          if (this.maxVisibleWords >= 2) {
            // Higher chance at lower levels, lower at higher levels
            appearChance = this.level <= 10 ? 0.3 : this.level <= 20 ? 0.25 : 0.2;
          } else {
            // Max is 1, don't add more
            appearChance = 0;
          }
        } else {
          // Already at max, don't add more
          appearChance = 0;
        }
        
        if (Math.random() < appearChance) {
          // Reposition word randomly in playable area
          const newPosition = this.findRandomPosition(word.word);
          if (newPosition) {
            // Get level-based visibility duration
            const durationRange = getWordVisibilityDuration(this.level);
            const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
            const fullyVisibleDelay = 200; // Small delay to ensure word is fully rendered before clickable
            const clickableDuration = getWordClickableDuration(this.level);
            
            // Update cooldown for this word
            this.wordCooldowns.set(word.word, now);
            
            return {
              ...word,
              startCol: newPosition.col,
              startRow: newPosition.row,
              isVisible: true,
              visibleAt: now,
              visibleDuration,
              clickableAt: now + fullyVisibleDelay, // Word becomes clickable after fully visible (200ms delay)
              clickableUntil: now + fullyVisibleDelay + clickableDuration, // Level-based clickable duration
            };
          }
        }
      }

      return word;
    });
    
    return this.words;
  }

  /**
   * Update canvas dimensions (called when canvas resizes)
   */
  updateDimensions(canvasWidth: number, canvasHeight: number, topExclusionRows: number, bottomExclusionRows: number): void {
    // Ensure valid dimensions
    if (canvasWidth <= 0 || canvasHeight <= 0) return;
    
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.topExclusionRows = topExclusionRows;
    this.bottomExclusionRows = bottomExclusionRows;
    this.cols = Math.floor(canvasWidth / CHAR_WIDTH);
    this.rows = Math.floor(canvasHeight / CHAR_HEIGHT);
    this.playableStartRow = Math.max(0, topExclusionRows);
    this.playableEndRow = Math.max(this.playableStartRow + 1, this.rows - bottomExclusionRows);
    
    // Ensure we have a valid playable area
    if (this.playableEndRow <= this.playableStartRow || this.cols <= 0) {
      // Fallback: use most of the screen
      this.playableStartRow = Math.max(0, Math.floor(this.rows * 0.1));
      this.playableEndRow = Math.max(this.playableStartRow + 1, Math.floor(this.rows * 0.9));
    }
    
    // Validate and fix existing word positions
    this.words = this.words.map(word => {
      if (word.found) return word;
      
      // If word position is out of bounds, reset it
      if (word.startCol + word.word.length > this.cols || 
          word.startRow < this.playableStartRow || 
          word.startRow >= this.playableEndRow) {
        return {
          ...word,
          isVisible: false,
          visibleAt: undefined,
          clickableAt: undefined,
          clickableUntil: undefined,
        };
      }
      
      return word;
    });
  }

  /**
   * Calculate word cooldown based on level
   * Higher levels = shorter cooldown (words appear more frequently)
   * Lower levels = longer cooldown (more time between same word appearances)
   */
  private getWordCooldown(): number {
    // Base cooldown: 8-15 seconds depending on level
    // Levels 1-5: 15 seconds (easier, more time to find)
    // Levels 6-10: 12 seconds
    // Levels 11-15: 10 seconds
    // Levels 16-20: 8 seconds
    // Levels 21+: 6 seconds (harder, words cycle faster)
    if (this.level <= 5) return 15000;
    if (this.level <= 10) return 12000;
    if (this.level <= 15) return 10000;
    if (this.level <= 20) return 8000;
    return 6000;
  }

  /**
   * Find a random valid position for a word
   */
  private findRandomPosition(word: string): { col: number; row: number } | null {
    // Ensure we have valid playable area
    if (this.playableEndRow <= this.playableStartRow) {
      return null; // No playable area
    }
    
    // Ensure word fits in the available columns
    if (word.length > this.cols) {
      return null; // Word is too long for the canvas
    }

    const maxAttempts = 100; // Increased attempts for better positioning
    const centerCol = this.cols / 2;
    const centerRow = (this.playableStartRow + this.playableEndRow) / 2;
    const avoidRadius = Math.min(this.cols, this.playableEndRow - this.playableStartRow) * 0.2; // Reduced to allow more positions

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Ensure word fits: col + word.length <= cols, so col <= cols - word.length
      const maxCol = Math.max(0, this.cols - word.length);
      if (maxCol < 0) return null; // Word doesn't fit
      
      const col = Math.floor(Math.random() * (maxCol + 1));
      const playableRows = this.playableEndRow - this.playableStartRow;
      if (playableRows <= 0) return null; // No playable rows
      const row = Math.floor(Math.random() * playableRows) + this.playableStartRow;

      // Validate bounds
      if (col < 0 || col + word.length > this.cols || row < this.playableStartRow || row >= this.playableEndRow) {
        continue; // Invalid position, try again
      }

      // Check if too close to center (only for first few attempts, then allow center)
      if (attempt < 30) {
        const distFromCenter = Math.sqrt(
          Math.pow(col - centerCol, 2) + Math.pow(row - centerRow, 2)
        );
        if (distFromCenter < avoidRadius) continue;
      }

      // Check if position overlaps with other visible words
      const overlaps = this.words.some(w => {
        if (!w.isVisible || w.found) return false;
        if (w.startRow !== row) return false;
        
        const wStart = w.startCol;
        const wEnd = w.startCol + w.word.length;
        const newStart = col;
        const newEnd = col + word.length;
        
        return !(newEnd <= wStart || newStart >= wEnd);
      });

      if (!overlaps) {
        return { col, row };
      }
    }

    // Fallback: any position in playable area (with bounds check)
    const maxCol = Math.max(0, this.cols - word.length);
    if (maxCol < 0) return null; // Word doesn't fit
    const playableRows = this.playableEndRow - this.playableStartRow;
    if (playableRows <= 0) return null;
    const col = Math.floor(Math.random() * (maxCol + 1));
    const row = Math.floor(Math.random() * playableRows) + this.playableStartRow;
    
    // Final validation
    if (col >= 0 && col + word.length <= this.cols && row >= this.playableStartRow && row < this.playableEndRow) {
      return { col, row };
    }
    
    return null;
  }

  /**
   * Check if a word is currently clickable
   */
  isWordClickable(word: GameWord): boolean {
    if (word.found) return false;
    if (!word.isVisible) return false;
    if (!word.clickableAt || !word.clickableUntil) return false;
    
    const now = Date.now();
    return now >= word.clickableAt && now <= word.clickableUntil;
  }

  /**
   * Get all currently visible words
   */
  getVisibleWords(): GameWord[] {
    return this.words.filter(w => w.isVisible && !w.found);
  }

  /**
   * Mark a word as found
   */
  markWordFound(wordText: string): boolean {
    const word = this.words.find(w => w.word === wordText && !w.found);
    if (word && this.isWordClickable(word)) {
      word.found = true;
      word.foundAt = Date.now();
      word.isVisible = false; // Hide it immediately
      word.visibleAt = undefined;
      word.clickableAt = undefined;
      word.clickableUntil = undefined;
      // Reset cooldown when word is found (allows it to appear again if needed, though it shouldn't)
      this.wordCooldowns.delete(wordText);
      return true;
    }
    return false;
  }

  /**
   * Force at least one word to appear (used when no words are visible)
   */
  forceWordAppearance(): boolean {
    const now = Date.now();
    const nonFoundWords = this.words.filter(w => !w.found && !w.isVisible);
    
    if (nonFoundWords.length === 0) return false;
    
    // Ensure dimensions are valid
    if (this.playableEndRow <= this.playableStartRow || this.cols <= 0) {
      // Try to fix dimensions
      if (this.canvasWidth > 0 && this.canvasHeight > 0) {
        this.cols = Math.floor(this.canvasWidth / CHAR_WIDTH);
        this.rows = Math.floor(this.canvasHeight / CHAR_HEIGHT);
        this.playableStartRow = Math.max(0, this.topExclusionRows);
        this.playableEndRow = Math.max(this.playableStartRow + 1, this.rows - this.bottomExclusionRows);
      }
      
      // If still invalid, use fallback
      if (this.playableEndRow <= this.playableStartRow) {
        this.playableStartRow = Math.max(0, Math.floor(this.rows * 0.1));
        this.playableEndRow = Math.max(this.playableStartRow + 1, Math.floor(this.rows * 0.9));
      }
    }
    
    // Try each word multiple times until one successfully appears
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomWord = nonFoundWords[Math.floor(Math.random() * nonFoundWords.length)];
      const newPosition = this.findRandomPosition(randomWord.word);
      
      if (newPosition) {
        const durationRange = getWordVisibilityDuration(this.level);
        const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
        const fullyVisibleDelay = 200;
        const clickableDuration = getWordClickableDuration(this.level);
        
        const wordIndex = this.words.findIndex(w => w.word === randomWord.word && !w.found);
        if (wordIndex !== -1) {
          this.words[wordIndex] = {
            ...this.words[wordIndex],
            startCol: newPosition.col,
            startRow: newPosition.row,
            isVisible: true,
            visibleAt: now,
            visibleDuration,
            clickableAt: now + fullyVisibleDelay,
            clickableUntil: now + fullyVisibleDelay + clickableDuration,
          };
          return true;
        }
      }
    }
    
    // Last resort: try to place word at a safe position even if it overlaps
    if (nonFoundWords.length > 0) {
      const word = nonFoundWords[0];
      if (word.word.length <= this.cols && this.playableEndRow > this.playableStartRow) {
        const safeCol = Math.max(0, Math.min(this.cols - word.word.length, Math.floor(this.cols * 0.1)));
        const safeRow = Math.max(this.playableStartRow, Math.min(this.playableEndRow - 1, this.playableStartRow + 2));
        
        const wordIndex = this.words.findIndex(w => w.word === word.word && !w.found);
        if (wordIndex !== -1) {
          const durationRange = getWordVisibilityDuration(this.level);
          const visibleDuration = durationRange.min + Math.random() * (durationRange.max - durationRange.min);
          const fullyVisibleDelay = 200;
          const clickableDuration = getWordClickableDuration(this.level);
          
          this.words[wordIndex] = {
            ...this.words[wordIndex],
            startCol: safeCol,
            startRow: safeRow,
            isVisible: true,
            visibleAt: now,
            visibleDuration,
            clickableAt: now + fullyVisibleDelay,
            clickableUntil: now + fullyVisibleDelay + clickableDuration,
          };
          return true;
        }
      }
    }
    
    return false;
  }
}

