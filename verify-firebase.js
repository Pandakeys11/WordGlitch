#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * Run this to verify your Firebase setup is working
 */

console.log('🔥 Firebase Setup Verification\n');
console.log('================================\n');

// Check environment variables
console.log('📋 Checking Environment Variables...\n');

const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
];

let allSet = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: Set`);
    } else {
        console.log(`❌ ${varName}: Missing`);
        allSet = false;
    }
});

console.log('\n================================\n');

if (allSet) {
    console.log('✅ All environment variables are set!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Restart your dev server (Ctrl+C, then npm run dev)');
    console.log('2. Open browser console');
    console.log('3. Look for "✅ Firebase initialized successfully!"');
    console.log('4. Start integrating Firebase into your game!');
    console.log('\n📘 See FIREBASE_INTEGRATION_GUIDE.md for details\n');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\n🔧 Fix:');
    console.log('1. Make sure .env.local exists in project root');
    console.log('2. Check all variables are spelled correctly');
    console.log('3. Restart your dev server');
    console.log('\n📘 See FIREBASE_FINAL_SETUP.md for help\n');
}
