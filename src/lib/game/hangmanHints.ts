/**
 * Hangman Hints System
 * Provides creative text and visual hints for the Hangman challenge
 */

export interface WordHint {
  word: string;
  category: string;
  categoryIcon: string;
  textHint: string;
  visualHint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Category mappings with icons and hint generators
const CATEGORY_CONFIG: Record<string, { icon: string; hints: string[] }> = {
  // Nature
  nature: {
    icon: '🌿',
    hints: ['Found in nature', 'Think outdoors', 'Part of the natural world', 'Mother Earth knows this one'],
  },
  weather: {
    icon: '🌤️',
    hints: ['Look up at the sky', 'Weather-related', 'The forecast says...', 'Nature\'s mood'],
  },
  animal: {
    icon: '🐾',
    hints: ['A creature', 'Lives and breathes', 'Part of the animal kingdom', 'Has paws, fins, or wings'],
  },
  
  // Food & Drink
  food: {
    icon: '🍔',
    hints: ['Something edible', 'Found in the kitchen', 'Yum yum!', 'On the menu'],
  },
  drink: {
    icon: '🥤',
    hints: ['Something to sip', 'Quench your thirst', 'Liquid refreshment', 'Pour me a glass'],
  },
  
  // Technology
  tech: {
    icon: '💻',
    hints: ['Tech-related', 'Digital domain', 'Silicon valley vibes', 'Bits and bytes'],
  },
  crypto: {
    icon: '₿',
    hints: ['Web3 territory', 'Blockchain buzzword', 'Crypto lingo', 'Decentralized dreams'],
  },
  gaming: {
    icon: '🎮',
    hints: ['Press start!', 'Gaming term', 'Level up!', 'High score material'],
  },
  
  // Entertainment
  movie: {
    icon: '🎬',
    hints: ['Hollywood calling', 'Silver screen star', 'Movie magic', 'Lights, camera...'],
  },
  anime: {
    icon: '⚔️',
    hints: ['Anime universe', 'Japanese animation', 'Manga realm', 'Otaku territory'],
  },
  cartoon: {
    icon: '📺',
    hints: ['Animated fun', 'Cartoon classic', 'Toon town resident', 'Saturday morning vibes'],
  },
  music: {
    icon: '🎵',
    hints: ['Musical term', 'Hit the notes', 'Rhythm and melody', 'Turn up the volume'],
  },
  
  // Action & Expression
  action: {
    icon: '💥',
    hints: ['An action word', 'Something you do', 'Verb alert!', 'Movement incoming'],
  },
  sound: {
    icon: '🔊',
    hints: ['Makes a noise', 'Sound effect', 'What you hear', 'Audio cue'],
  },
  expression: {
    icon: '😎',
    hints: ['Express yourself', 'Slang alert', 'Modern lingo', 'Vibe check'],
  },
  
  // Genre-specific
  horror: {
    icon: '👻',
    hints: ['Spooky vibes', 'Horror genre', 'Things that go bump', 'Nightmare fuel'],
  },
  fantasy: {
    icon: '🧙',
    hints: ['Magical realm', 'Fantasy world', 'Enchanted territory', 'Once upon a time...'],
  },
  scifi: {
    icon: '🚀',
    hints: ['Sci-fi zone', 'Future tech', 'Space age', 'To infinity and beyond'],
  },
  
  // Finance
  finance: {
    icon: '💰',
    hints: ['Money matters', 'Financial term', 'Wall Street vibes', 'Show me the money'],
  },
  
  // Sports
  sports: {
    icon: '⚽',
    hints: ['Sports related', 'Game on!', 'Athletic arena', 'Go team!'],
  },
  
  // Misc
  meme: {
    icon: '🤣',
    hints: ['Internet famous', 'Meme culture', 'Viral vibes', 'Very memeable'],
  },
  general: {
    icon: '✨',
    hints: ['Common word', 'You know this one!', 'Think simple', 'Everyday vocab'],
  },
};

// Word to category mapping (partial - add more as needed)
const WORD_CATEGORIES: Record<string, string> = {
  // Nature
  'SUN': 'nature', 'MOON': 'nature', 'STAR': 'nature', 'TREE': 'nature', 'FLOWER': 'nature',
  'EARTH': 'nature', 'SKY': 'nature',
  'SEA': 'nature', 'OCEAN': 'nature', 'RIVER': 'nature', 'LAKE': 'nature', 'FOREST': 'nature',
  'MOUNTAIN': 'nature', 'ROCK': 'nature', 'STONE': 'nature', 'GRASS': 'nature', 'LEAF': 'nature',
  
  // Weather
  'SNOW': 'weather', 'RAIN': 'weather', 'STORM': 'weather', 'THUNDER': 'weather',
  'LIGHTNING': 'weather', 'FOG': 'weather', 'MIST': 'weather', 'HAIL': 'weather', 'WIND': 'weather',
  
  // Animals
  'CAT': 'animal', 'DOG': 'animal', 'BIRD': 'animal', 'FISH': 'animal', 'BEAR': 'animal',
  'WOLF': 'animal', 'LION': 'animal', 'TIGER': 'animal', 'EAGLE': 'animal', 'SHARK': 'animal',
  'WHALE': 'animal', 'DOLPHIN': 'animal', 'SNAKE': 'animal', 'RABBIT': 'animal', 'FOX': 'animal',
  'DEER': 'animal', 'OWL': 'animal', 'CROW': 'animal', 'DUCK': 'animal', 'SWAN': 'animal',
  'DOGE': 'animal', 'BIRB': 'animal', 'PUPPER': 'animal', 'DOGGO': 'animal', 'CATTO': 'animal',
  
  // Food
  'CAKE': 'food', 'PIE': 'food', 'BREAD': 'food', 'RICE': 'food', 'MEAT': 'food',
  'APPLE': 'food', 'BANANA': 'food', 'PIZZA': 'food', 'BURGER': 'food', 'TACO': 'food',
  'SUSHI': 'food', 'NOODLE': 'food', 'PASTA': 'food', 'SALAD': 'food', 'SOUP': 'food',
  
  // Drinks
  'COFFEE': 'drink', 'TEA': 'drink', 'JUICE': 'drink', 'SODA': 'drink', 'MILK': 'drink',
  'WATER': 'drink', 'BEER': 'drink', 'WINE': 'drink', 'SHAKE': 'drink', 'SMOOTHIE': 'drink',
  
  // Technology
  'CODE': 'tech', 'DATA': 'tech', 'BYTE': 'tech', 'CHIP': 'tech', 'WIFI': 'tech',
  'AI': 'tech', 'API': 'tech', 'APP': 'tech', 'WEB': 'tech', 'CLOUD': 'tech',
  'SERVER': 'tech', 'PIXEL': 'tech', 'DIGITAL': 'tech',
  'BLOCKCHAIN': 'tech', 'ALGORITHM': 'tech', 'DATABASE': 'tech', 'NETWORK': 'tech', 'SYSTEM': 'tech',
  
  // Crypto
  'BITCOIN': 'crypto', 'ETH': 'crypto', 'BTC': 'crypto', 'NFT': 'crypto', 'DEFI': 'crypto',
  'MINT': 'crypto', 'STAKE': 'crypto', 'YIELD': 'crypto', 'TOKEN': 'crypto', 'WALLET': 'crypto',
  'SOL': 'crypto', 'MATIC': 'crypto', 'AVAX': 'crypto', 'DAO': 'crypto', 'SWAP': 'crypto',
  'ETHEREUM': 'crypto', 'SOLANA': 'crypto', 'POLYGON': 'crypto', 'CARDANO': 'crypto', 'POLKADOT': 'crypto',
  
  // Gaming
  'GAME': 'gaming', 'PLAY': 'gaming', 'LEVEL': 'gaming', 'BOSS': 'gaming',
  'LOOT': 'gaming', 'XP': 'gaming', 'HP': 'gaming', 'MP': 'gaming', 'NPC': 'gaming',
  'MARIO': 'gaming', 'ZELDA': 'gaming', 'SONIC': 'gaming', 'TETRIS': 'gaming', 'PACMAN': 'gaming',
  'KIRBY': 'gaming', 'LINK': 'gaming', 'SAMUS': 'gaming', 'YOSHI': 'gaming', 'LUIGI': 'gaming',
  
  // Movies
  'LUKE': 'movie', 'YODA': 'movie', 'VADER': 'movie', 'BOND': 'movie', 'BATMAN': 'movie',
  'THOR': 'movie', 'HULK': 'movie', 'JOKER': 'movie', 'VENOM': 'movie', 'THANOS': 'movie',
  'SPIDERMAN': 'movie', 'IRONMAN': 'movie', 'CAPTAIN': 'movie', 'AVENGER': 'movie', 'MARVEL': 'movie',
  
  // Anime
  'GOKU': 'anime', 'NARUTO': 'anime', 'LUFFY': 'anime', 'ZORO': 'anime', 'LEVI': 'anime',
  'EREN': 'anime', 'DEKU': 'anime', 'BAKUGO': 'anime', 'TANJIRO': 'anime', 'NEZUKO': 'anime',
  'SASUKE': 'anime', 'SAKURA': 'anime', 'HINATA': 'anime', 'KAKASHI': 'anime', 'ITACHI': 'anime',
  
  // Cartoons
  'BART': 'cartoon', 'HOMER': 'cartoon', 'LISA': 'cartoon', 'SPONGEBOB': 'cartoon', 'PATRICK': 'cartoon',
  'MICKEY': 'cartoon', 'DONALD': 'cartoon', 'GOOFY': 'cartoon', 'BUGS': 'cartoon', 'DAFFY': 'cartoon',
  'ELSA': 'cartoon', 'ANNA': 'cartoon', 'OLAF': 'cartoon', 'SIMBA': 'cartoon', 'NEMO': 'cartoon',
  
  // Sounds & Actions
  'BONK': 'sound', 'BOOP': 'sound', 'PLOP': 'sound', 'SPLAT': 'sound',
  'BOOM': 'sound', 'BANG': 'sound', 'CRASH': 'sound', 'ZAP': 'sound', 'POW': 'sound',
  'WHOOSH': 'sound', 'SWOOSH': 'sound', 'ZING': 'sound', 'BUZZ': 'sound', 'FIZZ': 'sound',
  
  // Expressions & Memes
  'YEET': 'meme', 'BRUH': 'meme', 'MEME': 'meme', 'VIBE': 'meme', 'MOOD': 'meme',
  'SLAY': 'expression', 'FLEX': 'expression', 'DRIP': 'expression', 'FIRE': 'expression', 'LIT': 'expression',
  'SUS': 'meme', 'SIMP': 'meme', 'GOAT': 'expression', 'BASED': 'meme', 'COPE': 'meme',
  'LOL': 'expression', 'LMAO': 'expression', 'ROFL': 'expression', 'OOF': 'expression', 'HAHA': 'expression',
  
  // Horror
  'DOOM': 'horror', 'GLOOM': 'horror', 'DREAD': 'horror', 'FEAR': 'horror', 'GHOST': 'horror',
  'SKULL': 'horror', 'BONE': 'horror', 'FANG': 'horror', 'CLAW': 'horror', 'CURSE': 'horror',
  'ZOMBIE': 'horror', 'VAMPIRE': 'horror', 'DEMON': 'horror', 'WITCH': 'horror', 'HAUNT': 'horror',
  
  // Fantasy
  'ORC': 'fantasy', 'ELF': 'fantasy', 'DWARF': 'fantasy', 'GNOME': 'fantasy', 'FAIRY': 'fantasy',
  'MAGE': 'fantasy', 'WIZARD': 'fantasy', 'SPELL': 'fantasy', 'WAND': 'fantasy', 'DRAGON': 'fantasy',
  'KNIGHT': 'fantasy', 'SWORD': 'fantasy', 'SHIELD': 'fantasy', 'CASTLE': 'fantasy', 'QUEST': 'fantasy',
  
  // Sci-Fi
  'WARP': 'scifi', 'BEAM': 'scifi', 'LASER': 'scifi', 'ALIEN': 'scifi', 'UFO': 'scifi',
  'ROBOT': 'scifi', 'CYBER': 'scifi', 'NANO': 'scifi', 'PLASMA': 'scifi', 'VOID': 'scifi',
  'NEXUS': 'scifi', 'MATRIX': 'scifi', 'QUANTUM': 'scifi', 'NEBULA': 'scifi', 'COSMOS': 'scifi',
  
  // Finance
  'CASH': 'finance', 'MONEY': 'finance', 'BANK': 'finance', 'COIN': 'finance', 'GOLD': 'finance',
  'STOCK': 'finance', 'TRADE': 'finance', 'PROFIT': 'finance', 'INVEST': 'finance', 'MARKET': 'finance',
  
  // Sports
  'BALL': 'sports', 'GOAL': 'sports', 'TEAM': 'sports', 'WIN': 'sports', 'SCORE': 'sports',
  'KICK': 'sports', 'THROW': 'sports', 'CATCH': 'sports', 'SWIM': 'sports', 'RUN': 'sports',
};

// Visual hint patterns based on word characteristics
const VISUAL_HINTS: Record<string, string[]> = {
  short: ['⬛⬛⬛', '📦 Small package', '🔹 Compact'],
  medium: ['⬛⬛⬛⬛⬛', '📦📦 Medium box', '🔷 Average size'],
  long: ['⬛⬛⬛⬛⬛⬛⬛', '📦📦📦 Big package', '🔶 Extended'],
  
  vowelHeavy: ['🅰️🅴🅸🅾️🆄 Vowel-rich!', '🔤 Lots of vowels', '⭕ Round letters inside'],
  consonantHeavy: ['🅱️🅲🅳 Consonant party!', '🔤 Consonant heavy', '🔲 Sharp letters'],
  
  doubleLetters: ['🔁 Double up!', '👯 Twin letters', '2️⃣ Repeated letter'],
  allUnique: ['🌈 All unique!', '🎯 No repeats', '✨ Every letter different'],
  
  startsVowel: ['🅰️ Starts with vowel', '⭕→ Vowel opener', '🔵 Soft start'],
  startsConsonant: ['🅱️ Starts with consonant', '🔲→ Hard start', '🔷 Strong opener'],
};

/**
 * Determine the category of a word
 */
function getWordCategory(word: string): string {
  const upperWord = word.toUpperCase();
  return WORD_CATEGORIES[upperWord] || 'general';
}

/**
 * Analyze word characteristics for visual hints
 */
function analyzeWord(word: string): string[] {
  const characteristics: string[] = [];
  const upperWord = word.toUpperCase();
  const vowels = upperWord.match(/[AEIOU]/g) || [];
  const consonants = upperWord.match(/[BCDFGHJKLMNPQRSTVWXYZ]/g) || [];
  
  // Length
  if (word.length <= 3) {
    characteristics.push('short');
  } else if (word.length <= 5) {
    characteristics.push('medium');
  } else {
    characteristics.push('long');
  }
  
  // Vowel/consonant ratio
  if (vowels.length > consonants.length) {
    characteristics.push('vowelHeavy');
  } else if (consonants.length > vowels.length + 2) {
    characteristics.push('consonantHeavy');
  }
  
  // Double letters
  const hasDoubles = /(.)\1/.test(upperWord);
  if (hasDoubles) {
    characteristics.push('doubleLetters');
  } else if (new Set(upperWord.split('')).size === upperWord.length) {
    characteristics.push('allUnique');
  }
  
  // Starting letter
  if (/^[AEIOU]/.test(upperWord)) {
    characteristics.push('startsVowel');
  } else {
    characteristics.push('startsConsonant');
  }
  
  return characteristics;
}

/**
 * Generate a hint for a word
 */
export function generateWordHint(word: string): WordHint {
  const upperWord = word.toUpperCase();
  const category = getWordCategory(upperWord);
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  const characteristics = analyzeWord(upperWord);
  
  // Get random text hint
  const textHint = config.hints[Math.floor(Math.random() * config.hints.length)];
  
  // Build visual hint from characteristics
  const visualHints: string[] = [];
  characteristics.forEach(char => {
    if (VISUAL_HINTS[char]) {
      visualHints.push(VISUAL_HINTS[char][Math.floor(Math.random() * VISUAL_HINTS[char].length)]);
    }
  });
  
  // Determine difficulty based on word length and category
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (word.length > 6 || ['scifi', 'crypto', 'anime'].includes(category)) {
    difficulty = 'hard';
  } else if (word.length > 4 || ['tech', 'finance', 'fantasy'].includes(category)) {
    difficulty = 'medium';
  }
  
  return {
    word: upperWord,
    category,
    categoryIcon: config.icon,
    textHint,
    visualHint: visualHints.slice(0, 2).join(' • '),
    difficulty,
  };
}

/**
 * Generate hints for multiple words
 */
export function generateHintsForWords(words: string[]): WordHint[] {
  return words.map(word => generateWordHint(word));
}

/**
 * Get a progressive hint based on wrong guesses
 */
export function getProgressiveHint(wordHint: WordHint, wrongGuesses: number, maxWrong: number): string {
  const progressRatio = wrongGuesses / maxWrong;
  
  if (progressRatio === 0) {
    return `${wordHint.categoryIcon} ${wordHint.textHint}`;
  } else if (progressRatio < 0.33) {
    return `${wordHint.categoryIcon} ${wordHint.textHint} • ${wordHint.visualHint}`;
  } else if (progressRatio < 0.66) {
    // Reveal first letter
    return `${wordHint.categoryIcon} Starts with "${wordHint.word[0]}" • ${wordHint.textHint}`;
  } else {
    // Reveal length and last letter
    return `${wordHint.categoryIcon} ${wordHint.word.length} letters • Ends with "${wordHint.word[wordHint.word.length - 1]}"`;
  }
}

/**
 * Get letter frequency hint
 */
export function getLetterFrequencyHint(words: string[], guessedLetters: Set<string>): { letter: string; frequency: number }[] {
  const letterCount: Record<string, number> = {};
  const allLetters = words.join('').toUpperCase();
  
  for (const letter of allLetters) {
    if (letter.match(/[A-Z]/) && !guessedLetters.has(letter)) {
      letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
  }
  
  return Object.entries(letterCount)
    .map(([letter, frequency]) => ({ letter, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3);
}

