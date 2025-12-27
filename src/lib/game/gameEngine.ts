import { Level, GameWord, GameScore } from '@/types/game';
import { initializeLevel, getTextSizingForDifficulty } from './difficulty';
import { generateWords } from './wordGenerator';
import { calculateScore, calculateFinalScore } from './scoring';
import { CHAR_WIDTH, CHAR_HEIGHT } from '@/lib/constants';

export { initializeLevel, generateWords, calculateScore, calculateFinalScore };

export function checkWordClick(
  clickX: number,
  clickY: number,
  words: GameWord[],
  canvasWidth: number,
  canvasHeight: number,
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme',
  charWidth?: number,
  charHeight?: number
): GameWord | null {
  // Use dynamic sizing if provided, otherwise use defaults
  // Note: difficulty here is 'easy' | 'medium' | 'hard' | 'extreme', not PaletteDifficulty
  // This function is mainly for click detection, so we use defaults without level scaling
  const textSizing = difficulty ? getTextSizingForDifficulty('easy') : null; // Use easy as default for click detection
  const width = charWidth ?? textSizing?.charWidth ?? CHAR_WIDTH;
  const height = charHeight ?? textSizing?.charHeight ?? CHAR_HEIGHT;
  
  const paddingX = width * 2;
  const paddingY = height * 2;

  for (const word of words) {
    if (word.found) continue;

    const textStartX = (word.startCol * width) - paddingX;
    const textEndX = ((word.startCol + word.word.length) * width) + paddingX;
    const textStartY = (word.startRow * height) - paddingY;
    const textEndY = ((word.startRow + 1) * height) + paddingY;

    if (
      clickX >= textStartX &&
      clickX <= textEndX &&
      clickY >= textStartY &&
      clickY <= textEndY
    ) {
      return word;
    }
  }

  return null;
}

export function updateDifficulty(level: Level, newLevel: number): Level {
  return initializeLevel(newLevel);
}

