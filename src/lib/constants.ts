export const APP_VERSION = '1.0.0';

/**
 * Mandatory Palette Requirements for Boss Levels
 * Certain levels require specific palette difficulties to progress
 */
export const MANDATORY_AVERAGE_LEVELS = [5, 10] as const;
export const MANDATORY_HARD_LEVELS = [15, 25, 35, 50] as const;

/**
 * Get mandatory palette difficulty for a level
 * Returns 'average' for levels 5 and 10
 * Returns 'hard' for levels 15, 25, 35, 50, and random levels after 50
 * Returns null if no mandatory requirement
 */
export function getMandatoryPaletteDifficulty(level: number): 'average' | 'hard' | null {
  // Check fixed average levels
  if (MANDATORY_AVERAGE_LEVELS.includes(level as any)) {
    return 'average';
  }
  
  // Check fixed hard levels
  if (MANDATORY_HARD_LEVELS.includes(level as any)) {
    return 'hard';
  }
  
  // Random hard levels after level 50
  // Use deterministic random based on level number for consistency
  if (level > 50) {
    // Simple seeded random: use level as seed
    // This ensures same level always has same requirement per player
    const seed = level * 7919; // Prime number for better distribution
    const random = ((seed * 9301 + 49297) % 233280) / 233280;
    
    // 30% chance for hard requirement after level 50
    if (random < 0.3) {
      return 'hard';
    }
  }
  
  return null;
}

/**
 * Check if a level requires a mandatory palette
 */
export function hasMandatoryPalette(level: number): boolean {
  return getMandatoryPaletteDifficulty(level) !== null;
}

/**
 * Get all hard boss levels (fixed + random after 50)
 * Useful for display purposes
 */
export function getHardBossLevels(upToLevel: number = 100): number[] {
  const hardLevels: number[] = [...MANDATORY_HARD_LEVELS];
  
  // Add random hard levels after 50
  for (let level = 51; level <= upToLevel; level++) {
    if (getMandatoryPaletteDifficulty(level) === 'hard') {
      hardLevels.push(level);
    }
  }
  
  return hardLevels.sort((a, b) => a - b);
}

// Game Constants
// Base sizes increased slightly for better visibility
// Easy palettes use 100% of these values (baseline)
export const CHAR_WIDTH = 12;  // Increased from 10 (20% larger)
export const CHAR_HEIGHT = 24; // Increased from 20 (20% larger)
export const FONT_SIZE = 19;   // Increased from 16 (18.75% larger)

// Word visibility color - distinct color that contrasts with glitch animation palette
// Chosen to stand out clearly from the cool teal/blue glitch colors while remaining visible
// Coral-orange provides warm contrast to the cool glitch palette (#2b4539, #61dca3, #61b3dc)
export const WORD_VISIBLE_COLOR = '#ff8c42'; // Vibrant coral-orange that contrasts with glitch palette

// Legacy array for backward compatibility (all use same color for uniformity)
export const WORD_VISIBLE_COLORS = [
  WORD_VISIBLE_COLOR,
  WORD_VISIBLE_COLOR,
  WORD_VISIBLE_COLOR,
  WORD_VISIBLE_COLOR,
] as const;

/**
 * Calculate word visibility duration based on level
 * Updates every 5 levels for progressive difficulty
 * Lower levels: Longer visibility (max 5 seconds)
 * Higher levels: Shorter visibility (1-2 seconds max)
 * Gets progressively harder as player advances
 */
