// useFirebaseSync Hook
// React hook for Firebase authentication and sync management

import { useState, useEffect, useCallback } from 'react';
import { onAuthChange, getCurrentUser, AuthUser } from '@/lib/firebase/auth';
import { initializeSync, syncProgressToFirebase, saveGameSession, forceSyncNow, getSyncStatus } from '@/lib/firebase/sync';
import { loadProgress } from '@/lib/storage/gameStorage';
import { GameSession } from '@/types/game';

export function useFirebaseSync() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [syncStatus, setSyncStatus] = useState(getSyncStatus());
    const [isInitialized, setIsInitialized] = useState(false);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange((authUser) => {
            setUser(authUser);

            // Initialize sync when user logs in
            if (authUser && !isInitialized) {
                initializeSync().then(() => {
                    setIsInitialized(true);
                    console.log('✅ Firebase sync initialized');
                });
            }
        });

        return () => unsubscribe();
    }, [isInitialized]);

    // Update sync status periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setSyncStatus(getSyncStatus());
        }, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Sync progress to Firebase
    const syncProgress = useCallback(async () => {
        const progress = loadProgress();
        if (progress) {
            await syncProgressToFirebase(progress);
            setSyncStatus(getSyncStatus());
        }
    }, []);

    // Save session to Firebase
    const saveSession = useCallback(async (session: GameSession) => {
        await saveGameSession(session);
    }, []);

    // Force sync now
    const forceSync = useCallback(async () => {
        await forceSyncNow();
        setSyncStatus(getSyncStatus());
    }, []);

    return {
        user,
        isAuthenticated: user !== null,
        isAnonymous: user?.isAnonymous || false,
        syncStatus,
        syncProgress,
        saveSession,
        forceSync,
        isSyncInitialized: isInitialized,
    };
}
