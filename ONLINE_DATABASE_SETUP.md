# Word Glitch - Online Database & Leaderboard Setup Guide

## 🚀 Quick Start (Firebase Implementation)

### Step 1: Install Dependencies
```bash
npm install firebase
```

### Step 2: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name it "Word Glitch"
4. Enable Google Analytics (optional)
5. Create project

### Step 3: Enable Services
In Firebase Console:
1. **Authentication** → Get Started → Enable "Email/Password" and "Anonymous"
2. **Firestore Database** → Create Database → Start in production mode
3. **Firestore Rules** → Update rules (see below)

### Step 4: Get Firebase Config
1. Project Settings → General → Your apps
2. Click Web icon (</>) → Register app
3. Copy the firebaseConfig object

### Step 5: Create Environment File
Create `.env.local` in project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📁 Database Structure

### Firestore Collections:

```
users/
  {userId}/
    - username: string
    - email: string (optional)
    - walletAddress: string (optional)
    - createdAt: timestamp
    - lastActive: timestamp
    
    progress/
      - currentLevel: number
      - highestLevel: number
      - totalScore: number
      - totalWordsFound: number
      - levelsCompleted: number
      - achievements: array
      - unlockedLevels: array
      
    sessions/
      {sessionId}/
        - level: number
        - score: number
        - wordsFound: number
        - accuracy: number
        - timestamp: timestamp

leaderboard/
  global/
    - userId: string
    - username: string
    - totalScore: number
    - highestLevel: number
    - lastUpdated: timestamp
    - rank: number (calculated)
```

---

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      
      match /progress/{document=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      match /sessions/{document=**} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Leaderboard - everyone can read, only authenticated users can write their own entry
    match /leaderboard/{entry} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 🎮 Features Enabled

### ✅ After Implementation:
1. **User Authentication**
   - Email/password signup
   - Anonymous play (converts to account later)
   - Wallet connection (Web3)

2. **Progress Sync**
   - Auto-save every level completion
   - Resume from any device
   - Never lose progress

3. **Global Leaderboard**
   - Real-time rankings
   - Filter by timeframe (daily/weekly/all-time)
   - Friend leaderboards

4. **Advanced Features**
   - Achievement tracking
   - Session history
   - Statistics dashboard
   - Multiplayer potential (future)

---

## 📊 Migration Strategy

### Phase 1: Add Firebase (No Breaking Changes)
- Install Firebase
- Create dual-save system (localStorage + Firebase)
- Users keep playing normally

### Phase 2: Add Authentication
- Add login/signup UI
- Allow anonymous → account conversion
- Migrate localStorage data on first login

### Phase 3: Full Migration
- Prioritize Firebase as primary storage
- Keep localStorage as backup/offline mode
- Add sync conflict resolution

---

## 💰 Cost Estimate

### Firebase Free Tier (Generous):
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10GB storage, 360MB/day transfer

**Expected Usage** (1000 active users):
- ~5K writes/day (level completions)
- ~20K reads/day (leaderboard views)
- **Cost: $0/month** (well within free tier)

At 10K users: ~$5-10/month
At 100K users: ~$50-100/month

---

## 🔧 Implementation Files Needed

I'll create these files for you:
1. `src/lib/firebase/config.ts` - Firebase initialization
2. `src/lib/firebase/auth.ts` - Authentication helpers
3. `src/lib/firebase/database.ts` - Database operations
4. `src/lib/firebase/leaderboard.ts` - Leaderboard logic
5. `src/hooks/useAuth.ts` - Authentication hook
6. `src/hooks/useSync.ts` - Auto-sync hook
7. `src/components/Auth/LoginModal.tsx` - Login UI
8. `src/components/Leaderboard/GlobalLeaderboard.tsx` - Leaderboard UI

---

## ⚡ Quick Implementation Checklist

- [ ] Install Firebase (`npm install firebase`)
- [ ] Create Firebase project
- [ ] Enable Authentication & Firestore
- [ ] Add environment variables
- [ ] Implement Firebase config
- [ ] Create authentication system
- [ ] Build database sync layer
- [ ] Add leaderboard UI
- [ ] Test migration from localStorage
- [ ] Deploy to production

**Estimated Total Time**: 4-6 hours for full implementation
