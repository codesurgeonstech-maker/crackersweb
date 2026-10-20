import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInUser,
  signOutUser,
  resetUserPassword,
  subscribeToAuth,
  getUserProfile
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial cached user session
    const stored = localStorage.getItem('crackzo_active_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCurrentUser({ uid: parsed.uid, email: parsed.email });
        setUserProfile(parsed);
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }

    const unsubscribe = subscribeToAuth(async (user, profile) => {
      if (user) {
        setCurrentUser(user);
        setUserProfile(profile);
      } else {
        const storedActive = localStorage.getItem('crackzo_active_user');
        if (!storedActive) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { user, profile } = await signInUser(email, password);
      setCurrentUser(user);
      setUserProfile(profile);
      return { user, profile };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => {
    return await resetUserPassword(email);
  };

  const isDeveloper = userProfile?.role === 'developer';
  const isShopOwner = userProfile?.role === 'owner';
  const shopId = userProfile?.shopId || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: userProfile?.role || null,
        shopId,
        isDeveloper,
        isShopOwner,
        login,
        logout,
        resetPassword,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
