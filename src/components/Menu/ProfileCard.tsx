'use client';

import React from 'react';
import { UserIcon } from '../UI/GameIcons';
import { ColorPalette } from '@/lib/colorPalettes';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
    palette: ColorPalette;
    username: string;
    totalScore: number;
    currentLevel: number;
    profilePicture?: string;
    onClick: () => void;
}

export default function ProfileCard({
    palette,
    username,
    totalScore,
    currentLevel,
    profilePicture,
    onClick,
}: ProfileCardProps) {
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Get initials from username
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={styles.profileCard}
            onClick={onClick}
            style={{
                background: `linear-gradient(135deg, ${hexToRgba(palette.uiColors.primary, 0.15)} 0%, ${hexToRgba(palette.uiColors.secondary, 0.1)} 100%)`,
                borderColor: hexToRgba(palette.uiColors.primary, 0.4),
            }}
        >
            {/* Profile Picture / Avatar */}
            <div
                className={styles.avatar}
                style={{
                    ...(profilePicture
                        ? {
                            backgroundImage: `url(${profilePicture})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: '#000'
                        }
                        : {
                            background: `linear-gradient(135deg, ${palette.uiColors.primary} 0%, ${palette.uiColors.secondary} 100%)`
                        }
                    ),
                    borderColor: palette.uiColors.primary,
                }}
            >
                {!profilePicture && (
                    <span className={styles.initials} style={{ color: '#ffffff' }}>
                        {getInitials(username)}
                    </span>
                )}
            </div>

            {/* Profile Info */}
            <div className={styles.profileInfo}>
                <div className={styles.username} style={{ color: palette.uiColors.text }}>
                    {username}
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel} style={{ color: hexToRgba(palette.uiColors.text, 0.7) }}>
                            Level
                        </span>
                        <span className={styles.statValue} style={{ color: palette.uiColors.primary }}>
                            {currentLevel}
                        </span>
                    </div>
                    <div className={styles.statDivider} style={{ background: hexToRgba(palette.uiColors.text, 0.2) }} />
                    <div className={styles.statItem}>
                        <span className={styles.statLabel} style={{ color: hexToRgba(palette.uiColors.text, 0.7) }}>
                            Score
                        </span>
                        <span className={styles.statValue} style={{ color: palette.uiColors.secondary }}>
                            {totalScore.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* View Profile Arrow */}
            <div className={styles.arrow} style={{ color: palette.uiColors.primary }}>
                →
            </div>
        </div>
    );
}