export const getWordVisibilityDuration = (level: number): { min: number; max: number } => {
  // Ensure level is valid
  const validLevel = Math.max(1, Math.floor(level));
  
  // Group levels into tiers (every 5 levels for more granular progression)
  const tier = Math.floor((validLevel - 1) / 5);
  
  // Progressive difficulty scaling
  // Tier 0 (levels 1-5): 4-5 seconds (max 5)
  // Tier 1 (levels 6-10): 3.5-4.5 seconds
  // Tier 2 (levels 11-15): 3-4 seconds
  // Tier 3 (levels 16-20): 2.5-3.5 seconds
  // Tier 4 (levels 21-25): 2-3 seconds
  // Tier 5 (levels 26-30): 1.5-2.5 seconds
  // Tier 6 (levels 31-35): 1-2 seconds (max 2)
  // Tier 7+ (levels 36+): 1-2 seconds (stays at max 2)
  
  // Calculate min and max durations in milliseconds
  // Start at 4000-5000ms (4-5 seconds) and decrease by 500ms per tier
  const baseMin = Math.max(1000, 4000 - (tier * 500)); // Minimum: 1 second
  const baseMax = Math.max(2000, 5000 - (tier * 500)); // Maximum: 2 seconds at higher levels
  
  // Cap the maximum at 2 seconds for very high levels (tier 6+)
  const finalMin = tier >= 6 ? 1000 : baseMin;
  const finalMax = tier >= 6 ? 2000 : baseMax;
  
  // Ensure min <= max
  return {
    min: Math.min(finalMin, finalMax),
    max: Math.max(finalMin, finalMax),
  };
};

/**
 * Calculate word clickable window duration based on level
 * Updated to provide more time for early levels and progressive difficulty
 * Levels 1-10: 5 seconds (5000ms) - generous time for beginners
 * Levels 11-30: 4 seconds (4000ms) - moderate challenge
 * Levels 31-75: 3 seconds (3000ms) - challenging
 * Levels 75+: 2 seconds (2000ms) - maximum difficulty
 */
export const getWordClickableDuration = (level: number): number => {
  // Ensure level is valid
  const validLevel = Math.max(1, Math.floor(level));
  
  // Level-based duration tiers
  if (validLevel <= 10) {
    // Levels 1-10: 5 seconds
    return 5000;
  } else if (validLevel <= 30) {
    // Levels 11-30: 4 seconds
    return 4000;
  } else if (validLevel <= 75) {
    // Levels 31-75: 3 seconds
    return 3000;
  } else {
    // Levels 75+: 2 seconds
    return 2000;
  }
};

// Difficulty Settings
export const DIFFICULTY_SETTINGS = {
  easy: {
    glitchSpeed: 100,
    letterUpdateRate: 0.03,
    vortexStrength: 0.3,
  },
  medium: {
    glitchSpeed: 60,
    letterUpdateRate: 0.05,
    vortexStrength: 0.5,
  },
  hard: {
    glitchSpeed: 40,
    letterUpdateRate: 0.08,
    vortexStrength: 0.7,
  },
  extreme: {
    glitchSpeed: 25,
    letterUpdateRate: 0.12,
    vortexStrength: 0.9,
  },
} as const;

