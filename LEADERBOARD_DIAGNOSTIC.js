// Leaderboard Diagnostic Script
// Add this temporarily to MenuScreen.tsx to debug

console.log('=== LEADERBOARD DIAGNOSTIC ===');

// Check 1: Firebase Configuration
console.log('1. Firebase Config:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing',
});

// Check 2: User Authentication
import { getCurrentUser } from '@/lib/firebase/auth';
const currentUser = getCurrentUser();
console.log('2. Current User:', currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName
} : '❌ Not logged in');

// Check 3: Direct Firebase Query
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase/config';

async function diagnosticQuery() {
    try {
        const db = getFirebaseDb();
        console.log('3. Firebase DB Instance:', db ? '✅ Connected' : '❌ Not connected');

        // Query leaderboard directly
        const leaderboardRef = collection(db, 'leaderboard');
        const q = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(10));

        console.log('4. Executing query...');
        const snapshot = await getDocs(q);

        console.log('5. Query Results:', {
            totalDocs: snapshot.docs.length,
            isEmpty: snapshot.empty
        });

        if (snapshot.docs.length > 0) {
            console.log('6. First Entry:', snapshot.docs[0].data());
            console.log('7. All Entries:', snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        } else {
            console.log('6. ❌ No documents found in leaderboard collection');

            // Check if collection exists
            console.log('7. Checking all collections...');
            // Note: Can't list collections in client-side code
            console.log('   → Go to Firebase Console to verify leaderboard collection exists');
        }

    } catch (error) {
        console.error('❌ Diagnostic Query Failed:', error);
        if (error.code === 'permission-denied') {
            console.log('🔒 PERMISSION DENIED - Firestore rules are blocking access!');
            console.log('   → Check Firebase Console → Firestore → Rules');
            console.log('   → Ensure: allow read: if true; for leaderboard');
        }
    }
}

// Run diagnostic
diagnosticQuery();

console.log('=== END DIAGNOSTIC ===');
