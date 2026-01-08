// Firebase Configuration
// This file initializes Firebase with your project credentials

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

export function initializeFirebase() {
    // Only initialize if not already initialized
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Initialize analytics only in browser environment
        if (typeof window !== 'undefined') {
            analytics = getAnalytics(app);
        }
    } else {
        app = getApps()[0];
        auth = getAuth(app);
        db = getFirestore(app);

        // Get analytics if in browser
        if (typeof window !== 'undefined' && !analytics) {
            analytics = getAnalytics(app);
        }
    }

    return { app, auth, db, analytics };
}

// Export initialized instances
export const getFirebaseApp = () => {
    if (!app) {
        initializeFirebase();
    }
    return app;
};

export const getFirebaseAuth = () => {
    if (!auth) {
        initializeFirebase();
    }
    return auth;
};

export const getFirebaseDb = () => {
    if (!db) {
        initializeFirebase();
    }
    return db;
};

export const getFirebaseAnalytics = () => {
    if (!analytics && typeof window !== 'undefined') {
        initializeFirebase();
    }
    return analytics;
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
};
