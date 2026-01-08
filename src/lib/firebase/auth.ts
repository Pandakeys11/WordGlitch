// Firebase Authentication Service
// Handles user authentication, registration, and session management

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
    updateProfile,
    linkWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './config';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    isAnonymous: boolean;
}

// Convert Firebase User to AuthUser
function toAuthUser(user: User | null): AuthUser | null {
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous,
    };
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    return toAuthUser(userCredential.user)!;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
    email: string,
    password: string
): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return toAuthUser(userCredential.user)!;
}

/**
 * Sign in anonymously (for guest play)
 */
export async function signInAnonymous(): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const auth = getFirebaseAuth();
    const userCredential = await signInAnonymously(auth);
    return toAuthUser(userCredential.user)!;
}

/**
 * Convert anonymous account to permanent account
 */
export async function convertAnonymousAccount(
    email: string,
    password: string,
    displayName: string
): Promise<AuthUser> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user || !user.isAnonymous) {
        throw new Error('No anonymous user to convert');
    }

    // Create credential
    const credential = EmailAuthProvider.credential(email, password);

    // Link credential to anonymous account
    const userCredential = await linkWithCredential(user, credential);

    // Update display name
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    return toAuthUser(userCredential.user)!;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
    if (!isFirebaseConfigured()) {
        return;
    }

    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
}

/**
 * Get current user
 */
export function getCurrentUser(): AuthUser | null {
    if (!isFirebaseConfigured()) {
        return null;
    }

    const auth = getFirebaseAuth();
    return toAuthUser(auth.currentUser);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    if (!isFirebaseConfigured()) {
        callback(null);
        return () => { };
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (user) => {
        callback(toAuthUser(user));
    });
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}
