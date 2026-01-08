# 🔐 Profile & Authentication Integration - Implementation Guide

## ✅ What's Been Done

1. ✅ Logo sizing adjusted to be more uniform (48px height)
2. ✅ Created `profileSync.ts` service for Firebase/local profile linking
3. ✅ Updated sync service to include profile syncing

## ⚠️ Current Issues

The profile sync service has type mismatches because the existing `gameStorage.ts` uses `GameStats` instead of a separate profile type. We need to work with the existing structure.

## 🎯 How It Currently Works

### **Profile Storage (Local)**
- Profiles are stored in localStorage
- Each profile has: `id`, `name`, `createdAt`, `lastPlayed`, `walletAddress`
- Current profile ID is tracked separately

### **Firebase Authentication**
- Users can sign up with email/password
- Users can play anonymously
- Firebase stores: `userId`, `email`, `displayName`

## 🔧 What Needs To Be Fixed

### **1. Profile Name Linking**

When a user signs up or logs in:
1. Their email should be stored
2. Their display name should become their profile name
3. Profile should be linked to their Firebase UID

### **2. Sign Out Behavior**

When a user signs out:
1. Call Firebase `signOut()`
2. Clear the current profile selection
3. Return to menu (not profile screen)

### **3. Profile Persistence**

When a user logs back in:
1. Find profile linked to their Firebase UID
2. Load their stats, level, achievements
3. Sync with Firebase data

## 📝 Simple Implementation Steps

### **Step 1: Update MenuScreen to Handle Sign Out**

Add a sign out button that:
```typescript
const handleSignOut = async () => {
  // Import from profileSync
  const { signOutAndClearProfile } = await import('@/lib/firebase/profileSync');
  
  // Sign out
  await signOutAndClearProfile();
  
  // Refresh to show logged out state
  window.location.reload();
};
```

### **Step 2: Link Profile on Login**

In `AuthModal.tsx`, after successful login:
```typescript
// After signInWithEmail or signUpWithEmail
const user = getCurrentUser();
if (user) {
  // Find or create profile linked to this user
  const profiles = getAllProfiles();
  let linkedProfile = profiles.find(p => p.walletAddress === user.uid);
  
  if (!linkedProfile) {
    // Create new profile
    const profileId = createProfile(
      user.displayName || user.email?.split('@')[0] || 'Player',
      user.uid // Link to Firebase UID
    );
    setCurrentProfileId(profileId);
  } else {
    // Use existing profile
    setCurrentProfileId(linkedProfile.id);
  }
}
```

### **Step 3: Auto-Login on App Load**

In main app component:
```typescript
useEffect(() => {
  const user = getCurrentUser();
  if (user) {
    // User is logged in, find their profile
    const profiles = getAllProfiles();
    const linkedProfile = profiles.find(p => p.walletAddress === user.uid);
    
    if (linkedProfile) {
      setCurrentProfileId(linkedProfile.id);
    }
  }
}, []);
```

## 🎨 UI Updates Needed

### **MenuScreen Changes:**

1. **When Logged In:**
   - Show user's email/name
   - Show "Sign Out" button
   - Profile button shows their stats

2. **When Logged Out:**
   - Show "Login / Sign Up" button
   - Profile button shows local profiles

### **ProfileScreen Changes:**

1. **Add Sign Out Button:**
   ```tsx
   {isAuthenticated && (
     <button onClick={handleSignOut}>
       Sign Out
     </button>
   )}
   ```

2. **Show Linked Status:**
   ```tsx
   {isAuthenticated && (
     <div>
       Linked to: {user.email}
     </div>
   )}
   ```

## 🔄 Data Flow

```
User Signs Up/In
    ↓
Firebase Auth Creates User
    ↓
Check if profile exists with this UID
    ↓
┌─────────────────┬─────────────────┐
│  Profile Exists │  No Profile     │
│  Load & Use It  │  Create New One │
└─────────────────┴─────────────────┘
    ↓
Set as Current Profile
    ↓
Load Stats from Firebase
    ↓
Merge with Local Data
    ↓
✅ User is logged in with their profile
```

## 🚀 Quick Fix for Immediate Use

### **Minimal Working Solution:**

1. **In `useFirebaseSync.ts`**, add:
```typescript
// After user logs in
useEffect(() => {
  if (user && !user.isAnonymous) {
    // Link current profile to this user
    const profileId = getCurrentProfileId();
    if (profileId) {
      const profile = loadProfile(profileId);
      if (profile && !profile.walletAddress) {
        // Link profile to Firebase user
        saveProfile(profileId, {
          ...profile,
          walletAddress: user.uid
        });
      }
    }
  }
}, [user]);
```

2. **Add Sign Out Function:**
```typescript
const handleSignOut = async () => {
  await signOut(); // From firebase/auth
  window.location.reload();
};
```

## ✅ Testing Checklist

- [ ] Sign up with email creates profile
- [ ] Profile name matches email/display name
- [ ] Sign out clears authentication
- [ ] Sign in loads correct profile
- [ ] Stats persist across sessions
- [ ] Leaderboard shows correct username
- [ ] Profile screen shows linked email

## 📞 Next Steps

1. Fix type errors in `profileSync.ts`
2. Update `MenuScreen` with sign out button
3. Update `AuthModal` to link profiles on login
4. Test full authentication flow
5. Deploy!

---

**The core issue is that the existing codebase uses `GameStats` for profiles, but we need to work with `ProfileMetadata`. The solution is to use the existing `walletAddress` field to link profiles to Firebase UIDs.**
