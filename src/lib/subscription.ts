import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export type SubscriptionTier = 'free' | 'rupees_50' | 'rupees_300';

export interface UserSubscription {
  tier: SubscriptionTier;
  scansUsed: number;
  chatsUsed: number;
  paymentMethod?: string;
  subscribedDate?: string;
  cardName?: string;
  cardNumber?: string;
}

const DEFAULT_SUB: UserSubscription = {
  tier: 'free',
  scansUsed: 0,
  chatsUsed: 0
};

// In-memory caching
let activeSubscription: UserSubscription = { ...DEFAULT_SUB };
const listeners: ((sub: UserSubscription) => void)[] = [];

// Helper to notify all listeners of subscription changes
const notifyListeners = () => {
  listeners.forEach(cb => cb({ ...activeSubscription }));
};

// Fetch current subscription for user or guest
const loadLocalBackup = (): UserSubscription => {
  try {
    const backup = localStorage.getItem('rewise_sub');
    if (backup) {
      return JSON.parse(backup);
    }
  } catch (err) {
    console.warn("Skipped local subscription backup read:", err);
  }
  return { ...DEFAULT_SUB };
};

const saveLocalBackup = (sub: UserSubscription) => {
  try {
    localStorage.setItem('rewise_sub', JSON.stringify(sub));
  } catch (err) {
    console.warn("Skipped local subscription backup write:", err);
  }
};

// Listen to Firebase Auth state to sync Firestore user subscriptions
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        activeSubscription = {
          tier: data.tier || 'free',
          scansUsed: typeof data.scansUsed === 'number' ? data.scansUsed : 0,
          chatsUsed: typeof data.chatsUsed === 'number' ? data.chatsUsed : 0,
          paymentMethod: data.paymentMethod || undefined,
          subscribedDate: data.subscribedDate || undefined,
          cardName: data.cardName || undefined,
          cardNumber: data.cardNumber || undefined
        };
      } else {
        // Create initial default subscription doc in Firestore
        await setDoc(userRef, { ...DEFAULT_SUB, email: user.email });
        activeSubscription = { ...DEFAULT_SUB };
      }
      saveLocalBackup(activeSubscription);
      notifyListeners();
    } catch (err) {
      console.warn("Firestore subscription load failed. Switched to offline backup:", err);
      activeSubscription = loadLocalBackup();
      notifyListeners();
    }

    // Set up direct real-time snapshot listener for direct feedback
    onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        activeSubscription = {
          tier: data.tier || 'free',
          scansUsed: typeof data.scansUsed === 'number' ? data.scansUsed : 0,
          chatsUsed: typeof data.chatsUsed === 'number' ? data.chatsUsed : 0,
          paymentMethod: data.paymentMethod || undefined,
          subscribedDate: data.subscribedDate || undefined,
          cardName: data.cardName || undefined,
          cardNumber: data.cardNumber || undefined
        };
        saveLocalBackup(activeSubscription);
        notifyListeners();
      }
    });

  } else {
    // Guest User state fallback
    activeSubscription = loadLocalBackup();
    notifyListeners();
  }
});

/**
 * Register state listener for subscription changes
 */
export function subscribeToSubscription(callback: (sub: UserSubscription) => void) {
  listeners.push(callback);
  // Immediate initial callback
  callback({ ...activeSubscription });
  
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) {
      listeners.splice(idx, 1);
    }
  };
}

/**
 * Get current active subscription state synchronously
 */
export function getSubscriptionState(): UserSubscription {
  return { ...activeSubscription };
}

/**
 * Update active user subscription tier following purchase protocol
 */
export async function purchaseSubscription(
  tier: SubscriptionTier, 
  paymentMethod: string, 
  cardName: string, 
  cardNumber: string
): Promise<UserSubscription> {
  const updated: UserSubscription = {
    ...activeSubscription,
    tier,
    paymentMethod,
    cardName,
    cardNumber: cardNumber ? `•••• •••• •••• ${cardNumber.slice(-4)}` : undefined,
    subscribedDate: new Date().toLocaleDateString()
  };

  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        tier,
        paymentMethod,
        cardName,
        cardNumber: updated.cardNumber,
        subscribedDate: updated.subscribedDate
      });
    } catch (err) {
      console.warn("Failed updating live Firestore. Defaulting to local simulation:", err);
    }
  }

  activeSubscription = updated;
  saveLocalBackup(updated);
  notifyListeners();
  return updated;
}

/**
 * Standard utility: check if a user is within subscription bounds for Scanning
 */
export function canScan(): boolean {
  if (activeSubscription.tier !== 'free') return true;
  return activeSubscription.scansUsed < 5;
}

/**
 * Record/increment scanning usage
 */
export async function recordScan(): Promise<number> {
  const nextCount = activeSubscription.scansUsed + 1;
  activeSubscription.scansUsed = nextCount;
  saveLocalBackup(activeSubscription);
  notifyListeners();

  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { scansUsed: nextCount });
    } catch (_) {}
  }
  return nextCount;
}

/**
 * Standard utility: check if a user is within subscription bounds for Chat AI
 */
export function canChat(): boolean {
  if (activeSubscription.tier !== 'free') return true;
  return activeSubscription.chatsUsed < 5;
}

/**
 * Record/increment Chatbot usage
 */
export async function recordChat(): Promise<number> {
  const nextCount = activeSubscription.chatsUsed + 1;
  activeSubscription.chatsUsed = nextCount;
  saveLocalBackup(activeSubscription);
  notifyListeners();

  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { chatsUsed: nextCount });
    } catch (_) {}
  }
  return nextCount;
}

/**
 * Reset usages (e.g. for demonstration or cancellation)
 */
export async function resetUsageLimits(): Promise<UserSubscription> {
  const resetSub: UserSubscription = {
    ...activeSubscription,
    tier: 'free',
    scansUsed: 0,
    chatsUsed: 0,
    paymentMethod: undefined,
    cardNumber: undefined,
    cardName: undefined,
    subscribedDate: undefined
  };

  const user = auth.currentUser;
  if (user) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        tier: 'free',
        scansUsed: 0,
        chatsUsed: 0
      }, { merge: true });
    } catch (_) {}
  }

  activeSubscription = resetSub;
  saveLocalBackup(resetSub);
  notifyListeners();
  return resetSub;
}
