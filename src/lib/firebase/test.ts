// Test Firebase Connection
// Run this to verify Firebase is properly configured

import { initializeFirebase, isFirebaseConfigured } from './config';

export function testFirebaseConnection() {
    console.log('🔥 Testing Firebase Connection...');

    // Check if environment variables are loaded
    console.log('Environment Check:');
    console.log('- API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
    console.log('- Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing');
    console.log('- Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');

    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
        console.error('❌ Firebase is NOT configured!');
        console.log('📝 Make sure you created .env.local file with your Firebase credentials');
        return false;
    }

    console.log('✅ Firebase is configured!');

    try {
        // Try to initialize Firebase
        const { app, auth, db, analytics } = initializeFirebase();

        console.log('✅ Firebase initialized successfully!');
        console.log('- App:', app ? '✅' : '❌');
        console.log('- Auth:', auth ? '✅' : '❌');
        console.log('- Firestore:', db ? '✅' : '❌');
        console.log('- Analytics:', analytics ? '✅' : '⚠️ (only in browser)');

        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return false;
    }
}

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Run test after a short delay to ensure environment is loaded
    setTimeout(() => {
        testFirebaseConnection();
    }, 1000);
}
