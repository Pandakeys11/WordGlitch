export const APP_VERSION = '1.0.0';

// Game Constants
export const CHAR_WIDTH = 10;
export const CHAR_HEIGHT = 20;
export const FONT_SIZE = 16;

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
 * Updates every 5 levels to match visibility duration progression
 * Lower levels: Longer clickable window
 * Higher levels: Shorter clickable window (matches visibility duration)
 * The clickable window should be slightly shorter than visibility to add challenge
 */
export const getWordClickableDuration = (level: number): number => {
  // Ensure level is valid
  const validLevel = Math.max(1, Math.floor(level));
  
  // Group levels into tiers (every 5 levels, matching visibility duration)
  const tier = Math.floor((validLevel - 1) / 5);
  
  // Progressive difficulty scaling - clickable window is slightly shorter than visibility
  // This creates a challenge where players need to click during the optimal window
  // Tier 0 (levels 1-5): 3.5 seconds (visibility: 4-5 seconds)
  // Tier 1 (levels 6-10): 3 seconds (visibility: 3.5-4.5 seconds)
  // Tier 2 (levels 11-15): 2.5 seconds (visibility: 3-4 seconds)
  // Tier 3 (levels 16-20): 2 seconds (visibility: 2.5-3.5 seconds)
  // Tier 4 (levels 21-25): 1.5 seconds (visibility: 2-3 seconds)
  // Tier 5 (levels 26-30): 1 second (visibility: 1.5-2.5 seconds)
  // Tier 6+ (levels 31+): 0.8 seconds (visibility: 1-2 seconds)
  
  // Calculate duration in milliseconds
  // Start at 3500ms and decrease by 500ms per tier, with minimum of 800ms
  const duration = Math.max(800, 3500 - (tier * 500));
  
  return duration;
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
    icon: '🎯',
  },
  ten_words: {
    id: 'ten_words',
    name: 'Word Hunter',
    description: 'Find 10 words',
    icon: '🔍',
  },
  fifty_words: {
    id: 'fifty_words',
    name: 'Word Seeker',
    description: 'Find 50 words',
    icon: '🎪',
  },
  hundred_words: {
    id: 'hundred_words',
    name: 'Word Master',
    description: 'Find 100 words',
    icon: '👑',
  },
  perfect_accuracy: {
    id: 'perfect_accuracy',
    name: 'Perfect',
    description: 'Complete a level with 100% accuracy',
    icon: '⭐',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a level in under 30 seconds',
    icon: '⚡',
  },
  combo_master: {
    id: 'combo_master',
    name: 'Combo Master',
    description: 'Achieve a 10+ word combo',
    icon: '🔥',
  },
  level_10: {
    id: 'level_10',
    name: 'Level 10',
    description: 'Reach level 10',
    icon: '🏆',
  },
  level_25: {
    id: 'level_25',
    name: 'Level 25',
    description: 'Reach level 25',
    icon: '💎',
  },
  level_50: {
    id: 'level_50',
    name: 'Level 50',
    description: 'Reach level 50',
    icon: '🌟',
  },
  level_100: {
    id: 'level_100',
    name: 'Level 100',
    description: 'Reach level 100',
    icon: '👑',
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

