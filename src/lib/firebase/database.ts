// Firebase Database Service
// Handles all Firestore database operations for user progress and game data

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './config';
import { StoredProgress, StoredProfile, GameStats } from '../storage/types';
import { GameSession } from '@/types/game';

export interface UserProgress {
    currentLevel: number;
    highestLevel: number;
    totalScore: number;
    totalWordsFound: number;
    levelsCompleted: number;
    unlockedLevels: number[];
    bestScores: Record<number, number>; // level -> best score
    achievements: string[];
    lastUpdated: Timestamp;
}

// ... UserProfile ...

/**
 * Save user progress to Firestore
 */
export async function saveProgress(
    userId: string,
    progress: StoredProgress,
    stats: GameStats
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const db = getFirebaseDb();
    const progressRef = doc(db, 'users', userId, 'progress', 'current');

    const data: UserProgress = {
        currentLevel: progress.currentLevel,
        highestLevel: Math.max(progress.currentLevel, ...progress.unlockedLevels), // derived
        totalScore: stats.totalScore,
        totalWordsFound: stats.totalWordsFound,
        levelsCompleted: stats.levelsCompleted,
        unlockedLevels: progress.unlockedLevels,
        bestScores: progress.bestScores || {},
        achievements: progress.achievements?.map(a => a.id) || [],
        lastUpdated: serverTimestamp() as Timestamp,
    };

    await setDoc(progressRef, data, { merge: true });
}

/**
 * Load user progress from Firestore
 * Returns UserProgress (cloud format) which contains more data than StoredProgress
 */
export async function loadProgress(userId: string): Promise<UserProgress | null> {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const db = getFirebaseDb();
    const progressRef = doc(db, 'users', userId, 'progress', 'current');
    const snapshot = await getDoc(progressRef);

    if (!snapshot.exists()) {
        return null;
    }

    // Cast the data to UserProgress
    return snapshot.data() as UserProgress;
}

/**
 * Save user profile to Firestore
 */
export async function saveProfile(
    userId: string,
    profile: { username: string; email?: string; walletAddress?: string; profilePicture?: string }
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);

    const data: Partial<UserProfile> = {
        username: profile.username,
        email: profile.email,
        walletAddress: profile.walletAddress,
        profilePicture: profile.profilePicture, // Added profilePicture
        lastActive: serverTimestamp() as Timestamp,
    };

    // Check if user exists
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        // Create new user
        await setDoc(userRef, {
            ...data,
            createdAt: serverTimestamp(),
        });
    } else {
        // Update existing user
        await updateDoc(userRef, data);
    }
}

/**
 * Load user profile from Firestore
 */
export async function loadProfile(userId: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const db = getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.data() as UserProfile;
}

/**
 * Save game session to Firestore
 */
export async function saveSession(
    userId: string,
    session: GameSession
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const db = getFirebaseDb();
    const sessionId = `session-${Date.now()}`;
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);

    await setDoc(sessionRef, {
        level: session.level,
        score: session.score.finalScore,
        wordsFound: session.score.wordsFound,
        accuracy: session.score.accuracy,
        timestamp: serverTimestamp(),
    });
}

/**
 * Get user's recent sessions
 */
export async function getRecentSessions(
    userId: string,
    limitCount: number = 10
): Promise<any[]> {
    if (!isFirebaseConfigured()) {
        return [];
    }

    const db = getFirebaseDb();
    const sessionsRef = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export interface UserProfile {
    username: string;
    email?: string;
    walletAddress?: string;
    profilePicture?: string;
    createdAt: Timestamp;
    lastActive: Timestamp;
}

// ... saveProgress and loadProgress ...

/**
 * Sync local data to Firebase (migration helper)
 */
export async function syncLocalToFirebase(
    userId: string,
    localProgress: StoredProgress,
    localStats: GameStats,
    localProfile: { name: string; walletAddress?: string; profilePicture?: string }
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    // Save profile
    await saveProfile(userId, {
        username: localProfile.name,
        walletAddress: localProfile.walletAddress,
        profilePicture: localProfile.profilePicture
    });

    // Save progress
    await saveProgress(userId, localProgress, localStats);
}
