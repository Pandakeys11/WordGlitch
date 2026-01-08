'use client';

import React, { useState } from 'react';
import {
    signUpWithEmail,
    signInWithEmail,
    signInAnonymous,
    convertAnonymousAccount
} from '@/lib/firebase/auth';
import styles from './AuthModal.module.css';

interface AuthModalProps {
    palette: any;
    onClose: () => void;
    onSuccess: () => void;
    isAnonymous?: boolean;
}

export default function AuthModal({ palette, onClose, onSuccess, isAnonymous = false }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup' | 'guest'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'guest') {
                await signInAnonymous();
                onSuccess();
            } else if (mode === 'signup') {
                if (isAnonymous) {
                    // Convert anonymous account
                    await convertAnonymousAccount(email, password, username);
                } else {
                    // Create new account
                    await signUpWithEmail(email, password, username);
                }
                onSuccess();
            } else {
                // Login
                await signInWithEmail(email, password);
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
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
                        {isAnonymous ? '🔐 SAVE YOUR PROGRESS' : '🎮 WORD GLITCH'}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        style={{ color: palette.uiColors.text }}
                    >
                        ✕
                    </button>
                </div>

                {/* Mode Tabs */}
                {!isAnonymous && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${mode === 'login' ? styles.active : ''}`}
                            onClick={() => setMode('login')}
                            style={{
                                borderColor: mode === 'login' ? palette.uiColors.primary : 'transparent',
                                color: mode === 'login' ? palette.uiColors.primary : palette.uiColors.text,
                            }}
                        >
                            LOGIN
                        </button>
                        <button
                            className={`${styles.tab} ${mode === 'signup' ? styles.active : ''}`}
                            onClick={() => setMode('signup')}
                            style={{
                                borderColor: mode === 'signup' ? palette.uiColors.primary : 'transparent',
                                color: mode === 'signup' ? palette.uiColors.primary : palette.uiColors.text,
                            }}
                        >
                            SIGN UP
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {mode !== 'guest' && (
                        <>
                            {mode === 'signup' && (
                                <div className={styles.field}>
                                    <label style={{ color: palette.uiColors.text }}>Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="Enter username"
                                        style={{
                                            borderColor: palette.uiColors.primary,
                                            color: palette.uiColors.text,
                                        }}
                                    />
                                </div>
                            )}

                            <div className={styles.field}>
                                <label style={{ color: palette.uiColors.text }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter email"
                                    style={{
                                        borderColor: palette.uiColors.primary,
                                        color: palette.uiColors.text,
                                    }}
                                />
                            </div>

                            <div className={styles.field}>
                                <label style={{ color: palette.uiColors.text }}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    placeholder="Enter password (min 6 characters)"
                                    style={{
                                        borderColor: palette.uiColors.primary,
                                        color: palette.uiColors.text,
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <div className={styles.error} style={{ color: '#ff4444' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                        style={{
                            background: `linear-gradient(135deg, ${palette.uiColors.primary} 0%, ${palette.uiColors.secondary} 100%)`,
                            color: '#ffffff',
                        }}
                    >
                        {loading ? 'LOADING...' : mode === 'guest' ? 'PLAY AS GUEST' : mode === 'signup' ? 'CREATE ACCOUNT' : 'LOGIN'}
                    </button>

                    {!isAnonymous && mode !== 'guest' && (
                        <button
                            type="button"
                            className={styles.guestButton}
                            onClick={() => setMode('guest')}
                            style={{
                                borderColor: palette.uiColors.text,
                                color: palette.uiColors.text,
                            }}
                        >
                            OR PLAY AS GUEST
                        </button>
                    )}
                </form>

                {/* Info */}
                <div className={styles.info} style={{ color: palette.uiColors.text, opacity: 0.7 }}>
                    {isAnonymous ? (
                        <p>Create an account to save your progress across devices!</p>
                    ) : mode === 'signup' ? (
                        <p>Create an account to compete on the global leaderboard!</p>
                    ) : (
                        <p>Sign in to sync your progress and compete globally!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