// Word Lists by Difficulty - Comprehensive collection from multiple categories
export const WORD_LISTS = {
  easy: [
    // Basic & Common (3-4 letters)
    'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL', 'FISH', 'BIRD',
    'HOME', 'LOVE', 'HAPPY', 'SMILE', 'MUSIC', 'DANCE', 'COLOR', 'LIGHT', 'DARK', 'BRIGHT',
    'WATER', 'FIRE', 'EARTH', 'WIND', 'SNOW', 'RAIN', 'CLOUD', 'SKY', 'SEA', 'LAND',
    
    // Trending News (3-4 letters)
    'AI', 'NFT', 'WEB', 'APP', 'API', 'CEO', 'IPO', 'GDP', 'USD', 'EUR',
    
    // Finance Basics (3-4 letters)
    'CASH', 'BANK', 'COIN', 'GOLD', 'DEBT', 'LOAN', 'TAX', 'FEE', 'BUY', 'SELL',
    
    // Consumer Products (3-4 letters)
    'IPAD', 'XBOX', 'SONY', 'META', 'APPLE', 'GOOGLE',
    
    // Cartoon Characters (3-4 letters)
    'BART', 'HOMER', 'LISA', 'MIKE', 'SUL', 'NEMO', 'DORY', 'WOODY', 'BUZZ', 'ELSA',
    
    // Anime Characters (3-4 letters)
    'GOKU', 'ASH', 'PIKA', 'ZORO', 'LUFFY', 'NARU', 'SASU', 'SAKU',
    
    // Movie Characters (3-4 letters)
    'LUKE', 'HAN', 'YODA', 'BOND', 'BAT', 'THOR', 'CAP', 'HULK', 'IRON',
    
    // Web3 Basics (3-4 letters)
    'ETH', 'BTC', 'COIN', 'NODE', 'HASH', 'MINT', 'BURN', 'SWAP',
    
    // DeFi Basics (3-4 letters)
    'DEFI', 'SWAP', 'POOL', 'FARM', 'DEX', 'CEX', 'APY', 'TVL',
  ],
  medium: [
    // Technology & Computing (4-5 letters)
    'CODE', 'DATA', 'BYTE', 'CHIP', 'DISK', 'FILE', 'GAME', 'HACK', 'JAVA', 'LINK',
    'MOUSE', 'PIXEL', 'ROBOT', 'SCAN', 'VIRUS', 'WIFI', 'ZOOM', 'CLOUD', 'EMAIL', 'LOGIN',
    
    // Trending News & Tech (4-5 letters)
    'CRYPTO', 'BITCOIN', 'NFT', 'WEB3', 'AI', 'META', 'VIRTUAL', 'DIGITAL', 'SMART', 'CHIP',
    
    // Finance & Markets (4-5 letters)
    'STOCK', 'SHARE', 'TRADE', 'PRICE', 'VALUE', 'ASSET', 'EQUITY', 'BONDS', 'FUNDS', 'CASH',
    'CREDIT', 'DEBIT', 'BUDGET', 'PROFIT', 'LOSS', 'GAIN', 'RISK', 'YIELD', 'RATE', 'FEE',
    
    // Consumer Products & Brands (4-5 letters)
    'IPHONE', 'IPAD', 'XBOX', 'SONY', 'META', 'APPLE', 'GOOGLE', 'AMAZON', 'NETFLIX', 'SPOTIFY',
    'STEAM', 'DISCORD', 'TWITTER', 'TIKTOK', 'YOUTUBE', 'REDDIT', 'SNAP', 'ZOOM', 'SKYPE', 'SLACK',
    
    // Cartoon Characters & Shows (4-5 letters)
    'BART', 'HOMER', 'LISA', 'MIKE', 'SUL', 'NEMO', 'DORY', 'WOODY', 'BUZZ', 'ELSA',
    'RICK', 'MORTY', 'SOUTH', 'PARK', 'FAMILY', 'GUY', 'BOB', 'ARCHER', 'PHINEAS', 'FERB',
    
    // Anime Characters & Series (4-5 letters)
    'NARUTO', 'LUFFY', 'GOKU', 'ASH', 'PIKA', 'ZORO', 'SANJI', 'SASU', 'SAKU', 'EREN',
    'LEVI', 'TANJI', 'NEZU', 'DEKU', 'BAKU', 'TOKYO', 'GHOUL', 'DEATH', 'NOTE', 'LIGHT',
    
    // Movie Characters & Franchises (4-5 letters)
    'LUKE', 'HAN', 'YODA', 'BOND', 'BATMAN', 'THOR', 'HULK', 'IRON', 'CAP', 'SPIDER',
    'JEDI', 'SITH', 'MARVEL', 'DC', 'COMICS', 'AVENGERS', 'GUARDIANS', 'GALAXY', 'STORM', 'CYCLOPS',
    
    // Web3 & Crypto (4-5 letters)
    'ETH', 'BTC', 'COIN', 'TOKEN', 'CHAIN', 'BLOCK', 'NODE', 'MINER', 'HASH', 'MINT',
    'BURN', 'SWAP', 'POOL', 'FARM', 'STAKE', 'YIELD', 'VAULT', 'BRIDGE', 'DEX', 'CEX',
    
    // DeFi & Finance (4-5 letters)
    'DEFI', 'SWAP', 'POOL', 'FARM', 'STAKE', 'YIELD', 'VAULT', 'BRIDGE', 'DEX', 'CEX',
    'LEND', 'BORROW', 'LEVERAGE', 'APY', 'TVL', 'LIQUIDITY', 'PROVIDER', 'MAKER', 'TAKER', 'FEE',
    
    // Nature & Geography (4-5 letters)
    'NATURE', 'FOREST', 'RIVER', 'OCEAN', 'MOUNTAIN', 'VALLEY', 'DESERT', 'ISLAND', 'BEACH', 'LAKE',
    'TREE', 'FLOWER', 'ANIMAL', 'BIRD', 'FISH', 'STAR', 'MOON', 'SUN', 'CLOUD', 'RAIN',
    
    // Music & Entertainment (4-5 letters)
    'MUSIC', 'SONG', 'BEAT', 'RHYTHM', 'MELODY', 'TUNE', 'BAND', 'ROCK', 'JAZZ', 'POP',
    'RAP', 'HIP', 'HOP', 'DANCE', 'PARTY', 'CLUB', 'STAGE', 'MIC', 'AMP', 'GUITAR',
  ],
  hard: [
    // Technology & Innovation (5-7 letters)
    'ALGORITHM', 'PROGRAM', 'DEVELOP', 'TECH', 'INNOVATE', 'CREATE', 'DESIGN', 'BUILD',
    'ENGINEER', 'FRAMEWORK', 'LIBRARY', 'PLATFORM', 'SYSTEM', 'NETWORK', 'SERVER', 'CLIENT',
    'DATABASE', 'STORAGE', 'MEMORY', 'PROCESSOR', 'GRAPHICS', 'SECURITY', 'ENCRYPT', 'DECODE',
    
    // Trending News & Current Events (5-7 letters)
    'CRYPTO', 'BITCOIN', 'ETHEREUM', 'BLOCKCHAIN', 'METAVERSE', 'VIRTUAL', 'AUGMENT', 'DIGITAL',
    'ARTIFICIAL', 'INTELLIGENCE', 'MACHINE', 'LEARNING', 'NEURAL', 'NETWORK', 'ALGORITHM', 'DATA',
    'TRENDING', 'NEWS', 'EVENT', 'UPDATE', 'BREAKING', 'STORY', 'REPORT', 'MEDIA',
    
    // Finance & Economics (5-7 letters)
    'ECONOMY', 'FINANCE', 'INVEST', 'TRADE', 'MARKET', 'STOCK', 'SHARE', 'BOND',
    'CURRENCY', 'EXCHANGE', 'FOREX', 'TRADING', 'STRATEGY', 'PORTFOLIO', 'DIVIDEND', 'BROKER',
    'CREDIT', 'MORTGAGE', 'INSURANCE', 'PENSION', 'RETIRE', 'SAVINGS', 'BUDGET', 'PROFIT',
    
    // Consumer Products & Tech Brands (5-7 letters)
    'IPHONE', 'ANDROID', 'SAMSUNG', 'MICROSOFT', 'WINDOWS', 'MACBOOK', 'AIRPODS', 'PLAYSTATION',
    'NINTENDO', 'SWITCH', 'STEAM', 'DISCORD', 'TWITTER', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE',
    'NETFLIX', 'SPOTIFY', 'AMAZON', 'GOOGLE', 'APPLE', 'META', 'REDDIT', 'LINKEDIN',
    
    // Cartoon & Animation (5-7 letters)
    'SIMPSONS', 'FUTURAMA', 'SOUTH', 'PARK', 'RICK', 'MORTY', 'ADVENTURE', 'TIME',
    'REGULAR', 'SHOW', 'GRAVITY', 'FALLS', 'PHINEAS', 'FERB', 'SPONGEBOB', 'SQUARE',
    'FAMILY', 'GUY', 'AMERICAN', 'DAD', 'BOB', 'BURGERS', 'ARCHER', 'BOJACK',
    
    // Anime & Manga (5-7 letters)
    'NARUTO', 'ONEPIECE', 'DRAGON', 'BALL', 'ATTACK', 'TITAN', 'DEMON', 'SLAYER',
    'HERO', 'ACADEMIA', 'JUJUTSU', 'KAISEN', 'TOKYO', 'GHOUL', 'DEATH', 'NOTE',
    'FULLMETAL', 'ALCHEMIST', 'COWBOY', 'BEBOP', 'NEON', 'GENESIS', 'EVANGELION', 'GHOST',
    
    // Movies & Franchises (5-7 letters)
    'STARWARS', 'JEDI', 'SITH', 'AVENGERS', 'MARVEL', 'UNIVERSE', 'DC', 'COMICS',
    'BATMAN', 'SUPERMAN', 'WONDER', 'WOMAN', 'SPIDERMAN', 'IRONMAN', 'CAPTAIN', 'AMERICA',
    'THOR', 'HULK', 'BLACK', 'WIDOW', 'HAWKEYE', 'VISION', 'SCARLET', 'WITCH',
    
    // Web3 & Blockchain (5-7 letters)
    'BLOCKCHAIN', 'CRYPTO', 'DECENTRAL', 'AUTONOMOUS', 'ORGANIZE', 'SMART', 'CONTRACT',
    'NONFUNGIBLE', 'TOKEN', 'DIGITAL', 'ASSET', 'METAVERSE', 'VIRTUAL', 'REALITY',
    'ETHEREUM', 'BITCOIN', 'SOLANA', 'POLYGON', 'AVALANCHE', 'CARDANO', 'POLKADOT', 'CHAINLINK',
    
    // DeFi & Finance (5-7 letters)
    'DEFI', 'DECENTRAL', 'FINANCE', 'LIQUIDITY', 'PROVIDER', 'AUTOMATE', 'MARKET', 'MAKER',
    'COMPOUND', 'AAVE', 'YEAR', 'FINANCE', 'CURVE', 'BALANCER', 'SUSHI', 'SWAP',
    'LENDING', 'BORROW', 'LEVERAGE', 'YIELD', 'FARMING', 'STAKING', 'GOVERN', 'TOKEN',
    
    // Adventure & Exploration (5-7 letters)
    'ADVENTURE', 'EXPLORE', 'DISCOVER', 'JOURNEY', 'EXPEDITION', 'QUEST', 'MISSION',
    'VOYAGE', 'TREK', 'TRAVEL', 'WANDER', 'EXPLORE', 'DISCOVER', 'FIND', 'SEEK',
    
    // Philosophy & Knowledge (5-7 letters)
    'PHILOSOPHY', 'KNOWLEDGE', 'WISDOM', 'UNDERSTAND', 'COMPREHEND', 'LEARN',
    'EDUCATE', 'STUDY', 'RESEARCH', 'ANALYZE', 'CRITICAL', 'THINK', 'REASON', 'LOGIC',
  ],
  extreme: [
    // Technology & Science (6-8 letters)
    'EXTRAORDINARY', 'PHENOMENAL', 'MAGNIFICENT', 'SPECTACULAR', 'TREMENDOUS',
    'ARCHITECTURE', 'ENGINEERING', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY',
    'BIOTECHNOLOGY', 'NANOTECHNOLOGY', 'QUANTUM', 'COMPUTING', 'CRYPTOLOGY',
    'CRYPTOGRAPHY', 'CYBERSECURITY', 'NETWORKING', 'VIRTUALIZATION', 'CLOUD',
    
    // Trending News & Advanced Tech (6-8 letters)
    'CRYPTOCURRENCY', 'BLOCKCHAIN', 'TECHNOLOGY', 'DECENTRALIZED', 'AUTONOMOUS',
    'ORGANIZATION', 'SMART', 'CONTRACTS', 'NONFUNGIBLE', 'TOKENS', 'DIGITAL', 'ASSETS',
    'METAVERSE', 'VIRTUAL', 'REALITY', 'AUGMENTED', 'REALITY', 'ARTIFICIAL', 'INTELLIGENCE',
    'MACHINE', 'LEARNING', 'DEEP', 'LEARNING', 'NEURAL', 'NETWORKS', 'ALGORITHMS', 'DATA',
    
    // Finance & Economics Advanced (6-8 letters)
    'ECONOMICS', 'FINANCIAL', 'INSTRUMENTS', 'DERIVATIVES', 'FUTURES', 'OPTIONS', 'COMMODITIES',
    'CURRENCY', 'EXCHANGE', 'FOREX', 'TRADING', 'INVESTMENT', 'STRATEGY', 'DIVERSIFICATION',
    'VOLATILITY', 'LIQUIDITY', 'MARKET', 'CAPITALIZATION', 'VALUATION', 'ANALYSIS',
    'QUANTITATIVE', 'ANALYSIS', 'RISK', 'MANAGEMENT', 'PORTFOLIO', 'THEORY', 'EFFICIENT',
    
    // Consumer Products & Advanced Tech (6-8 letters)
    'PLAYSTATION', 'XBOX', 'NINTENDO', 'SWITCH', 'STEAM', 'EPIC', 'GAMES', 'STORE',
    'APPLE', 'GOOGLE', 'MICROSOFT', 'AMAZON', 'META', 'NETFLIX', 'SPOTIFY', 'DISCORD',
    'TWITTER', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'REDDIT', 'LINKEDIN', 'SNAPCHAT', 'PINTEREST',
    'TECHNOLOGY', 'INNOVATION', 'DIGITAL', 'TRANSFORMATION', 'CONSUMER', 'ELECTRONICS',
    
    // Advanced Cartoon & Animation (6-8 letters)
    'SIMPSONS', 'FUTURAMA', 'SOUTH', 'PARK', 'RICK', 'MORTY', 'ADVENTURE', 'TIME',
    'REGULAR', 'SHOW', 'GRAVITY', 'FALLS', 'PHINEAS', 'FERB', 'SPONGEBOB', 'SQUAREPANTS',
    'FAMILY', 'GUY', 'AMERICAN', 'DAD', 'BOB', 'BURGERS', 'ARCHER', 'BOJACK', 'HORSEMAN',
    'ANIMATION', 'STUDIO', 'PIXAR', 'DISNEY', 'DREAMWORKS', 'ILLUMINATION', 'ENTERTAINMENT',
    
    // Advanced Anime & Manga (6-8 letters)
    'NARUTO', 'ONEPIECE', 'DRAGON', 'BALL', 'ATTACK', 'TITAN', 'DEMON', 'SLAYER',
    'HERO', 'ACADEMIA', 'JUJUTSU', 'KAISEN', 'TOKYO', 'GHOUL', 'DEATH', 'NOTE',
    'FULLMETAL', 'ALCHEMIST', 'COWBOY', 'BEBOP', 'NEON', 'GENESIS', 'EVANGELION', 'GHOST',
    'SHELL', 'STAND', 'ALONE', 'COMPLEX', 'AKIRA', 'SPIRITED', 'AWAY', 'PRINCESS', 'MONONOKE',
    'ANIME', 'MANGA', 'JAPANESE', 'ANIMATION', 'STUDIO', 'GHIBLI', 'TOEI', 'ANIMATION',
    
    // Advanced Movies & Franchises (6-8 letters)
    'STARWARS', 'JEDI', 'SITH', 'AVENGERS', 'MARVEL', 'UNIVERSE', 'DC', 'COMICS',
    'BATMAN', 'SUPERMAN', 'WONDER', 'WOMAN', 'SPIDERMAN', 'IRONMAN', 'CAPTAIN', 'AMERICA',
    'THOR', 'HULK', 'BLACK', 'WIDOW', 'HAWKEYE', 'VISION', 'SCARLET', 'WITCH', 'DOCTOR',
    'STRANGE', 'GUARDIANS', 'GALAXY', 'XMEN', 'WOLVERINE', 'STORM', 'CYCLOPS', 'JEAN', 'GREY',
    'CINEMATIC', 'UNIVERSE', 'SUPERHERO', 'FRANCHISE', 'ENTERTAINMENT', 'INDUSTRY',
    
    // Advanced Web3 & Blockchain (6-8 letters)
    'BLOCKCHAIN', 'CRYPTOCURRENCY', 'DECENTRALIZED', 'AUTONOMOUS', 'ORGANIZATION', 'SMART',
    'CONTRACTS', 'NONFUNGIBLE', 'TOKENS', 'DIGITAL', 'ASSETS', 'METAVERSE', 'VIRTUAL',
    'REALITY', 'AUGMENTED', 'REALITY', 'ARTIFICIAL', 'INTELLIGENCE', 'MACHINE', 'LEARNING',
    'ETHEREUM', 'BITCOIN', 'SOLANA', 'POLYGON', 'AVALANCHE', 'CARDANO', 'POLKADOT', 'CHAINLINK',
    
    // Advanced DeFi & Finance (6-8 letters)
    'DEFI', 'DECENTRALIZED', 'FINANCE', 'LIQUIDITY', 'PROVIDER', 'AUTOMATED', 'MARKET', 'MAKER',
    'COMPOUND', 'AAVE', 'YEAR', 'FINANCE', 'CURVE', 'BALANCER', 'SUSHI', 'SWAP',
    'LENDING', 'BORROWING', 'LEVERAGE', 'YIELD', 'FARMING', 'STAKING', 'GOVERNANCE', 'TOKEN',
    'DECENTRALIZED', 'EXCHANGE', 'AUTOMATED', 'MARKET', 'MAKER', 'LIQUIDITY', 'POOL',
  ],
} as const;

