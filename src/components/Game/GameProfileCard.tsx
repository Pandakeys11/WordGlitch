'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentProfileId, getProfileMetadata, loadProfile } from '@/lib/storage/gameStorage';
import styles from './GameProfileCard.module.css';

export default function GameProfileCard() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [totalScore, setTotalScore] = useState<number>(0);

  useEffect(() => {
    const updateProfileData = () => {
      const profileId = getCurrentProfileId();
      if (profileId) {
        const metadata = getProfileMetadata(profileId);
        if (metadata) {
          setProfilePicture(metadata.profilePicture || null);
          setProfileName(metadata.name);
        }
        
        const stats = loadProfile();
        if (stats) {
          setTotalScore(stats.totalScore || 0);
        }
      }
    };

    updateProfileData();
    
    // Update periodically to reflect changes (e.g., after level completion)
    const interval = setInterval(updateProfileData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!profileName) {
    return null; // Don't show if no profile
  }

  return (
    <div className={styles.profileCard}>
      <div className={styles.profilePicture}>
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt={profileName}
            className={styles.pictureImage}
          />
        ) : (
          <div className={styles.pictureInitials}>
            {getInitials(profileName)}
          </div>
        )}
      </div>
      <div className={styles.profileInfo}>
        <div className={styles.totalScore}>
          {totalScore.toLocaleString()}
        </div>
        <div className={styles.scoreLabel}>Total</div>
      </div>
    </div>
  );
}

