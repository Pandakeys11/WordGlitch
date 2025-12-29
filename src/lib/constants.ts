export const APP_VERSION = '1.0.0';

/**
 * Mandatory Palette Requirements for Boss Levels
 * Boss levels occur every 10 levels and require hard difficulty palettes
 * Boss levels: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, etc.
 */
export const MANDATORY_AVERAGE_LEVELS: readonly number[] = []; // No longer used - all boss levels are hard

/**
 * Check if a level is a boss level (every 10 levels)
 */
export function isBossLevel(level: number): boolean {
  return level % 10 === 0 && level >= 10;
}

/**
 * Get mandatory palette difficulty for a level
 * Returns 'hard' for boss levels (every 10 levels: 10, 20, 30, 40, etc.)
 * Returns null if no mandatory requirement
 */
export function getMandatoryPaletteDifficulty(level: number): 'average' | 'hard' | null {
  // Boss levels occur every 10 levels and require hard palette
  if (isBossLevel(level)) {
    return 'hard';
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
 * Get all hard boss levels (every 10 levels starting from level 10)
 * Useful for display purposes
 */
export function getHardBossLevels(upToLevel: number = 100): number[] {
  const hardLevels: number[] = [];
  
  // Boss levels occur every 10 levels starting from level 10
  for (let level = 10; level <= upToLevel; level += 10) {
    hardLevels.push(level);
  }
  
  return hardLevels;
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
    'FALL', 'WAVE', 'STONE', 'ROCK', 'WOOD', 'GRASS', 'LEAF', 'ROSE', 'LAKE', 'RIVER',
    
    // Food & Drink (3-4 letters)
    'CAKE', 'PIE', 'BREAD', 'RICE', 'MEAT', 'FISH', 'EGG', 'MILK', 'JUICE', 'SODA',
    'TEA', 'COFFEE', 'BEEF', 'PORK', 'CHICKEN', 'APPLE', 'BANANA', 'GRAPE', 'ORANGE', 'LEMON',
    
    // Animals (3-4 letters)
    'BEAR', 'WOLF', 'DEER', 'FOX', 'RABBIT', 'MOUSE', 'SNAKE', 'LION', 'TIGER', 'EAGLE',
    'OWL', 'CROW', 'DUCK', 'GOOSE', 'SWAN', 'SHARK', 'WHALE', 'DOLPHIN', 'SEAL', 'CRAB',
    
    // Technology & Computing (3-4 letters)
    'AI', 'NFT', 'WEB', 'APP', 'API', 'CODE', 'DATA', 'BYTE', 'CHIP', 'DISK',
    'FILE', 'GAME', 'HACK', 'LINK', 'WIFI', 'USB', 'CPU', 'GPU', 'RAM', 'ROM',
    
    // Finance Basics (3-4 letters)
    'CASH', 'BANK', 'COIN', 'GOLD', 'DEBT', 'LOAN', 'TAX', 'FEE', 'BUY', 'SELL',
    'PAY', 'SAVE', 'COST', 'PRICE', 'PAID', 'BILL', 'CARD', 'MONEY', 'USD', 'EUR',
    
    // Consumer Products & Brands (3-4 letters)
    'IPAD', 'XBOX', 'SONY', 'META', 'APPLE', 'GOOGLE', 'NIKE', 'ADIDAS', 'COCA', 'PEPSI',
    
    // Cartoon & Animation (3-4 letters)
    'BART', 'HOMER', 'LISA', 'MIKE', 'SUL', 'NEMO', 'DORY', 'WOODY', 'BUZZ', 'ELSA',
    'ANNA', 'OLAF', 'JACK', 'BELLE', 'ARIEL', 'MULAN', 'POCAH', 'ALADDIN', 'SIMBA', 'NALA',
    
    // Anime Characters (3-5 letters)
    'GOKU', 'ASH', 'PIKA', 'ZORO', 'LUFFY', 'NARU', 'SASU', 'SAKU', 'ERZA', 'NATSU',
    'L', 'KIRA', 'GON', 'ED', 'AL', 'ROY', 'RIZA', 'HINATA', 'SAKURA', 'LEVI',
    
    // Movie Characters (3-4 letters)
    'LUKE', 'HAN', 'YODA', 'BOND', 'BAT', 'THOR', 'CAP', 'HULK', 'IRON', 'SPIDER',
    'SUPER', 'WONDER', 'FLASH', 'AQUA', 'GREEN', 'ARROW', 'JOKER', 'BANE', 'VENOM', 'DEAD',
    
    // Web3 & Crypto (3-4 letters)
    'ETH', 'BTC', 'COIN', 'NODE', 'HASH', 'MINT', 'BURN', 'SWAP', 'SOL', 'ADA',
    'DOT', 'MATIC', 'AVAX', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV',
    
    // DeFi Basics (3-4 letters)
    'DEFI', 'SWAP', 'POOL', 'FARM', 'DEX', 'CEX', 'APY', 'TVL', 'LP', 'DAO',
    'NFT', 'GOV', 'VE', 'YIELD', 'STAKE', 'LOCK', 'VOTE', 'BUY', 'SELL', 'TRADE',
    
    // Sports (3-4 letters)
    'BALL', 'GOAL', 'TEAM', 'PLAY', 'GAME', 'WIN', 'LOSE', 'SCORE', 'RUN', 'JUMP',
    'KICK', 'THROW', 'CATCH', 'SWIM', 'DIVE', 'RIDE', 'BIKE', 'SKATE', 'SKI', 'SURF',
    
    // Gaming (3-4 letters)
    'PLAY', 'GAME', 'WIN', 'LOSE', 'LEVEL', 'XP', 'HP', 'MP', 'BOSS', 'NPC',
    'QUEST', 'LOOT', 'DROP', 'RARE', 'EPIC', 'LEGEND', 'RANK', 'TIER', 'CLASS', 'SKILL',
  ],
  medium: [
    // Technology & Computing (4-5 letters)
    'CODE', 'DATA', 'BYTE', 'CHIP', 'DISK', 'FILE', 'GAME', 'HACK', 'JAVA', 'LINK',
    'MOUSE', 'PIXEL', 'ROBOT', 'SCAN', 'VIRUS', 'WIFI', 'ZOOM', 'CLOUD', 'EMAIL', 'LOGIN',
    'SERVER', 'CLIENT', 'ROUTER', 'MODEM', 'SCREEN', 'KEYBOARD', 'CAMERA', 'SPEAKER', 'HEADPHONE', 'MONITOR',
    'SOFTWARE', 'HARDWARE', 'BROWSER', 'SEARCH', 'DOWNLOAD', 'UPLOAD', 'STREAM', 'BUFFER', 'CACHE', 'COOKIE',
    
    // Trending News & Tech (4-5 letters)
    'CRYPTO', 'BITCOIN', 'NFT', 'WEB3', 'AI', 'META', 'VIRTUAL', 'DIGITAL', 'SMART', 'CHIP',
    'BLOCKCHAIN', 'ETHEREUM', 'SOLANA', 'POLYGON', 'AVALANCHE', 'CARDANO', 'POLKADOT', 'COSMOS', 'NEAR', 'APTOS',
    
    // Finance & Markets (4-5 letters)
    'STOCK', 'SHARE', 'TRADE', 'PRICE', 'VALUE', 'ASSET', 'EQUITY', 'BONDS', 'FUNDS', 'CASH',
    'CREDIT', 'DEBIT', 'BUDGET', 'PROFIT', 'LOSS', 'GAIN', 'RISK', 'YIELD', 'RATE', 'FEE',
    'INVEST', 'DIVIDEND', 'BROKER', 'MARKET', 'FOREX', 'FUTURES', 'OPTIONS', 'DERIVATIVES', 'PORTFOLIO', 'STRATEGY',
    
    // Consumer Products & Brands (4-5 letters)
    'IPHONE', 'IPAD', 'XBOX', 'SONY', 'META', 'APPLE', 'GOOGLE', 'AMAZON', 'NETFLIX', 'SPOTIFY',
    'STEAM', 'DISCORD', 'TWITTER', 'TIKTOK', 'YOUTUBE', 'REDDIT', 'SNAP', 'ZOOM', 'SKYPE', 'SLACK',
    'TESLA', 'SAMSUNG', 'MICROSOFT', 'NINTENDO', 'PLAYSTATION', 'OCULUS', 'VALVE', 'EPIC', 'UBISOFT', 'EA',
    'TWITCH', 'FACEBOOK', 'INSTAGRAM', 'PINTEREST', 'LINKEDIN', 'WHATSAPP', 'TELEGRAM', 'SIGNAL', 'VIBER', 'LINE',
    
    // Cartoon Characters & Shows (4-5 letters)
    'RICK', 'MORTY', 'SOUTH', 'PARK', 'FAMILY', 'GUY', 'BOB', 'ARCHER', 'PHINEAS', 'FERB',
    'SPONGEBOB', 'SQUAREPANTS', 'PATRICK', 'SQUIDWARD', 'KRABS', 'PLANKTON', 'SANDY', 'GARY', 'LARRY', 'SPONGE',
    'REGULAR', 'SHOW', 'GRAVITY', 'FALLS', 'DIpper', 'MABEL', 'STAN', 'FORD', 'BILL', 'CIPHER',
    'AVATAR', 'AANG', 'KATARA', 'SOKKA', 'TOPH', 'ZUKO', 'IROH', 'AZULA', 'APPa', 'MOMO',
    
    // Anime Characters & Series (4-5 letters)
    'NARUTO', 'LUFFY', 'GOKU', 'ZORO', 'SANJI', 'EREN', 'LEVI', 'TANJIRO', 'NEZUKO', 'DEKU',
    'BAKUGO', 'TOKYO', 'GHOUL', 'DEATH', 'NOTE', 'LIGHT', 'L', 'MISA', 'RYUK', 'REM',
    'DRAGON', 'BALL', 'VEGETA', 'PICCOLO', 'GOHAN', 'TRUNKS', 'BULMA', 'CHICHI', 'KRILIN', 'YAMCHA',
    'ONEPIECE', 'ACE', 'SABO', 'SHANKS', 'WHITEBEARD', 'BLACKBEARD', 'BIGMOM', 'KAIDO', 'DOFLAMINGO', 'MIHAWK',
    
    // Movie Characters & Franchises (4-5 letters)
    'BATMAN', 'SUPERMAN', 'WONDER', 'WOMAN', 'SPIDERMAN', 'IRONMAN', 'CAPTAIN', 'AMERICA', 'THOR', 'HULK',
    'JEDI', 'SITH', 'MARVEL', 'DC', 'COMICS', 'AVENGERS', 'GUARDIANS', 'GALAXY', 'STORM', 'CYCLOPS',
    'XMen', 'WOLVERINE', 'JEAN', 'GREY', 'PROFESSOR', 'XAVIER', 'MAGNETO', 'NIGHTCRAWLER', 'GAMBIT', 'ROGUE',
    'JOKER', 'HARLEY', 'QUINN', 'BANE', 'PENGUIN', 'RIDDLER', 'CATWOMAN', 'POISON', 'IVY', 'TWO',
    
    // Web3 & Crypto (4-5 letters)
    'TOKEN', 'CHAIN', 'BLOCK', 'NODE', 'MINER', 'HASH', 'MINT', 'BURN', 'SWAP', 'BRIDGE',
    'WALLET', 'ADDRESS', 'PRIVATE', 'KEY', 'PUBLIC', 'SIGNATURE', 'TRANSACTION', 'GAS', 'FEE', 'CONFIRMATION',
    'STAKING', 'DELEGATION', 'VALIDATOR', 'CONSENSUS', 'PROOF', 'STAKE', 'WORK', 'HISTORY', 'BLOCKCHAIN', 'LEDGER',
    
    // DeFi & Finance (4-5 letters)
    'LIQUIDITY', 'PROVIDER', 'MAKER', 'TAKER', 'LEND', 'BORROW', 'LEVERAGE', 'APY', 'TVL', 'SLIPPAGE',
    'COMPOUND', 'AAVE', 'CURVE', 'BALANCER', 'SUSHI', 'UNISWAP', 'PANCAKE', 'SWAP', 'ONEINCH', 'PARASWAP',
    'GOVERNANCE', 'PROPOSAL', 'VOTING', 'QUORUM', 'TREASURY', 'PROTOCOL', 'YIELD', 'FARMING', 'LIQUIDITY', 'POOL',
    
    // Nature & Geography (4-5 letters)
    'FOREST', 'RIVER', 'OCEAN', 'MOUNTAIN', 'VALLEY', 'DESERT', 'ISLAND', 'BEACH', 'LAKE', 'STREAM',
    'WATERFALL', 'VOLCANO', 'CAVE', 'GLACIER', 'CANYON', 'PLATEAU', 'PENINSULA', 'COAST', 'SHORE', 'HARBOR',
    'JUNGLE', 'SAVANNA', 'TUNDRA', 'ARCTIC', 'ANTARCTIC', 'EQUATOR', 'POLAR', 'TROPICAL', 'TEMPERATE', 'CLIMATE',
    
    // Music & Entertainment (4-5 letters)
    'MUSIC', 'SONG', 'BEAT', 'RHYTHM', 'MELODY', 'TUNE', 'BAND', 'ROCK', 'JAZZ', 'POP',
    'RAP', 'HIP', 'HOP', 'DANCE', 'PARTY', 'CLUB', 'STAGE', 'MIC', 'AMP', 'GUITAR',
    'PIANO', 'DRUM', 'BASS', 'VIOLIN', 'TRUMPET', 'SAXOPHONE', 'FLUTE', 'HARP', 'ORGAN', 'SYNTH',
    'CONCERT', 'FESTIVAL', 'ALBUM', 'SINGLE', 'EP', 'MIXTAPE', 'PLAYLIST', 'STREAMING', 'SPOTIFY', 'APPLE',
    
    // Food & Cuisine (4-5 letters)
    'PIZZA', 'BURGER', 'PASTA', 'SUSHI', 'TACO', 'BURRITO', 'RAMEN', 'CURRY', 'STEAK', 'SALAD',
    'SOUP', 'STEW', 'CHILI', 'SANDWICH', 'WRAP', 'QUESADILLA', 'LASAGNA', 'RAVIOLI', 'SPAGHETTI', 'FETTUCCINE',
    'CHICKEN', 'TURKEY', 'DUCK', 'LAMB', 'PORK', 'BEEF', 'SEAFOOD', 'SHRIMP', 'LOBSTER', 'CRAB',
    
    // Sports & Activities (4-5 letters)
    'FOOTBALL', 'BASKETBALL', 'BASEBALL', 'SOCCER', 'TENNIS', 'VOLLEYBALL', 'HOCKEY', 'RUGBY', 'CRICKET', 'GOLF',
    'SWIMMING', 'RUNNING', 'CYCLING', 'BOXING', 'WRESTLING', 'JUDO', 'KARATE', 'TAEKWONDO', 'FENCING', 'ARCHERY',
    'SKIING', 'SNOWBOARD', 'SURFING', 'SKATEBOARD', 'ROCK', 'CLIMBING', 'HIKING', 'CAMPING', 'FISHING', 'HUNTING',
    
    // Gaming (4-5 letters)
    'MINECRAFT', 'FORNITE', 'APEX', 'LEGENDS', 'CALL', 'DUTY', 'OVERWATCH', 'VALORANT', 'CSGO', 'DOTA',
    'LEAGUE', 'LEGENDS', 'WORLD', 'WARCRAFT', 'STARCRAFT', 'DIABLO', 'ELDER', 'SCROLLS', 'FALLOUT', 'SKYRIM',
    'QUEST', 'LOOT', 'BOSS', 'NPC', 'PVP', 'PVE', 'RPG', 'MMO', 'FPS', 'RTS',
  ],
  hard: [
    // Technology & Innovation (5-7 letters)
    'ALGORITHM', 'PROGRAM', 'DEVELOP', 'TECH', 'INNOVATE', 'CREATE', 'DESIGN', 'BUILD',
    'ENGINEER', 'FRAMEWORK', 'LIBRARY', 'PLATFORM', 'SYSTEM', 'NETWORK', 'SERVER', 'CLIENT',
    'DATABASE', 'STORAGE', 'MEMORY', 'PROCESSOR', 'GRAPHICS', 'SECURITY', 'ENCRYPT', 'DECODE',
    'COMPILER', 'INTERPRETER', 'SCRIPTING', 'DEBUGGING', 'TESTING', 'DEPLOYMENT', 'DEVOPS', 'CI',
    'CD', 'MONITORING', 'LOGGING', 'METRICS', 'ANALYTICS', 'OPTIMIZATION', 'PERFORMANCE', 'SCALABILITY',
    
    // Trending News & Current Events (5-7 letters)
    'BLOCKCHAIN', 'METAVERSE', 'VIRTUAL', 'AUGMENT', 'DIGITAL', 'ARTIFICIAL', 'INTELLIGENCE', 'MACHINE',
    'LEARNING', 'NEURAL', 'NETWORK', 'ALGORITHM', 'DATA', 'SCIENCE', 'BIGDATA', 'CLOUD',
    'COMPUTING', 'EDGE', 'COMPUTING', 'QUANTUM', 'COMPUTING', 'IOT', 'INTERNET', 'THINGS',
    'AUTOMATION', 'ROBOTICS', 'DRONES', 'AUTONOMOUS', 'VEHICLES', 'ELECTRIC', 'VEHICLES', 'RENEWABLE',
    
    // Finance & Economics (5-7 letters)
    'ECONOMY', 'FINANCE', 'INVEST', 'TRADE', 'MARKET', 'STOCK', 'SHARE', 'BOND',
    'CURRENCY', 'EXCHANGE', 'FOREX', 'TRADING', 'STRATEGY', 'PORTFOLIO', 'DIVIDEND', 'BROKER',
    'CREDIT', 'MORTGAGE', 'INSURANCE', 'PENSION', 'RETIRE', 'SAVINGS', 'BUDGET', 'PROFIT',
    'DERIVATIVES', 'FUTURES', 'OPTIONS', 'COMMODITIES', 'CRYPTOCURRENCY', 'BITCOIN', 'ETHEREUM', 'STABLECOIN',
    
    // Consumer Products & Tech Brands (5-7 letters)
    'IPHONE', 'ANDROID', 'SAMSUNG', 'MICROSOFT', 'WINDOWS', 'MACBOOK', 'AIRPODS', 'PLAYSTATION',
    'NINTENDO', 'SWITCH', 'STEAM', 'DISCORD', 'TWITTER', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE',
    'NETFLIX', 'SPOTIFY', 'AMAZON', 'GOOGLE', 'APPLE', 'META', 'REDDIT', 'LINKEDIN',
    'TESLA', 'SPACEX', 'OPENAI', 'ANTHROPIC', 'NVIDIA', 'AMD', 'INTEL', 'QUALCOMM',
    
    // Cartoon & Animation (5-7 letters)
    'SIMPSONS', 'FUTURAMA', 'SOUTH', 'PARK', 'RICK', 'MORTY', 'ADVENTURE', 'TIME',
    'REGULAR', 'SHOW', 'GRAVITY', 'FALLS', 'PHINEAS', 'FERB', 'SPONGEBOB', 'SQUAREPANTS',
    'FAMILY', 'GUY', 'AMERICAN', 'DAD', 'BOB', 'BURGERS', 'ARCHER', 'BOJACK', 'HORSEMAN',
    'AVATAR', 'LAST', 'AIRBENDER', 'LEGEND', 'KORRA', 'STEVEN', 'UNIVERSE', 'GRAVITY',
    
    // Anime & Manga (5-7 letters)
    'NARUTO', 'ONEPIECE', 'DRAGON', 'BALL', 'ATTACK', 'TITAN', 'DEMON', 'SLAYER',
    'HERO', 'ACADEMIA', 'JUJUTSU', 'KAISEN', 'TOKYO', 'GHOUL', 'DEATH', 'NOTE',
    'FULLMETAL', 'ALCHEMIST', 'COWBOY', 'BEBOP', 'NEON', 'GENESIS', 'EVANGELION', 'GHOST',
    'SHELL', 'STAND', 'ALONE', 'COMPLEX', 'AKIRA', 'SPIRITED', 'AWAY', 'PRINCESS', 'MONONOKE',
    'STUDIO', 'GHIBLI', 'MY', 'NEIGHBOR', 'TOTORO', 'HOWL', 'MOVING', 'CASTLE', 'CASTLE',
    
    // Movies & Franchises (5-7 letters)
    'STARWARS', 'JEDI', 'SITH', 'AVENGERS', 'MARVEL', 'UNIVERSE', 'DC', 'COMICS',
    'BATMAN', 'SUPERMAN', 'WONDER', 'WOMAN', 'SPIDERMAN', 'IRONMAN', 'CAPTAIN', 'AMERICA',
    'THOR', 'HULK', 'BLACK', 'WIDOW', 'HAWKEYE', 'VISION', 'SCARLET', 'WITCH',
    'DOCTOR', 'STRANGE', 'ANT', 'MAN', 'WASP', 'GUARDIANS', 'GALAXY', 'STAR', 'LORD',
    'HARRY', 'POTTER', 'LORD', 'RINGS', 'MATRIX', 'INCEPTION', 'INTERSTELLAR', 'AVATAR',
    
    // Web3 & Blockchain (5-7 letters)
    'BLOCKCHAIN', 'DECENTRAL', 'AUTONOMOUS', 'ORGANIZE', 'SMART', 'CONTRACT', 'NONFUNGIBLE',
    'TOKEN', 'DIGITAL', 'ASSET', 'METAVERSE', 'VIRTUAL', 'REALITY', 'AUGMENTED',
    'ETHEREUM', 'BITCOIN', 'SOLANA', 'POLYGON', 'AVALANCHE', 'CARDANO', 'POLKADOT', 'CHAINLINK',
    'COSMOS', 'NEAR', 'APTOS', 'SUI', 'ARBITRUM', 'OPTIMISM', 'BASE', 'ZKSYNC',
    'ROLLUP', 'L2', 'SCALING', 'SOLUTION', 'BRIDGE', 'CROSS', 'CHAIN', 'INTEROPERABILITY',
    
    // DeFi & Finance (5-7 letters)
    'DECENTRAL', 'FINANCE', 'LIQUIDITY', 'PROVIDER', 'AUTOMATE', 'MARKET', 'MAKER',
    'COMPOUND', 'AAVE', 'CURVE', 'BALANCER', 'SUSHI', 'SWAP', 'UNISWAP', 'PANCAKE',
    'LENDING', 'BORROW', 'LEVERAGE', 'YIELD', 'FARMING', 'STAKING', 'GOVERN', 'TOKEN',
    'LIQUID', 'STAKING', 'DERIVATIVES', 'PERPETUALS', 'OPTIONS', 'FUTURES', 'SYNTHETICS', 'ASSETS',
    
    // Adventure & Exploration (5-7 letters)
    'ADVENTURE', 'EXPLORE', 'DISCOVER', 'JOURNEY', 'EXPEDITION', 'QUEST', 'MISSION',
    'VOYAGE', 'TREK', 'TRAVEL', 'WANDER', 'EXPLORE', 'DISCOVER', 'FIND', 'SEEK',
    'EXPEDITION', 'SAFARI', 'TREKKING', 'BACKPACKING', 'MOUNTAINEERING', 'CLIMBING', 'CAVING', 'SPELUNKING',
    
    // Philosophy & Knowledge (5-7 letters)
    'PHILOSOPHY', 'KNOWLEDGE', 'WISDOM', 'UNDERSTAND', 'COMPREHEND', 'LEARN',
    'EDUCATE', 'STUDY', 'RESEARCH', 'ANALYZE', 'CRITICAL', 'THINK', 'REASON', 'LOGIC',
    'METAPHYSICS', 'EPISTEMOLOGY', 'ETHICS', 'AESTHETICS', 'LOGIC', 'EXISTENTIALISM', 'STOICISM', 'NIHILISM',
    
    // Science & Nature (5-7 letters)
    'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ASTRONOMY', 'GEOLOGY', 'METEOROLOGY', 'OCEANOGRAPHY', 'BOTANY',
    'ZOOLOGY', 'GENETICS', 'EVOLUTION', 'ECOSYSTEM', 'BIODIVERSITY', 'CONSERVATION', 'ENVIRONMENT', 'CLIMATE',
    'ATOM', 'MOLECULE', 'CELL', 'ORGANISM', 'SPECIES', 'HABITAT', 'FOOD', 'CHAIN', 'PHOTOSYNTHESIS', 'RESPIRATION',
    
    // Space & Astronomy (5-7 letters)
    'PLANET', 'STAR', 'GALAXY', 'NEBULA', 'BLACK', 'HOLE', 'QUASAR', 'PULSAR',
    'COMET', 'ASTEROID', 'METEOR', 'METEORITE', 'ORBIT', 'REVOLUTION', 'ROTATION', 'AXIS',
    'TELESCOPE', 'OBSERVATORY', 'ASTRONAUT', 'COSMONAUT', 'SPACECRAFT', 'SPACESHIP', 'ROCKET', 'SATELLITE',
    
    // Literature & Arts (5-7 letters)
    'NOVEL', 'POETRY', 'DRAMA', 'FICTION', 'NONFICTION', 'BIOGRAPHY', 'AUTOBIOGRAPHY', 'ESSAY',
    'METAPHOR', 'SIMILE', 'ALLITERATION', 'RHYME', 'RHYTHM', 'STANZA', 'VERSE', 'PROSE',
    'PAINTING', 'SCULPTURE', 'PHOTOGRAPHY', 'ILLUSTRATION', 'DRAWING', 'SKETCH', 'PORTRAIT', 'LANDSCAPE',
  ],
  extreme: [
    // Technology & Science (6-12+ letters)
    'EXTRAORDINARY', 'PHENOMENAL', 'MAGNIFICENT', 'SPECTACULAR', 'TREMENDOUS',
    'ARCHITECTURE', 'ENGINEERING', 'MATHEMATICS', 'PHYSICS', 'CHEMISTRY',
    'BIOTECHNOLOGY', 'NANOTECHNOLOGY', 'QUANTUM', 'COMPUTING', 'CRYPTOLOGY',
    'CRYPTOGRAPHY', 'CYBERSECURITY', 'NETWORKING', 'VIRTUALIZATION', 'CLOUD',
    'MICROPROCESSOR', 'SUPERCOMPUTER', 'PARALLEL', 'COMPUTING', 'DISTRIBUTED', 'SYSTEMS',
    'ARTIFICIAL', 'INTELLIGENCE', 'MACHINE', 'LEARNING', 'DEEP', 'LEARNING', 'NEURAL', 'NETWORKS',
    'CONVOLUTIONAL', 'RECURRENT', 'TRANSFORMER', 'GENERATIVE', 'ADVERSARIAL', 'NETWORKS',
    
    // Trending News & Advanced Tech (6-12+ letters)
    'CRYPTOCURRENCY', 'BLOCKCHAIN', 'TECHNOLOGY', 'DECENTRALIZED', 'AUTONOMOUS',
    'ORGANIZATION', 'SMART', 'CONTRACTS', 'NONFUNGIBLE', 'TOKENS', 'DIGITAL', 'ASSETS',
    'METAVERSE', 'VIRTUAL', 'REALITY', 'AUGMENTED', 'REALITY', 'MIXED', 'REALITY',
    'EXTENDED', 'REALITY', 'IMMERSIVE', 'TECHNOLOGY', 'HAPTIC', 'FEEDBACK', 'MOTION', 'TRACKING',
    'INTERNET', 'THINGS', 'EDGE', 'COMPUTING', 'FOG', 'COMPUTING', 'EDGE', 'AI',
    
    // Finance & Economics Advanced (6-12+ letters)
    'ECONOMICS', 'FINANCIAL', 'INSTRUMENTS', 'DERIVATIVES', 'FUTURES', 'OPTIONS', 'COMMODITIES',
    'CURRENCY', 'EXCHANGE', 'FOREX', 'TRADING', 'INVESTMENT', 'STRATEGY', 'DIVERSIFICATION',
    'VOLATILITY', 'LIQUIDITY', 'MARKET', 'CAPITALIZATION', 'VALUATION', 'ANALYSIS',
    'QUANTITATIVE', 'ANALYSIS', 'RISK', 'MANAGEMENT', 'PORTFOLIO', 'THEORY', 'EFFICIENT',
    'MARKET', 'HYPOTHESIS', 'BLACK', 'SCHOLES', 'MODEL', 'MONTE', 'CARLO', 'SIMULATION',
    'ALGORITHMIC', 'TRADING', 'HIGH', 'FREQUENCY', 'TRADING', 'ARBITRAGE', 'STRATEGIES',
    
    // Consumer Products & Advanced Tech (6-12+ letters)
    'TECHNOLOGY', 'INNOVATION', 'DIGITAL', 'TRANSFORMATION', 'CONSUMER', 'ELECTRONICS',
    'SMARTPHONE', 'TABLET', 'LAPTOP', 'DESKTOP', 'WORKSTATION', 'SERVER', 'DATACENTER',
    'CLOUD', 'COMPUTING', 'INFRASTRUCTURE', 'SOFTWARE', 'SERVICE', 'PLATFORM', 'ECOSYSTEM',
    'INTERNET', 'BROWSER', 'SEARCH', 'ENGINE', 'SOCIAL', 'MEDIA', 'STREAMING', 'PLATFORM',
    
    // Advanced Cartoon & Animation (6-12+ letters)
    'ANIMATION', 'STUDIO', 'PIXAR', 'DISNEY', 'DREAMWORKS', 'ILLUMINATION', 'ENTERTAINMENT',
    'COMPUTER', 'ANIMATION', 'TRADITIONAL', 'ANIMATION', 'STOP', 'MOTION', 'CLAYMATION',
    'STORYBOARDING', 'CHARACTER', 'DESIGN', 'ENVIRONMENT', 'DESIGN', 'RIGGING', 'ANIMATION',
    'RENDERING', 'COMPOSITING', 'VISUAL', 'EFFECTS', 'POST', 'PRODUCTION', 'EDITING',
    
    // Advanced Anime & Manga (6-12+ letters)
    'JAPANESE', 'ANIMATION', 'STUDIO', 'GHIBLI', 'TOEI', 'ANIMATION', 'PRODUCTION', 'IG',
    'BONES', 'MADHOUSE', 'UFO', 'TABLE', 'WIT', 'STUDIO', 'MAPPA', 'STUDIO', 'TRIGGER',
    'SHONEN', 'SHOJO', 'SEINEN', 'JOSEI', 'GENRE', 'CATEGORIES', 'MANGA', 'ANIME',
    'ORIGINAL', 'ANIMATION', 'VIDEO', 'ANIME', 'ORIGINAL', 'NET', 'ANIMATION',
    
    // Advanced Movies & Franchises (6-12+ letters)
    'CINEMATIC', 'UNIVERSE', 'SUPERHERO', 'FRANCHISE', 'ENTERTAINMENT', 'INDUSTRY',
    'SCREENWRITING', 'DIRECTING', 'CINEMATOGRAPHY', 'FILM', 'EDITING', 'SOUND', 'DESIGN',
    'SPECIAL', 'EFFECTS', 'VISUAL', 'EFFECTS', 'MOTION', 'CAPTURE', 'GREEN', 'SCREEN',
    'POST', 'PRODUCTION', 'PRE', 'PRODUCTION', 'PRODUCTION', 'DESIGN', 'COSTUME', 'DESIGN',
    
    // Advanced Web3 & Blockchain (6-12+ letters)
    'DECENTRALIZED', 'APPLICATIONS', 'DAPPS', 'WEBTHREE', 'DECENTRALIZED', 'WEB',
    'CONSENSUS', 'MECHANISM', 'PROOF', 'STAKE', 'PROOF', 'WORK', 'PROOF', 'HISTORY',
    'LAYER', 'TWO', 'SCALING', 'SOLUTIONS', 'ROLLUPS', 'SIDECHAINS', 'STATE', 'CHANNELS',
    'ZERO', 'KNOWLEDGE', 'PROOFS', 'ZK', 'ROLLUPS', 'OPTIMISTIC', 'ROLLUPS', 'VALIDIUM',
    'CROSS', 'CHAIN', 'BRIDGES', 'ATOMIC', 'SWAPS', 'LIQUIDITY', 'BRIDGES', 'WORMHOLE',
    
    // Advanced DeFi & Finance (6-12+ letters)
    'DECENTRALIZED', 'FINANCE', 'OPEN', 'FINANCE', 'PERMISSIONLESS', 'FINANCE',
    'LIQUIDITY', 'PROTOCOLS', 'AUTOMATED', 'MARKET', 'MAKERS', 'YIELD', 'AGGREGATORS',
    'DERIVATIVE', 'PROTOCOLS', 'PERPETUAL', 'SWAPS', 'OPTIONS', 'PROTOCOLS', 'SYNTHETICS',
    'GOVERNANCE', 'TOKENS', 'VOTING', 'MECHANISMS', 'TREASURY', 'MANAGEMENT', 'PROPOSAL', 'SYSTEMS',
    'LIQUID', 'STAKING', 'DERIVATIVES', 'RESTAKING', 'VALIDATOR', 'ECONOMICS', 'SLASHING', 'MECHANISMS',
    
    // Science & Mathematics (6-12+ letters)
    'ASTROPHYSICS', 'COSMOLOGY', 'QUANTUM', 'MECHANICS', 'RELATIVITY', 'THEORY',
    'PARTICLE', 'PHYSICS', 'STRING', 'THEORY', 'DARK', 'MATTER', 'DARK', 'ENERGY',
    'EVOLUTIONARY', 'BIOLOGY', 'GENETICS', 'MOLECULAR', 'BIOLOGY', 'CELL', 'BIOLOGY',
    'ORGANIC', 'CHEMISTRY', 'INORGANIC', 'CHEMISTRY', 'PHYSICAL', 'CHEMISTRY', 'ANALYTICAL', 'CHEMISTRY',
    'CALCULUS', 'ALGEBRA', 'GEOMETRY', 'TOPOLOGY', 'STATISTICS', 'PROBABILITY', 'THEORY',
    
    // Philosophy & Humanities (6-12+ letters)
    'METAPHYSICS', 'EPISTEMOLOGY', 'ONTOLOGY', 'PHENOMENOLOGY', 'EXISTENTIALISM',
    'STOICISM', 'UTILITARIANISM', 'DEONTOLOGY', 'VIRTUE', 'ETHICS', 'AESTHETICS',
    'LOGIC', 'PHILOSOPHY', 'LANGUAGE', 'MIND', 'PHILOSOPHY', 'RELIGION', 'PHILOSOPHY',
    'POLITICAL', 'PHILOSOPHY', 'SOCIAL', 'PHILOSOPHY', 'ENVIRONMENTAL', 'PHILOSOPHY',
    
    // Space & Astronomy (6-12+ letters)
    'EXOPLANETS', 'ASTEROIDS', 'COMETS', 'METEOROIDS', 'METEORITES', 'NEBULAE',
    'SUPERNOVA', 'NEUTRON', 'STARS', 'WHITE', 'DWARFS', 'RED', 'GIANTS', 'BLUE', 'GIANTS',
    'SPACE', 'EXPLORATION', 'MARS', 'MISSION', 'MOON', 'LANDING', 'INTERNATIONAL', 'SPACE', 'STATION',
    'JAMES', 'WEBB', 'SPACE', 'TELESCOPE', 'HUBBLE', 'SPACE', 'TELESCOPE', 'SPITZER', 'SPACE', 'TELESCOPE',
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

