// Firebase Leaderboard Service
// Handles global leaderboard operations and rankings

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    where,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, isFirebaseConfigured } from './config';

export interface LeaderboardEntry {
    userId: string;
    username: string;
    totalScore: number;
    highestLevel: number;
    profilePicture?: string; // Profile picture URL or data URL
    totalTime?: string; // Total time played (formatted)
    lastUpdated: Timestamp;
    rank?: number;
}

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

/**
 * Update user's leaderboard entry
 */
export async function updateLeaderboard(
    userId: string,
    username: string,
    totalScore: number,
    highestLevel: number,
    profilePicture?: string
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const db = getFirebaseDb();
    const leaderboardRef = doc(db, 'leaderboard', userId);

    const entry: Omit<LeaderboardEntry, 'rank'> = {
        userId,
        username,
        totalScore,
        highestLevel,
        profilePicture,
        lastUpdated: serverTimestamp() as Timestamp,
    };

    await setDoc(leaderboardRef, entry, { merge: true });
}

/**
 * Get global leaderboard (top N players)
 */
export async function getGlobalLeaderboard(
    limitCount: number = 100
): Promise<LeaderboardEntry[]> {
    if (!isFirebaseConfigured()) {
        console.log('⚠️ Firebase not configured, returning empty leaderboard');
        return [];
    }

    try {
        console.log(`🔍 Fetching top ${limitCount} from leaderboard...`);
        const db = getFirebaseDb();
        const leaderboardRef = collection(db, 'leaderboard');
        const q = query(
            leaderboardRef,
            orderBy('totalScore', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        console.log(`📊 Found ${snapshot.docs.length} leaderboard entries`);

        const entries = snapshot.docs.map((doc, index) => ({
            ...doc.data() as LeaderboardEntry,
            rank: index + 1,
        }));

        console.log('✅ Leaderboard entries:', entries);
        return entries;
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        return [];
    }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const db = getFirebaseDb();
    const userRef = doc(db, 'leaderboard', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        return null;
    }

    const userData = userSnapshot.data() as LeaderboardEntry;
    const userScore = userData.totalScore;

    // Count how many users have a higher score
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
        leaderboardRef,
        where('totalScore', '>', userScore)
    );

    const snapshot = await getDocs(q);
    return snapshot.size + 1; // +1 because rank is 1-indexed
}

/**
 * Get leaderboard around user (user's rank ± N positions)
 */
export async function getLeaderboardAroundUser(
    userId: string,
    range: number = 5
): Promise<LeaderboardEntry[]> {
    if (!isFirebaseConfigured()) {
        return [];
    }

    const db = getFirebaseDb();
    const userRef = doc(db, 'leaderboard', userId);
    const userSnapshot = await getDoc(userRef);

    if (!userSnapshot.exists()) {
        return [];
    }

    const userData = userSnapshot.data() as LeaderboardEntry;
    const userScore = userData.totalScore;

    // Get users above
    const leaderboardRef = collection(db, 'leaderboard');
    const aboveQuery = query(
        leaderboardRef,
        where('totalScore', '>=', userScore),
        orderBy('totalScore', 'asc'),
        limit(range + 1)
    );

    // Get users below
    const belowQuery = query(
        leaderboardRef,
        where('totalScore', '<', userScore),
        orderBy('totalScore', 'desc'),
        limit(range)
    );

    const [aboveSnapshot, belowSnapshot] = await Promise.all([
        getDocs(aboveQuery),
        getDocs(belowQuery),
    ]);

    const above = aboveSnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
    const below = belowSnapshot.docs.map(doc => doc.data() as LeaderboardEntry);

    // Combine and sort
    const combined = [...above, ...below].sort((a, b) => b.totalScore - a.totalScore);

    // Add ranks
    return combined.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
}

/**
 * Get top players by level
 */
export async function getTopPlayersByLevel(
    limitCount: number = 50
): Promise<LeaderboardEntry[]> {
    if (!isFirebaseConfigured()) {
        return [];
    }

    const db = getFirebaseDb();
    const leaderboardRef = collection(db, 'leaderboard');
    const q = query(
        leaderboardRef,
        orderBy('highestLevel', 'desc'),
        orderBy('totalScore', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc, index) => ({
        ...doc.data() as LeaderboardEntry,
        rank: index + 1,
    }));
}

/**
 * Search for user on leaderboard by username
 */
export async function searchLeaderboard(
    username: string,
    limitCount: number = 20
): Promise<LeaderboardEntry[]> {
    if (!isFirebaseConfigured()) {
        return [];
    }

    const db = getFirebaseDb();
    const leaderboardRef = collection(db, 'leaderboard');

    // Firestore doesn't support case-insensitive search natively
    // This is a simple prefix search
    const q = query(
        leaderboardRef,
        where('username', '>=', username),
        where('username', '<=', username + '\uf8ff'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
}
