'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/types/profile';
import { getLeaderboard, getLeaderboardByLevel } from '@/lib/storage/gameStorage';
import styles from './LeaderboardScreen.module.css';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | number>('all');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadEntries();
  }, [filter, limit]);

  const loadEntries = () => {
    if (filter === 'all') {
      setEntries(getLeaderboard(limit));
    } else {
      setEntries(getLeaderboardByLevel(filter, limit));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.leaderboardScreen}>
      <div className={styles.container}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <h1 className={styles.title}>Leaderboard</h1>
        <p className={styles.subtitle}>Top Scores by Profile</p>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Time
          </button>
          {[1, 5, 10, 20].map((level) => (
            <button
              key={level}
              className={`${styles.filterButton} ${filter === level ? styles.active : ''}`}
              onClick={() => setFilter(level)}
            >
              Level {level}
            </button>
          ))}
        </div>

        {entries.length === 0 ? (
          <div className={styles.empty}>
            <p>No scores yet. Be the first to set a record!</p>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.header}>
              <div className={styles.rank}>Rank</div>
              <div className={styles.profile}>Profile</div>
              <div className={styles.totalScore}>Total Score</div>
              <div className={styles.totalTime}>Total Time</div>
              <div className={styles.level}>Level</div>
            </div>
            {entries.map((entry, index) => {
              const displayName = entry.walletAddress 
                ? `${entry.walletAddress.substring(0, 6)}...${entry.walletAddress.substring(entry.walletAddress.length - 4)}`
                : entry.profileName || 'Unknown';
              
              const formatTime = (seconds: number): string => {
                const hours = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                if (hours > 0) {
                  return `${hours}h ${mins}m ${secs}s`;
                } else if (mins > 0) {
                  return `${mins}m ${secs}s`;
                } else {
                  return `${secs}s`;
                }
              };
              
              return (
                <div key={entry.profileId || entry.id || `entry-${index}`} className={styles.row}>
                  <div className={styles.rank}>
                    {index === 0 && <span className={styles.medal}>🥇</span>}
                    {index === 1 && <span className={styles.medal}>🥈</span>}
                    {index === 2 && <span className={styles.medal}>🥉</span>}
                    {index > 2 && <span className={styles.rankNumber}>#{index + 1}</span>}
                  </div>
                  <div className={styles.profile} title={entry.walletAddress || entry.profileName}>
                    {displayName}
                  </div>
                  <div className={styles.totalScore}>
                    {(entry.totalScore || entry.score).toLocaleString()}
                  </div>
                  <div className={styles.totalTime}>
                    {entry.totalTime !== undefined 
                      ? formatTime(entry.totalTime)
                      : '—'
                    }
                  </div>
                  <div className={styles.level}>{entry.level}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