// Achievement Definitions
export const ACHIEVEMENTS = {
  first_word: {
    id: 'first_word',
    name: 'First Find',
    description: 'Find your first word',
    icon: 'target',
  },
  ten_words: {
    id: 'ten_words',
    name: 'Word Hunter',
    description: 'Find 10 words',
    icon: 'search',
  },
  fifty_words: {
    id: 'fifty_words',
    name: 'Word Seeker',
    description: 'Find 50 words',
    icon: 'search',
  },
  hundred_words: {
    id: 'hundred_words',
    name: 'Word Master',
    description: 'Find 100 words',
    icon: 'trophy',
  },
  perfect_accuracy: {
    id: 'perfect_accuracy',
    name: 'Perfect',
    description: 'Complete a level with 100% accuracy',
    icon: 'star',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a level in under 30 seconds',
    icon: 'zap',
  },
  combo_master: {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 10+ word combo',
    icon: 'flame',
  },
  level_10: {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: 'trophy',
  },
  level_25: {
    id: 'level_25',
    name: 'Level 25',
    description: 'Reach level 25',
    icon: 'medal',
  },
  level_50: {
    id: 'level_50',
    name: 'Level 50',
    description: 'Reach level 50',
    icon: 'medal',
  },
  level_100: {
    id: 'level_100',
    name: 'Level 100',
    description: 'Reach level 100',
    icon: 'trophy',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  PROFILE: 'word-glitch-profile',
  PROFILES: 'word-glitch-profiles',
  CURRENT_PROFILE: 'word-glitch-current-profile',
  PROGRESS: 'word-glitch-progress',
  ACHIEVEMENTS: 'word-glitch-achievements',
  LEADERBOARD: 'word-glitch-leaderboard',
  SETTINGS: 'word-glitch-settings',
} as const;

