'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentProfileId, getProfileMetadata, loadProfile } from '@/lib/storage/gameStorage';
import { ColorPalette } from '@/lib/colorPalettes';
import { UserIcon, WalletIcon, TrophyIcon } from '../UI/GameIcons';
import styles from './MenuProfileCard.module.css';

interface MenuProfileCardProps {
  palette: ColorPalette;
  onClick?: () => void;
}

export default function MenuProfileCard({ palette, onClick }: MenuProfileCardProps) {
  const [profileName, setProfileName] = useState<string>('');
  const [walletLast4, setWalletLast4] = useState<string>('');
  const [totalScore, setTotalScore] = useState<number>(0);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const updateProfileData = () => {
      const profileId = getCurrentProfileId();
      if (profileId) {
        const metadata = getProfileMetadata(profileId);
        if (metadata) {
          setProfileName(metadata.name);
          setProfilePicture(metadata.profilePicture || null);
          
          // Extract last 4 characters of wallet if linked
          if (metadata.walletAddress) {
            setWalletLast4(metadata.walletAddress.slice(-4).toUpperCase());
          } else {
            setWalletLast4('');
          }
        }
        
        const stats = loadProfile();
        if (stats) {
          setTotalScore(stats.totalScore || 0);
        }
      } else {
        // No profile logged in
        setProfileName('');
        setWalletLast4('');
        setTotalScore(0);
        setProfilePicture(null);
      }
    };

    updateProfileData();
    
    // Update periodically to reflect changes
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

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Don't render if no profile is logged in
  if (!profileName) {
    return null;
  }

  return (
    <div 
      className={styles.profileCard}
      onClick={onClick}
      style={{
        borderColor: hexToRgba(palette.uiColors.primary, 0.3),
        '--glow-color': hexToRgba(palette.uiColors.primary, 0.15),
      } as React.CSSProperties}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Profile Avatar */}
      <div 
        className={styles.avatar}
        style={{
          background: profilePicture 
            ? 'transparent'
            : `linear-gradient(135deg, ${palette.uiColors.primary} 0%, ${palette.uiColors.secondary} 100%)`,
          borderColor: hexToRgba(palette.uiColors.primary, 0.4),
        }}
      >
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt={profileName}
            className={styles.avatarImage}
          />
        ) : (
          <span className={styles.avatarInitials}>
            {getInitials(profileName)}
          </span>
        )}
      </div>

      {/* Profile Info */}
      <div className={styles.info}>
        {/* Name Row */}
        <div className={styles.nameRow}>
          <span className={styles.name}>{profileName}</span>
          {walletLast4 && (
            <span 
              className={styles.walletBadge}
              style={{
                background: hexToRgba(palette.uiColors.primary, 0.2),
                borderColor: hexToRgba(palette.uiColors.primary, 0.3),
              }}
            >
              <WalletIcon size={10} />
              <span>•{walletLast4}</span>
            </span>
          )}
        </div>

        {/* Score Row */}
        <div className={styles.scoreRow}>
          <TrophyIcon size={12} className={styles.scoreIcon} />
          <span 
            className={styles.score}
            style={{ color: palette.uiColors.primary }}
          >
            {totalScore.toLocaleString()}
          </span>
          <span className={styles.scoreLabel}>total</span>
        </div>
      </div>
    </div>
  );
}

