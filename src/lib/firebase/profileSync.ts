// Profile Sync Service
// Links Firebase authentication with local game profiles

import { getCurrentUser, signOut as firebaseSignOut } from './auth';
import {
    loadProfile as loadLocalStats, // Was loadLocalProfile (returns GameStats)
    saveProfile as saveLocalStats, // Was saveLocalProfile (takes GameStats)
    getCurrentProfileId,
    setCurrentProfileId,
    createProfile,
    getAllProfiles,
    getProfileMetadata,
    updateProfileMetadata
} from '../storage/gameStorage';
import { saveProfile as saveFirebaseProfile, loadProfile as loadFirebaseProfile } from './database';
import { isFirebaseConfigured } from './config';

/**
 * Sync local profile with Firebase user
 * Creates or updates local profile based on Firebase auth
 */
export async function syncProfileWithAuth(): Promise<void> {
    if (!isFirebaseConfigured()) {
        console.log('📴 Firebase not configured - skipping profile sync');
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        console.log('👤 No user logged in - skipping profile sync');
        return;
    }

    console.log('🔄 Syncing profile with Firebase auth...');

    try {
        // Check if we have a Firebase profile
        const firebaseProfile = await loadFirebaseProfile(user.uid);

        if (firebaseProfile) {
            // Firebase profile exists - sync to local
            console.log('📥 Loading profile from Firebase');

            // Find or create local profile linked to this Firebase user
            const allProfiles = getAllProfiles();
            let localProfile = allProfiles.find(p => p.walletAddress === user.uid);

            if (!localProfile) {
                // Check if profile with this name already exists
                const existingByName = allProfiles.find(p => p.name === firebaseProfile.username);

                if (existingByName) {
                    // Link existing profile to Firebase user
                    localProfile = existingByName;
                    updateProfileMetadata(existingByName.id, {
                        walletAddress: user.uid
                    });
                    setCurrentProfileId(existingByName.id);
                    console.log('✅ Linked existing profile to Firebase user');
                } else {
                    // Create new local profile linked to Firebase user
                    const profileId = createProfile(
                        firebaseProfile.username,
                        user.uid
                    );
                    setCurrentProfileId(profileId);
                    console.log('✅ Created new local profile linked to Firebase');
                }
            } else {
                // Use existing linked profile
                setCurrentProfileId(localProfile.id);
                console.log('✅ Using existing linked profile');
            }
        } else {
            // No Firebase profile - create from local or auth
            console.log('📤 Creating Firebase profile from local data');

            const currentProfileId = getCurrentProfileId();
            let username = user.displayName || user.email?.split('@')[0] || 'Player';
            let profilePicture = undefined;

            if (currentProfileId) {
                // Use existing local profile
                const localMetadata = getProfileMetadata(currentProfileId);
                if (localMetadata) {
                    username = localMetadata.name;
                    profilePicture = localMetadata.profilePicture;

                    // Link local profile to Firebase user
                    updateProfileMetadata(currentProfileId, {
                        walletAddress: user.uid
                    });
                }
            } else {
                // Create new local profile
                const profileId = createProfile(username, user.uid);
                setCurrentProfileId(profileId);
            }

            // Save to Firebase
            await saveFirebaseProfile(user.uid, {
                username,
                email: user.email || undefined,
                walletAddress: user.uid,
                profilePicture
            });

            console.log('✅ Created Firebase profile');
        }
    } catch (error) {
        console.error('❌ Profile sync failed:', error);
    }
}

/**
 * Update profile name in both local and Firebase
 */
export async function updateProfileName(newName: string): Promise<void> {
    const user = getCurrentUser();
    const profileId = getCurrentProfileId();

    if (!profileId) {
        throw new Error('No profile selected');
    }

    // Update local profile
    try {
        updateProfileMetadata(profileId, { name: newName });
    } catch (e) {
        console.error('Failed to update local profile name:', e);
    }

    // Update Firebase if authenticated
    if (user && isFirebaseConfigured()) {
        const metadata = getProfileMetadata(profileId);
        await saveFirebaseProfile(user.uid, {
            username: newName,
            email: user.email || undefined,
            walletAddress: user.uid,
            profilePicture: metadata?.profilePicture
        });
    }
}

/**
 * Sign out and clear current profile
 */
export async function signOutAndClearProfile(): Promise<void> {
    console.log('🚪 Signing out...');

    // Sign out from Firebase
    if (isFirebaseConfigured()) {
        await firebaseSignOut();
        console.log('✅ Signed out from Firebase');
    }

    // Clear current profile ID (but don't delete the profile)
    // This allows the user to select a different profile or sign in again
    const currentProfileId = getCurrentProfileId();
    if (currentProfileId) {
        console.log('📝 Cleared current profile selection');
    }

    console.log('✅ Sign out complete');
}

/**
 * Get current profile info (combined local + Firebase)
 */
export function getCurrentProfileInfo(): {
    profileId: string | null;
    username: string | null;
    email: string | null;
    isAuthenticated: boolean;
    isAnonymous: boolean;
} {
    const user = getCurrentUser();
    const profileId = getCurrentProfileId();

    let username: string | null = null;

    if (profileId) {
        const localMetadata = getProfileMetadata(profileId);
        if (localMetadata) {
            username = localMetadata.name;
        }
    }

    // Override with Firebase display name if available
    if (user?.displayName) {
        username = user.displayName;
    }

    return {
        profileId,
        username,
        email: user?.email || null,
        isAuthenticated: user !== null,
        isAnonymous: user?.isAnonymous || false,
    };
}

/**
 * Check if current profile is linked to Firebase
 */
export function isProfileLinkedToFirebase(): boolean {
    const user = getCurrentUser();
    const profileId = getCurrentProfileId();

    if (!user || !profileId) {
        return false;
    }

    const localMetadata = getProfileMetadata(profileId);
    if (!localMetadata) {
        return false;
    }

    // Profile is linked if walletAddress matches Firebase UID
    return localMetadata.walletAddress === user.uid;
}

/**
 * Link current local profile to Firebase user
 */
export async function linkCurrentProfileToFirebase(): Promise<void> {
    const user = getCurrentUser();
    const profileId = getCurrentProfileId();

    if (!user) {
        throw new Error('No user logged in');
    }

    if (!profileId) {
        throw new Error('No profile selected');
    }

    const localMetadata = getProfileMetadata(profileId);
    if (!localMetadata) {
        throw new Error('Profile not found');
    }

    // Link profile to Firebase user
    updateProfileMetadata(profileId, {
        walletAddress: user.uid,
    });

    // Save to Firebase
    await saveFirebaseProfile(user.uid, {
        username: localMetadata.name,
        email: user.email || undefined,
        walletAddress: user.uid,
        profilePicture: localMetadata.profilePicture,
    });

    console.log('✅ Profile linked to Firebase');
}
