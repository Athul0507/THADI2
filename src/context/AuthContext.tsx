import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile, UserProfile } from '../services/users';
import { signOut as firebaseSignOut } from '../services/auth';
import { addWeight } from '../services/weights';
import { getCachedProfile, setCachedProfile } from '../services/cache';

export type OnboardingPayload = {
  name: string;
  age: number;
  height: number;
  currentWeight: number;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!auth.currentUser) {
      setProfile(null);
      return;
    }
    try {
      const fetched = await getUserProfile(auth.currentUser.uid);
      setProfile(fetched);
    } catch (error) {
      console.warn('Unable to refresh profile', error);
      const cached = await getCachedProfile(auth.currentUser.uid);
      setProfile(cached);
    }
  };

  useEffect(() => {
    let active = true;

    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);

      if (!next) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const load = async () => {
        const cached = await getCachedProfile(next.uid);
        if (active && cached) {
          setProfile(cached);
        }

        if (active) {
          setLoading(false);
        }

        try {
          const fetched = await getUserProfile(next.uid);
          if (active) {
            setProfile(fetched);
          }
        } catch (error) {
          console.warn('Unable to load profile on startup', error);
          if (active && !cached) {
            setProfile(null);
          }
        }
      };

      void load();
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const completeOnboarding = async (payload: OnboardingPayload) => {
    if (!auth.currentUser) return;
    await createUserProfile(auth.currentUser.uid, {
      userId: auth.currentUser.uid,
      ...payload,
    });
    await addWeight(auth.currentUser.uid, payload.currentWeight);
    const fetched = await getUserProfile(auth.currentUser.uid);
    setProfile(fetched);
    if (fetched) {
      await setCachedProfile(auth.currentUser.uid, fetched);
    }
  };

  const signOut = async () => {
    await firebaseSignOut();
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      needsOnboarding: !!user && !profile,
      refreshProfile,
      completeOnboarding,
      signOut,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
