# Word Glitch

A mobile-first word finding game built with Next.js, React, and TypeScript. Find hidden words in a glitchy letter matrix with increasing difficulty levels.

## Features

- **Letter Glitch UI**: Dynamic canvas-based letter matrix with glitch effects
- **Progressive Difficulty**: Levels increase in complexity (more letters, faster glitch, longer words, time limits)
- **Scoring System**: Points based on word length, time bonuses, combo multipliers, and accuracy
- **Profile System**: Track stats, achievements, and progress
- **Leaderboard**: Compete for high scores
- **Mobile Optimized**: Touch-friendly, responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
# or
yarn install
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

## Game Mechanics

- **Find Words**: Click/tap on words hidden in the glitch matrix
- **Levels**: Progress through increasingly difficult levels
- **Scoring**: 
  - Base points = word length × 10
  - Time bonus = remaining time × 2
  - Combo multiplier = 1 + (combo × 0.1)
  - Accuracy bonus = (correct finds / total attempts) × 100
- **Achievements**: Unlock badges for milestones and special accomplishments

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── Game/        # Gameplay components
│   ├── Menu/        # Menu components
│   ├── Profile/     # Profile components
│   ├── Leaderboard/ # Leaderboard components
│   └── Settings/    # Settings components
├── lib/             # Utilities and game logic
│   ├── game/        # Game engine
│   └── storage/     # LocalStorage wrappers
└── types/           # TypeScript types
```

## Technologies

- Next.js 14+
- React 18+
- TypeScript
- CSS Modules

## License

MIT

