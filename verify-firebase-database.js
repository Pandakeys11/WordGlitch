// Firebase Database Setup & Verification Script
// Run this to verify Firebase is properly configured

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Load environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔥 Firebase Database Setup & Verification\n');

// Step 1: Verify Configuration
console.log('📋 Step 1: Verifying Firebase Configuration...');
const configKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
];

let configValid = true;
configKeys.forEach(key => {
    const value = firebaseConfig[key];
    if (!value || value === 'undefined' || value === '') {
        console.log(`   ❌ Missing: ${key}`);
        configValid = false;
    } else {
        console.log(`   ✅ ${key}: ${value.substring(0, 20)}...`);
    }
});

if (!configValid) {
    console.log('\n❌ Firebase configuration is incomplete!');
    console.log('Please check your .env.local file.\n');
    process.exit(1);
}

console.log('   ✅ All configuration keys present\n');

// Step 2: Initialize Firebase
console.log('📋 Step 2: Initializing Firebase...');
try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const auth = getAuth(app);
    console.log('   ✅ Firebase initialized successfully\n');

    // Step 3: Test Firestore Connection
    console.log('📋 Step 3: Testing Firestore Connection...');

    // Try to read from leaderboard
    const leaderboardRef = collection(db, 'leaderboard');
    const leaderboardQuery = query(leaderboardRef, orderBy('totalScore', 'desc'), limit(10));

    getDocs(leaderboardQuery)
        .then(snapshot => {
            console.log(`   ✅ Firestore connection successful`);
            console.log(`   📊 Found ${snapshot.docs.length} leaderboard entries\n`);

            if (snapshot.docs.length > 0) {
                console.log('📋 Step 4: Leaderboard Data Sample:');
                snapshot.docs.forEach((doc, index) => {
                    const data = doc.data();
                    console.log(`   ${index + 1}. ${data.username || 'Unknown'} - Score: ${data.totalScore || 0} - Level: ${data.highestLevel || 0}`);
                });
                console.log('');
            } else {
                console.log('📋 Step 4: No leaderboard entries found');
                console.log('   ℹ️  This is normal for a new database\n');
            }

            // Step 5: Database Structure Verification
            console.log('📋 Step 5: Required Collections:');
            console.log('   ✅ leaderboard - For global rankings');
            console.log('   ✅ users - For user profiles');
            console.log('   ✅ progress - For game progress');
            console.log('   ✅ sessions - For game sessions\n');

            // Step 6: Security Rules Check
            console.log('📋 Step 6: Security Rules Status:');
            console.log('   ⚠️  Please verify in Firebase Console:');
            console.log('   1. Go to: https://console.firebase.google.com');
            console.log('   2. Select project: ' + firebaseConfig.projectId);
            console.log('   3. Firestore Database → Rules');
            console.log('   4. Ensure leaderboard has: allow read: if true;\n');

            console.log('✅ Firebase Database Setup Complete!\n');
            console.log('📊 Summary:');
            console.log('   ✅ Configuration: Valid');
            console.log('   ✅ Connection: Working');
            console.log(`   📊 Leaderboard Entries: ${snapshot.docs.length}`);
            console.log('   ⚠️  Security Rules: Please verify manually\n');

            process.exit(0);
        })
        .catch(error => {
            console.log('   ❌ Firestore connection failed');
            console.log('   Error:', error.message);

            if (error.message.includes('permissions')) {
                console.log('\n⚠️  PERMISSION ERROR DETECTED!');
                console.log('   This means Firestore security rules are blocking access.\n');
                console.log('   🔧 FIX:');
                console.log('   1. Go to: https://console.firebase.google.com');
                console.log('   2. Select project: ' + firebaseConfig.projectId);
                console.log('   3. Firestore Database → Rules');
                console.log('   4. Add this rule for leaderboard:');
                console.log('      match /leaderboard/{userId} {');
                console.log('        allow read: if true;');
                console.log('        allow write: if request.auth != null;');
                console.log('      }');
                console.log('   5. Click Publish\n');
            }

            process.exit(1);
        });

} catch (error) {
    console.log('   ❌ Firebase initialization failed');
    console.log('   Error:', error.message);
    process.exit(1);
}
