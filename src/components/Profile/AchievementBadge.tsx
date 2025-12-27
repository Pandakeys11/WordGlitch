'use client';

import React from 'react';
import { Achievement } from '@/types/profile';
import {
  TrophyIcon,
  TargetIcon,
  SearchIcon,
  StarIcon,
  ZapIcon,
  FlameIcon,
  MedalIcon
} from '@/components/UI/GameIcons';
import styles from './AchievementBadge.module.css';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const getAchievementIcon = (iconName?: string) => {
  const size = 32;
  switch (iconName) {
    case 'target':
      return <TargetIcon size={size} />;
    case 'search':
      return <SearchIcon size={size} />;
    case 'trophy':
      return <TrophyIcon size={size} />;
    case 'star':
      return <StarIcon size={size} />;
    case 'zap':
      return <ZapIcon size={size} />;
    case 'flame':
      return <FlameIcon size={size} />;
    case 'medal':
      return <MedalIcon size={size} />;
    default:
      return <TrophyIcon size={size} />;
  }
};

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  return (
    <div className={styles.badge}>
      <div className={styles.icon}>{getAchievementIcon(achievement.icon)}</div>
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

