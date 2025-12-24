import { Level, GameWord, GameScore } from '@/types/game';
import { initializeLevel } from './difficulty';
import { generateWords } from './wordGenerator';
import { calculateScore, calculateFinalScore } from './scoring';
import { CHAR_WIDTH, CHAR_HEIGHT } from '@/lib/constants';

export { initializeLevel, generateWords, calculateScore, calculateFinalScore };

export function checkWordClick(
  clickX: number,
  clickY: number,
  words: GameWord[],
  canvasWidth: number,
  canvasHeight: number
): GameWord | null {
  const paddingX = CHAR_WIDTH * 2;
  const paddingY = CHAR_HEIGHT * 2;

  for (const word of words) {
    if (word.found) continue;

    const textStartX = (word.startCol * CHAR_WIDTH) - paddingX;
    const textEndX = ((word.startCol + word.word.length) * CHAR_WIDTH) + paddingX;
    const textStartY = (word.startRow * CHAR_HEIGHT) - paddingY;
    const textEndY = ((word.startRow + 1) * CHAR_HEIGHT) + paddingY;

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

