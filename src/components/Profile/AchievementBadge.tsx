'use client';

import React from 'react';
import { Achievement } from '@/types/profile';
import styles from './AchievementBadge.module.css';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <div className={styles.badge}>
      <div className={styles.icon}>{achievement.icon || '🏆'}</div>
      <div className={styles.content}>
        <h3 className={styles.name}>{achievement.name}</h3>
        <p className={styles.description}>{achievement.description}</p>
        {achievement.unlockedAt && (
          <span className={styles.date}>
            {new Date(achievement.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

