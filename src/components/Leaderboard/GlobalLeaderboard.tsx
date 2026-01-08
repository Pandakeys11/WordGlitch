'use client';

import React, { useState, useEffect } from 'react';
import { getGlobalLeaderboard, getUserRank, LeaderboardEntry } from '@/lib/firebase/leaderboard';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import styles from './GlobalLeaderboard.module.css';

interface GlobalLeaderboardProps {
    palette: any;
    onClose?: () => void;
}

export default function GlobalLeaderboard({ palette, onClose }: GlobalLeaderboardProps) {
    const { user, isAuthenticated } = useFirebaseSync();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'score' | 'level'>('score');
    const [limit, setLimit] = useState(50);

    useEffect(() => {
        loadLeaderboard();
    }, [filter, limit]);

    useEffect(() => {
        if (user) {
            loadUserRank();
        }
    }, [user]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const data = await getGlobalLeaderboard(limit);
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserRank = async () => {
        if (!user) return;
        try {
            const rank = await getUserRank(user.uid);
            setUserRank(rank);
        } catch (error) {
            console.error('Failed to load user rank:', error);
        }
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    const formatScore = (score: number) => {
        return score.toLocaleString();
    };

    return (
        <div className={styles.overlay}>
            <div
                className={styles.modal}
                style={{
                    borderColor: palette.uiColors.primary,
                    background: `linear-gradient(135deg, ${palette.uiColors.background}ee 0%, ${palette.uiColors.background}dd 100%)`,
                }}
            >
                {/* Header */}
                <div className={styles.header}>
                    <h2 style={{ color: palette.uiColors.primary }}>
                        🏆 GLOBAL LEADERBOARD
                    </h2>
                    {onClose && (
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            style={{ color: palette.uiColors.text }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* User Rank Banner */}
                {isAuthenticated && userRank && (
                    <div
                        className={styles.userRankBanner}
                        style={{
                            background: `linear-gradient(90deg, ${palette.uiColors.primary}33 0%, ${palette.uiColors.secondary}33 100%)`,
                            borderColor: palette.uiColors.primary,
                        }}
                    >
                        <span style={{ color: palette.uiColors.primary }}>
                            YOUR RANK: {getRankEmoji(userRank)}
                        </span>
                    </div>
                )}

                {/* Filters */}
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterButton} ${filter === 'score' ? styles.active : ''}`}
                        onClick={() => setFilter('score')}
                        style={{
                            borderColor: filter === 'score' ? palette.uiColors.primary : palette.uiColors.text,
                            color: filter === 'score' ? palette.uiColors.primary : palette.uiColors.text,
                        }}
                    >
                        BY SCORE
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'level' ? styles.active : ''}`}
                        onClick={() => setFilter('level')}
                        style={{
                            borderColor: filter === 'level' ? palette.uiColors.primary : palette.uiColors.text,
                            color: filter === 'level' ? palette.uiColors.primary : palette.uiColors.text,
                        }}
                    >
                        BY LEVEL
                    </button>
                </div>

                {/* Leaderboard List */}
                <div className={styles.leaderboardContainer}>
                    {loading ? (
                        <div className={styles.loading} style={{ color: palette.uiColors.text }}>
                            <div className={styles.spinner}></div>
                            Loading leaderboard...
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className={styles.empty} style={{ color: palette.uiColors.text }}>
                            <p>No players yet!</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                                Be the first to set a score!
                            </p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={entry.userId}
                                    className={`${styles.entry} ${user?.uid === entry.userId ? styles.currentUser : ''}`}
                                    style={{
                                        background: user?.uid === entry.userId
                                            ? `${palette.uiColors.primary}22`
                                            : index % 2 === 0
                                                ? `${palette.uiColors.text}05`
                                                : 'transparent',
                                        borderColor: user?.uid === entry.userId ? palette.uiColors.primary : 'transparent',
                                    }}
                                >
                                    <div className={styles.rank}>
                                        <span style={{
                                            color: entry.rank && entry.rank <= 3 ? palette.uiColors.accent : palette.uiColors.text,
                                            fontSize: entry.rank && entry.rank <= 3 ? '1.5rem' : '1rem',
                                        }}>
                                            {entry.rank ? getRankEmoji(entry.rank) : '—'}
                                        </span>
                                    </div>

                                    {/* Profile Picture */}
                                    <div
                                        className={styles.avatar}
                                        style={{
                                            background: entry.profilePicture
                                                ? `url(${entry.profilePicture})`
                                                : `linear-gradient(135deg, ${palette.uiColors.primary} 0%, ${palette.uiColors.secondary} 100%)`,
                                            borderColor: user?.uid === entry.userId ? palette.uiColors.primary : palette.uiColors.text,
                                        }}
                                    >
                                        {!entry.profilePicture && (
                                            <span className={styles.initials}>
                                                {entry.username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.username}>
                                        <span style={{ color: palette.uiColors.text }}>
                                            {entry.username}
                                            {user?.uid === entry.userId && (
                                                <span style={{ color: palette.uiColors.primary, marginLeft: '0.5rem' }}>
                                                    (You)
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <div className={styles.stats}>
                                        <div className={styles.stat}>
                                            <span className={styles.label} style={{ color: palette.uiColors.text, opacity: 0.7 }}>
                                                Score
                                            </span>
                                            <span className={styles.value} style={{ color: palette.uiColors.primary }}>
                                                {formatScore(entry.totalScore)}
                                            </span>
                                        </div>
                                        <div className={styles.stat}>
                                            <span className={styles.label} style={{ color: palette.uiColors.text, opacity: 0.7 }}>
                                                Level
                                            </span>
                                            <span className={styles.value} style={{ color: palette.uiColors.secondary }}>
                                                {entry.highestLevel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.refreshButton}
                        onClick={loadLeaderboard}
                        disabled={loading}
                        style={{
                            borderColor: palette.uiColors.primary,
                            color: palette.uiColors.primary,
                        }}
                    >
                        🔄 REFRESH
                    </button>

                    {!isAuthenticated && (
                        <p className={styles.loginPrompt} style={{ color: palette.uiColors.text, opacity: 0.7 }}>
                            Sign in to compete on the leaderboard!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
