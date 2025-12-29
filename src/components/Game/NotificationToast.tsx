'use client';

import React, { useEffect, useState } from 'react';
import { AchievementNotification } from '@/lib/game/achievementNotifications';
import styles from './NotificationToast.module.css';

interface NotificationToastProps {
  notification: AchievementNotification | null;
  onDismiss: () => void;
}

export default function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onDismiss();
        }, 300); // Exit animation duration
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification || !isVisible) return null;

  return (
    <div 
      className={`${styles.toast} ${styles[notification.type]} ${isExiting ? styles.exiting : ''}`}
      style={{
        '--toast-color': notification.color || '#ffffff',
      } as React.CSSProperties}
    >
      <div className={styles.icon}>{notification.icon || '✨'}</div>
      <div className={styles.content}>
        <div className={styles.title}>{notification.title}</div>
        <div className={styles.message}>{notification.message}</div>
      </div>
      <button 
        className={styles.closeButton}
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onDismiss();
          }, 300);
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}


