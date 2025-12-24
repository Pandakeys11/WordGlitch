'use client';

import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  variant?: 'default' | 'highlight';
}

export default function StatsCard({
  label,
  value,
  icon,
  variant = 'default',
}: StatsCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
}

