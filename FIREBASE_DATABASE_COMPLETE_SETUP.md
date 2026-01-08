# 🔥 Firebase Database Setup - Complete Guide

## ✅ Current Implementation Status

### **What's Already Set Up:**

1. ✅ **Firebase Configuration** - `.env.local` with credentials
2. ✅ **Database Service** - `database.ts` with CRUD operations
3. ✅ **Leaderboard Service** - `leaderboard.ts` with rankings
4. ✅ **Sync Hook** - `useFirebaseSync.ts` for real-time sync
5. ✅ **Profile Sync** - `profileSync.ts` for user profiles
6. ✅ **Auth Integration** - Firebase Authentication working

---

## 📊 Data Flow - How It Works

### **When Player Completes a Level:**

```
Player finishes level
    ↓
Score calculated locally
    ↓
Saved to local storage
    ↓
useFirebaseSync hook detects change
    ↓
syncProgressToFirebase() called
    ↓
┌──────────────────┬──────────────────┬──────────────────┐
│  Update Progress │  Update Profile  │  Update Leader   │
│  /users/{uid}/   │  /users/{uid}    │  /leaderboard/   │
│  progress/       │                  │  {uid}           │
│  current         │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘
    ↓
Firebase Firestore stores data
    ↓
Leaderboard queries updated data
    ↓
Menu displays top 10
```

---

## 🗄️ Firebase Collections Structure

### **1. `/users/{userId}` - User Profiles**

**Document Structure:**
```javascript
{
  username: "Omega Panda",
  email: "user@example.com",
  walletAddress: "0x...",
  profilePicture: "data:image/png;base64,...",
  createdAt: Timestamp,
  lastActive: Timestamp
}
```

**Functions:**
- `saveProfile(userId, profile)` - Save/update profile
- `loadProfile(userId)` - Load profile data

---

### **2. `/users/{userId}/progress/current` - Game Progress**

**Document Structure:**
```javascript
{
  currentLevel: 11,
  highestLevel: 11,
  totalScore: 1841,
  totalWordsFound: 150,
  levelsCompleted: 10,
  unlockedLevels: [1, 2, 3, ..., 11],
  achievements: ["first_word", "level_5", ...],
  lastUpdated: Timestamp
}
```

**Functions:**
- `saveProgress(userId, progress)` - Save progress
- `loadProgress(userId)` - Load progress

---

### **3. `/leaderboard/{userId}` - Global Rankings**

**Document Structure:**
```javascript
{
  userId: "bV8u3Mt3n0dvrKJgL0ra6PE1Orr2",
  username: "Omega Panda",
  profilePicture: "data:image/png;base64,...",
  totalScore: 1841,
  highestLevel: 11,
  totalTime: "37s",  // Optional
  lastUpdated: Timestamp
}
```

**Functions:**
- `updateLeaderboard(userId, username, score, level, picture)` - Update entry
- `getGlobalLeaderboard(limit)` - Get top N players
- `getUserRank(userId)` - Get user's rank

---

### **4. `/users/{userId}/sessions/{sessionId}` - Game Sessions**

**Document Structure:**
```javascript
{
  level: 5,
  score: 450,
  wordsFound: ["WORD", "GAME", ...],
  accuracy: 0.85,
  timestamp: Timestamp
}
```

**Functions:**
- `saveSession(userId, session)` - Save session
- `getRecentSessions(userId, limit)` - Get recent sessions

---

## 🔄 Automatic Sync Process

### **useFirebaseSync Hook:**

```typescript
const { user, isAuthenticated, syncProgress, saveSession } = useFirebaseSync();
```

**What it does:**
1. Listens for auth state changes
2. Initializes sync when user logs in
3. Syncs progress every 5 seconds
4. Updates leaderboard automatically
5. Saves sessions after each level

**Auto-Sync Triggers:**
- User logs in → Full sync
- Level completed → Progress sync
- Score changes → Leaderboard update
- Every 5 seconds → Status check

---

## 📝 How Data Gets Recorded

### **Step 1: Player Plays Game**
```typescript
// Game running, tracking score
const currentScore = calculateScore();
```

### **Step 2: Level Complete**
```typescript
// Save to local storage
saveProfile({
  totalScore: currentScore,
  currentLevel: level,
  highestLevel: Math.max(highestLevel, level)
});
```

### **Step 3: Auto-Sync to Firebase**
```typescript
// useFirebaseSync hook automatically calls:
await syncProgressToFirebase(progress);

// Which calls:
await saveProgress(userId, progress);
await updateLeaderboard(userId, username, totalScore, highestLevel, profilePicture);
```

