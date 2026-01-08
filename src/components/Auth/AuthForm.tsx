'use client';

import React, { useState } from 'react';
import {
    signUpWithEmail,
    signInWithEmail,
    signInAnonymous,
    convertAnonymousAccount
} from '@/lib/firebase/auth';
import { ColorPalette } from '@/lib/colorPalettes';
// We'll reuse AuthModal styles for now or create new ones, but for simplicity let's use inline or a new module
import styles from './AuthForm.module.css';

interface AuthFormProps {
    palette: ColorPalette;
    onSuccess: () => void;
    isAnonymous?: boolean;
    embedded?: boolean; // If true, simpler layout without modal headers
}

export default function AuthForm({ palette, onSuccess, isAnonymous = false, embedded = false }: AuthFormProps) {
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
                    await convertAnonymousAccount(email, password, username);
                } else {
                    await signUpWithEmail(email, password, username);
                }
                onSuccess();
            } else {
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
        <div className={`${styles.authContainer} ${embedded ? styles.embedded : ''}`}>
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
                        type="button"
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
                        type="button"
                    >
                        SIGN UP
                    </button>
                </div>
            )}

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
                                        background: 'rgba(255,255,255,0.05)'
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
                                    background: 'rgba(255,255,255,0.05)'
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
                                placeholder="Password (min 6 chars)"
                                style={{
                                    borderColor: palette.uiColors.primary,
                                    color: palette.uiColors.text,
                                    background: 'rgba(255,255,255,0.05)'
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
            </form>
        </div>
    );
}
