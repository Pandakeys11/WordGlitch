// Firebase Sync Service
// Automatically syncs game progress to Firebase and manages offline/online state
import { getCurrentUser } from './auth';
import { updateLeaderboard } from './leaderboard';
import { isFirebaseConfigured } from './config';
import {
    loadProgress as loadLocalProgress,
    loadProfile as loadLocalStats,
    saveProfileForId,
    saveProgress as saveLocalProgress,
    saveProfile as saveLocalProfile,
    getCurrentProfileId,
    getProfileMetadata,
    createProfile,
    STORAGE_KEYS
} from '../storage/gameStorage';
import { StoredProgress, GameStats } from '../storage/types';
import { UserProgress, saveProgress as saveFirebaseProgress, loadProgress as loadFirebaseProgress, saveProfile as saveFirebaseProfile, saveSession } from './database';
import { GameSession } from '@/types/game';

// Sync state
let isSyncing = false;
let lastSyncTime = 0;
const SYNC_INTERVAL = 30000; // Sync every 30 seconds

/**
 * Initialize auto-sync on app load
 */
export async function initializeSync(): Promise<void> {
    if (!isFirebaseConfigured()) return;

    const user = getCurrentUser();
    if (!user) return;

    try {
        const { syncProfileWithAuth } = await import('./profileSync');
        await syncProfileWithAuth();

        // Load data
        const cloudData = await loadFirebaseProgress(user.uid);
        const localProgress = loadLocalProgress();
        const localStats = loadLocalStats();

        if (cloudData && localProgress && localStats) {
            // MERGE: Keep the better progress
            // For now, simpler: Use Cloud levels if higher
            const cloudLevel = cloudData.highestLevel || cloudData.currentLevel;
            const localLevel = Math.max(localProgress.currentLevel, ...(localProgress.unlockedLevels || []));

            if (cloudLevel > localLevel) {
                // Restore from Cloud
                console.log('📥 Cloud progress better, restoring...');
                await restoreFromCloud(cloudData);
            } else {
                // Push Local to Cloud
                await saveFirebaseProgress(user.uid, localProgress, localStats);
                console.log('✅ Local progress fresher, synced to Firebase');
            }

        } else if (localProgress && localStats) {
            // Upload local progress to Firebase
            await saveFirebaseProgress(user.uid, localProgress, localStats);
            console.log('📤 Uploaded local progress to Firebase');
        } else if (cloudData) {
            // Restore from Cloud (New Device case)
            console.log('📥 restoring from Cloud (New Device)...');
            await restoreFromCloud(cloudData);
        }

        startAutoSync();
    } catch (error) {
        console.error('❌ Sync initialization failed:', error);
    }
}

async function restoreFromCloud(cloudData: UserProgress) {
    let profileId = getCurrentProfileId();
    if (!profileId) {
        // Create a profile for the cloud user
        profileId = createProfile('Cloud User');
    }

    // Restore Progress (StoredProgress)
    // We need to restore the full object including bestScores map
    const restoredProgress: StoredProgress = {
        currentLevel: cloudData.currentLevel || 1,
        unlockedLevels: cloudData.unlockedLevels || [1],
        bestScores: cloudData.bestScores || {},
        achievements: [] // We should ideally map cloud achievements here if we had them
    };

    // Direct write to storage to ensure we overwrite/restore fully
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(restoredProgress));

    // Restore Stats (GameStats)
    const restoredStats: GameStats = {
        totalScore: cloudData.totalScore || 0,
        totalWordsFound: cloudData.totalWordsFound || 0,
        levelsCompleted: cloudData.levelsCompleted || 0,
        totalPlayTime: 0,
        currentLevel: cloudData.currentLevel,
        unlockedLevels: cloudData.unlockedLevels || [1],
        averageAccuracy: 0,
        bestRoundScore: 0,
        bestScore: 0,
        totalRoundsPlayed: 0,
        wordsPerMinute: 0,
        averageScorePerRound: 0,
        totalAttempts: 0,
        totalCorrectFinds: 0,
        averageRoundTime: 0,
        fastestRoundTime: 0,
        perfectRounds: 0,
        longestCombo: 0,
        highestRound: cloudData.highestLevel,
        bestAccuracy: 0
    };

    saveProfileForId(profileId, restoredStats);

    // Reload page to reflect changes? 
    // Usually React state updates if we trigger listeners, but storage events don't trigger in same window.
    // For now, next refresh will show it.
}

/**
 * Save progress to Firebase (called after level completion)
 */
export async function syncProgressToFirebase(progress: StoredProgress): Promise<void> {
    if (!isFirebaseConfigured()) return;
    const user = getCurrentUser();
    if (!user) return;

    const stats = loadLocalStats();
    if (!stats) return;

    try {
        await saveFirebaseProgress(user.uid, progress, stats);

        // Update leaderboard
        const profileId = getCurrentProfileId();
        const profile = profileId ? getProfileMetadata(profileId) : null;
        const username = profile?.name || user.displayName || 'Anonymous';

        // Calculate derived values
        const derivedHighestLevel = Math.max(progress.currentLevel, ...(progress.unlockedLevels || []));
        const derivedTotalScore = stats.totalScore;

        await updateLeaderboard(
            user.uid,
            username,
            derivedTotalScore,
            derivedHighestLevel,
            profile?.profilePicture
        );

        console.log('✅ Progress synced to Firebase');
    } catch (error) {
        console.error('❌ Failed to sync progress:', error);
    }
}

/**
 * Save game session to Firebase (called after each level)
 */
export async function saveGameSession(session: GameSession): Promise<void> {
    if (!isFirebaseConfigured()) return;

    const user = getCurrentUser();
    if (!user) return;

    try {
        await saveSession(user.uid, session);
        console.log('✅ Session saved to Firebase');
    } catch (error) {
        console.error('❌ Failed to save session:', error);
    }
}

/**
 * Start automatic background sync
 */
function startAutoSync(): void {
    // Sync every 30 seconds
    setInterval(async () => {
        if (isSyncing) return;

        const now = Date.now();
        if (now - lastSyncTime < SYNC_INTERVAL) return;

        isSyncing = true;
        lastSyncTime = now;

        try {
            const user = getCurrentUser();
            if (!user) return;

            const progress = loadLocalProgress();
            if (progress) {
                await syncProgressToFirebase(progress);
            }
        } catch (error) {
            console.error('❌ Auto-sync failed:', error);
        } finally {
            isSyncing = false;
        }
    }, 10000); // Check every 10 seconds
}

/**
 * Force immediate sync
 */
export async function forceSyncNow(): Promise<void> {
    if (!isFirebaseConfigured()) {
        console.log('📴 Firebase not configured');
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        console.log('⚠️ No user logged in');
        return;
    }

    const progress = loadLocalProgress();
    if (!progress) {
        console.log('⚠️ No progress to sync');
        return;
    }

    console.log('🔄 Force syncing...');
    await syncProgressToFirebase(progress);
}

/**
 * Check if user is synced
 */
export function isSyncEnabled(): boolean {
    return isFirebaseConfigured() && getCurrentUser() !== null;
}

/**
 * Get sync status
 */
export function getSyncStatus(): {
    enabled: boolean;
    lastSync: number;
    syncing: boolean;
} {
    return {
        enabled: isSyncEnabled(),
        lastSync: lastSyncTime,
        syncing: isSyncing,
    };
}