### **Step 4: Leaderboard Updates**
```typescript
// Menu component queries:
const leaderboard = await getGlobalLeaderboard(10);
// Returns top 10 players with updated scores
```

---

## ✅ Verification Checklist

### **1. Check Firebase Configuration**
```bash
# Check .env.local file exists
ls .env.local

# Verify all variables are set
cat .env.local | grep NEXT_PUBLIC_FIREBASE
```

**Expected output:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

### **2. Check Firestore Security Rules**

**Go to Firebase Console:**
1. https://console.firebase.google.com
2. Select project: `wordglitch-d0c4a`
3. Firestore Database → Rules

**Required Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Leaderboard - PUBLIC READ (CRITICAL!)
    match /leaderboard/{userId} {
      allow read: if true;  // ← Must be public
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User profiles - Private
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Progress subcollection
      match /progress/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Sessions subcollection
      match /sessions/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

**Click "Publish" to save!**

---

### **3. Test Data Recording**

**Open Browser Console (F12) and check for:**

```javascript
// When you log in:
✅ Firebase sync initialized

// When you complete a level:
🔄 Syncing progress to Firebase...
✅ Progress synced successfully

// When leaderboard loads:
📊 Loading menu leaderboard...
🔍 Fetching top 10 from leaderboard...
📊 Found X leaderboard entries
✅ Leaderboard entries: [...]
```

---

### **4. Verify in Firebase Console**

**Check Collections:**

1. **Users Collection:**
   - Go to Firestore Database
   - Open `users` collection
   - Should see your user ID
   - Click to see profile data

2. **Progress Subcollection:**
   - Open your user document
   - Click `progress` subcollection
   - Open `current` document
   - Should see: currentLevel, totalScore, etc.

3. **Leaderboard Collection:**
   - Go back to root
   - Open `leaderboard` collection
   - Should see your user ID
   - Should have: username, totalScore, highestLevel

---

## 🚨 Common Issues & Fixes

### **Issue 1: "Missing or insufficient permissions"**

**Cause:** Firestore rules not set up correctly

**Fix:**
1. Go to Firebase Console
2. Firestore Database → Rules
3. Add leaderboard rule: `allow read: if true;`
4. Click Publish
5. Reload game

---

### **Issue 2: "No data showing in leaderboard"**

**Cause:** No data in Firestore yet

**Fix:**
1. Play a level to completion
2. Check console for sync messages
3. Verify data in Firebase Console
4. Refresh leaderboard

---

### **Issue 3: "Data not syncing"**

**Cause:** Firebase not initialized or auth issue

**Fix:**
1. Check console for errors
2. Verify user is logged in
3. Check `.env.local` configuration
4. Restart dev server

---

## 🔍 Manual Testing Steps

### **Test 1: Profile Creation**
1. Sign up/login
2. Check Firebase Console → `users` collection
3. Should see your user document

### **Test 2: Score Recording**
1. Play and complete a level
2. Check console for sync messages
3. Check Firebase Console → `users/{uid}/progress/current`
4. Should see updated totalScore

### **Test 3: Leaderboard Update**
1. Complete a level
2. Wait 5 seconds for sync
3. Check Firebase Console → `leaderboard/{uid}`
4. Should see your entry with score

### **Test 4: Leaderboard Display**
1. Reload menu page
2. Check console for leaderboard logs
3. Should see your entry in top 10
4. Click "VIEW FULL LEADERBOARD"
5. Should see same data

---

## 📊 Data Retention

**Local Storage:**
- Immediate save after each action
- Persists across sessions
- Syncs to Firebase when online

**Firebase:**
- Permanent storage
- Accessible from any device
- Real-time updates across clients

**Sync Strategy:**
- Local-first (fast)
- Background sync to Firebase
- Conflict resolution: Firebase wins

---

## ✅ Everything Should Work If:

1. ✅ `.env.local` has all Firebase credentials
2. ✅ Firestore rules published (especially leaderboard public read)
3. ✅ User is authenticated
4. ✅ Dev server is running
5. ✅ No console errors

---

## 🎯 Quick Verification Command

**Check if everything is set up:**
```bash
# Run the verification script
node verify-firebase-database.js
```

**Expected output:**
```
✅ All configuration keys present
✅ Firebase initialized successfully
✅ Firestore connection successful
📊 Found X leaderboard entries
✅ Firebase Database Setup Complete!
```

---

**Everything is implemented and ready! Just need to ensure Firestore rules are published.** 🔥✨
