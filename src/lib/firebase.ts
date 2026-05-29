/**
 * Mock Firebase implementation to maintain app functionality 
 * after the user declined Firebase setup.
 */

const listeners: Set<(user: any) => void> = new Set();

const notifyListeners = (user: any) => {
  listeners.forEach(cb => cb(user));
};

export const auth = {
  currentUser: (() => {
    const storedUser = localStorage.getItem('rewise_user');
    return storedUser ? JSON.parse(storedUser) : null;
  })(),
  onAuthStateChanged: (arg1: any, arg2?: any) => {
    const callback = typeof arg1 === 'function' ? arg1 : arg2;
    if (typeof callback === 'function') {
      listeners.add(callback);
      callback(auth.currentUser);
    }
    return () => {
      if (typeof callback === 'function') {
        listeners.delete(callback);
      }
    };
  },
};

export const db = {}; // Mock db

export const signInWithPopup = async (_auth: any, _provider: any) => {
  const mockUser = {
    uid: 'mock-user-123',
    displayName: 'ReWise User',
    email: 'user@example.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ReWise',
  };
  auth.currentUser = mockUser;
  localStorage.setItem('rewise_user', JSON.stringify(mockUser));
  notifyListeners(mockUser);
  return { user: mockUser };
};

export const signInWithEmailAndPassword = async (_auth: any, email: string, pass: string) => {
  const usersJson = localStorage.getItem('rewise_users_db');
  const users = usersJson ? JSON.parse(usersJson) : [];
  
  const user = users.find((u: any) => u.email === email && u.password === pass);
  
  if (!user) {
    throw new Error('User not registered or invalid credentials.');
  }

  const authenticatedUser = { 
    uid: user.uid, 
    email: user.email, 
    displayName: user.displayName || user.email.split('@')[0] 
  };
  
  auth.currentUser = authenticatedUser;
  localStorage.setItem('rewise_user', JSON.stringify(authenticatedUser));
  notifyListeners(authenticatedUser);
  return { user: authenticatedUser };
};

export const createUserWithEmailAndPassword = async (_auth: any, email: string, pass: string) => {
  const usersJson = localStorage.getItem('rewise_users_db');
  const users = usersJson ? JSON.parse(usersJson) : [];
  
  if (users.find((u: any) => u.email === email)) {
    throw new Error('User already exists. Please login.');
  }

  const newUser = { 
    uid: 'mock-' + Date.now(), 
    email, 
    password: pass,
    displayName: email.split('@')[0] 
  };
  
  users.push(newUser);
  localStorage.setItem('rewise_users_db', JSON.stringify(users));

  const authenticatedUser = { 
    uid: newUser.uid, 
    email: newUser.email, 
    displayName: newUser.displayName 
  };
  
  auth.currentUser = authenticatedUser;
  localStorage.setItem('rewise_user', JSON.stringify(authenticatedUser));
  notifyListeners(authenticatedUser);
  return { user: authenticatedUser };
};

export const updateProfile = async (targetUser: any, profile: any) => {
  // Update currently logged in user
  const stored = localStorage.getItem('rewise_user');
  if (stored) {
    const user = JSON.parse(stored);
    user.displayName = profile.displayName;
    auth.currentUser = user;
    localStorage.setItem('rewise_user', JSON.stringify(user));
    
    // Also update in the "DB"
    const usersJson = localStorage.getItem('rewise_users_db');
    if (usersJson) {
      const users = JSON.parse(usersJson);
      const dbUserIndex = users.findIndex((u: any) => u.uid === user.uid);
      if (dbUserIndex !== -1) {
        users[dbUserIndex].displayName = profile.displayName;
        localStorage.setItem('rewise_users_db', JSON.stringify(users));
      }
    }
    
    notifyListeners(user);
  }
};

export const signOut = async (_auth: any) => {
  auth.currentUser = null;
  localStorage.removeItem('rewise_user');
  notifyListeners(null);
};

export const GoogleAuthProvider = class {};

export const onAuthStateChanged = (authInstance: any, callback: any) => {
  return auth.onAuthStateChanged(authInstance, callback);
};
