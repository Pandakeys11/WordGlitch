'use client';

import React from 'react';
import {
  TrophyIcon,
  TargetIcon,
  ZapIcon,
  StarIcon,
  TrendingUpIcon,
  FlameIcon,
  ClockIcon,
  SearchIcon
} from '@/components/UI/GameIcons';
import styles from './RulesScreen.module.css';

interface RulesScreenProps {
  onBack: () => void;
}

export default function RulesScreen({ onBack }: RulesScreenProps) {
  return (
    <div className={styles.rulesScreen}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <h1 className={styles.title}>Game Rules & Guide</h1>

        <div className={styles.content}>
          {/* Game Objective */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrophyIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Game Objective</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                <strong>Word Glitch</strong> challenges you to find hidden words in a chaotic glitch matrix. 
                Your goal is to achieve the <strong>highest total score</strong> and climb to the top of the leaderboard 
                by mastering speed, accuracy, and strategic word-finding.
              </p>
              <div className={styles.highlightBox}>
                <p className={styles.highlightText}>
                  <strong>Primary Goal:</strong> Maximize your total score across all levels to rank #1 on the leaderboard
                </p>
              </div>
            </div>
          </section>

          {/* How to Play */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <TargetIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>How to Play</h2>
            </div>
            <div className={styles.sectionContent}>
              <ol className={styles.list}>
                <li>
                  <strong>Find Words:</strong> Words briefly appear in the glitch matrix. Click on them before they disappear.
                </li>
                <li>
                  <strong>Time Window:</strong> Each word has a limited visibility window. Click quickly but accurately!
                </li>
                <li>
                  <strong>Build Combos:</strong> Finding words consecutively builds your combo multiplier (starts after 3 words).
                </li>
                <li>
                  <strong>Complete Levels:</strong> Find all words in a level to advance. Higher levels = higher multipliers.
                </li>
                <li>
                  <strong>Track Progress:</strong> Your stats are saved automatically. Check your profile to see your progress.
                </li>
              </ol>
            </div>
          </section>

          {/* Scoring System */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <StarIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Scoring System</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                Your score is calculated from multiple factors. Understanding these will help you maximize your points:
              </p>
              
              <div className={styles.scoringGrid}>
                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <SearchIcon size={24} />
                    <h3>Base Points</h3>
                  </div>
                  <p>Each word found gives base points. Longer words are worth more points.</p>
                </div>

                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <ClockIcon size={24} />
                    <h3>Time Bonus</h3>
                  </div>
                  <p>3 points per second remaining when you complete the level. Finish fast for maximum bonus!</p>
                </div>

                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <FlameIcon size={24} />
                    <h3>Combo Multiplier</h3>
                  </div>
                  <p>Finding words consecutively (after 3 words) builds combos. Higher combos = exponential multipliers (up to 3.2x+).</p>
                </div>

                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <TrendingUpIcon size={24} />
                    <h3>Level Multiplier</h3>
                  </div>
                  <p>Higher levels give bigger multipliers. Level 1 = 1.0x, Level 50 = 2.0x, continues scaling up to 3.0x.</p>
                </div>

                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <ZapIcon size={24} />
                    <h3>Difficulty Multiplier</h3>
                  </div>
                  <p>Harder color palettes give higher multipliers. Easy = 1.0x, Medium = 1.2x, Hard = 1.5x, Extreme = 2.0x.</p>
                </div>

                <div className={styles.scoringCard}>
                  <div className={styles.scoringCardHeader}>
                    <TargetIcon size={24} />
                    <h3>Accuracy Bonus</h3>
                  </div>
                  <p>Your accuracy percentage adds bonus points. 100% accuracy gives an extra 50 point perfect bonus!</p>
                </div>
              </div>

              <div className={styles.formulaBox}>
                <p className={styles.formulaTitle}>Final Score Formula:</p>
                <p className={styles.formula}>
                  (Base + Time + Accuracy + Bonuses) × Combo × Level × Difficulty
                </p>
              </div>
            </div>
          </section>

          {/* Leaderboard Ranking */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrophyIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Leaderboard Ranking</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                The leaderboard ranks players by their <strong>total score</strong> across all levels. 
                Here's how rankings are determined:
              </p>
              <ol className={styles.list}>
                <li>
                  <strong>Primary:</strong> Total Score (sum of all level scores) - Higher is better
                </li>
                <li>
                  <strong>Secondary:</strong> Total Time (cumulative play time) - Faster is better (if scores are equal)
                </li>
                <li>
                  <strong>Tertiary:</strong> Highest Level Reached - Higher level shows progression
                </li>
              </ol>
              <div className={styles.tipBox}>
                <p className={styles.tipText}>
                  <strong>Pro Tip:</strong> Focus on maintaining high accuracy while building combos. 
                  A perfect round with a high combo on a difficult palette can skyrocket your total score!
                </p>
              </div>
            </div>
          </section>

          {/* Profile Stats */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrendingUpIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Profile Statistics</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                Your profile tracks comprehensive statistics. Here's what each stat means:
              </p>
              
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <h4>Total Score</h4>
                  <p>Sum of all scores from every level you've completed. This determines your leaderboard rank.</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Total Words Found</h4>
                  <p>Lifetime count of all words you've successfully found across all rounds.</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Total Rounds Played</h4>
                  <p>Number of levels you've completed. More rounds = more experience!</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Best Round Score</h4>
                  <p>Your highest single-level score. Shows your peak performance potential.</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Highest Round</h4>
                  <p>The highest level you've reached. Higher levels = bigger multipliers.</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Best Accuracy</h4>
                  <p>Your best accuracy percentage in a single round. Aim for 100%!</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Fastest Round</h4>
                  <p>Your quickest level completion time. Speed matters for time bonuses!</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Words Per Minute</h4>
                  <p>Your average word-finding speed. Higher WPM = more efficient gameplay.</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Perfect Rounds</h4>
                  <p>Number of rounds completed with 100% accuracy. Shows consistency!</p>
                </div>
                <div className={styles.statItem}>
                  <h4>Longest Combo</h4>
                  <p>Your highest combo achieved. Higher combos = massive score multipliers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Difficulty Progression */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <ZapIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Difficulty Progression</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                The game gets progressively harder as you advance:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Levels 1-5:</strong> Easy difficulty - Longer word visibility (4-5 seconds), slower glitch effects
                </li>
                <li>
                  <strong>Levels 6-10:</strong> Medium difficulty - Reduced visibility (3.5-4.5 seconds), faster glitch
                </li>
                <li>
                  <strong>Levels 11-20:</strong> Hard difficulty - Short visibility (2.5-3.5 seconds), intense glitch effects
                </li>
                <li>
                  <strong>Levels 21+:</strong> Extreme difficulty - Very short visibility (1-2 seconds), maximum glitch chaos
                </li>
                <li>
                  <strong>Text Size:</strong> After level 14, text gradually gets smaller, making words harder to spot
                </li>
                <li>
                  <strong>Color Palettes:</strong> Different palettes have different difficulty levels affecting text size and multipliers
                </li>
              </ul>
              
              <div className={styles.highlightBox} style={{ marginTop: '1.5rem' }}>
                <h3 className={styles.highlightTitle}>Boss Levels - Mandatory Palette Requirements</h3>
                <p className={styles.highlightText}>
                  Certain levels require you to use specific palette difficulties to progress:
                </p>
                <ul className={styles.list} style={{ marginTop: '1rem' }}>
                  <li>
                    <strong>Levels 5 & 10:</strong> Must use <strong>Average</strong> difficulty palette (1.5x multiplier)
                  </li>
                  <li>
                    <strong>Levels 15, 25, 35, 50:</strong> Must use <strong>Hard</strong> difficulty palette (2.0x multiplier)
                  </li>
                  <li>
                    <strong>After Level 50:</strong> Random levels require <strong>Hard</strong> difficulty palette
                  </li>
                </ul>
                <p className={styles.highlightText} style={{ marginTop: '1rem', marginBottom: 0 }}>
                  <strong>Important:</strong> You cannot complete these boss levels without the required palette. 
                  The palette will be automatically set when you enter the level, and you cannot change it until you complete the level.
                </p>
              </div>
            </div>
          </section>

          {/* Tips for Success */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <StarIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Tips for Success</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <h4>Accuracy First</h4>
                  <p>Wrong clicks hurt your accuracy. Be precise - it's better to miss a word than click incorrectly.</p>
                </div>
                <div className={styles.tipCard}>
                  <h4>Build Combos</h4>
                  <p>Find words consecutively to build combos. After 3 words, your combo multiplier kicks in and grows exponentially.</p>
                </div>
                <div className={styles.tipCard}>
                  <h4>Higher Levels = More Points</h4>
                  <p>Advancing to higher levels gives bigger multipliers. Don't just replay easy levels - push forward!</p>
                </div>
                <div className={styles.tipCard}>
                  <h4>Challenge Yourself</h4>
                  <p>Harder color palettes give bigger multipliers. Master difficult palettes for maximum scores.</p>
                </div>
                <div className={styles.tipCard}>
                  <h4>Speed Matters</h4>
                  <p>Time bonuses add up. Complete levels quickly while maintaining accuracy for optimal scores.</p>
                </div>
                <div className={styles.tipCard}>
                  <h4>Perfect Rounds</h4>
                  <p>100% accuracy gives a 50-point perfect bonus. Aim for perfection on every round!</p>
                </div>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <TrophyIcon size={32} className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Achievements</h2>
            </div>
            <div className={styles.sectionContent}>
              <p className={styles.paragraph}>
                Unlock achievements by reaching milestones:
              </p>
              <ul className={styles.list}>
                <li><strong>First Find:</strong> Find your first word</li>
                <li><strong>Word Hunter:</strong> Find 10 words</li>
                <li><strong>Word Seeker:</strong> Find 50 words</li>
                <li><strong>Word Master:</strong> Find 100 words</li>
                <li><strong>Perfect:</strong> Complete a level with 100% accuracy</li>
                <li><strong>Speed Demon:</strong> Complete a level in under 30 seconds</li>
                <li><strong>Combo Master:</strong> Achieve a 10+ word combo</li>
                <li><strong>Level Milestones:</strong> Reach levels 10, 25, 50, and 100</li>
              </ul>
            </div>
          </section>

          {/* Final Notes */}
          <section className={styles.section}>
            <div className={styles.finalBox}>
              <h3 className={styles.finalTitle}>Ready to Compete?</h3>
              <p className={styles.finalText}>
                Master the glitch matrix, build your profile stats, and climb to the top of the leaderboard. 
                Every round counts toward your total score. Play strategically, maintain accuracy, and push your limits!
              </p>
              <p className={styles.finalText}>
                <strong>Remember:</strong> The leaderboard ranks by total score, so consistency and progression 
                are key. Don't just focus on one perfect round - build your total score across all levels!
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

