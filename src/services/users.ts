import { doc, getDoc, setDoc, updateDoc, Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { getCachedProfile, setCachedProfile } from './cache';
import { db } from './firebase';

export type UserProfile = {
  userId: string;
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  createdAt: number;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  const profile = {
    userId: uid,
    name: data.name ?? 'User',
    age: data.age ?? 0,
    height: data.height ?? 0,
    currentWeight: data.currentWeight ?? 0,
    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
  };
  await setCachedProfile(uid, profile);
  return profile;
};

export const createUserProfile = async (
  uid: string,
  payload: Omit<UserProfile, 'createdAt'>
) => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...payload,
    userId: uid,
    createdAt: Timestamp.now(),
  });
};

export const updateCurrentWeight = async (uid: string, weight: number) => {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { currentWeight: weight });
  const cached = await getCachedProfile(uid);
  if (cached) {
    await setCachedProfile(uid, {
      ...cached,
      currentWeight: weight,
    });
  }
};

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
};

export const getUsersByIds = async (ids: string[]): Promise<UserProfile[]> => {
  if (ids.length === 0) return [];
  const chunks = chunk(ids, 10);
  const results: UserProfile[] = [];

  for (const part of chunks) {
    const q = query(collection(db, 'users'), where('__name__', 'in', part));
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        userId: docSnap.id,
        name: data.name ?? 'User',
        age: data.age ?? 0,
        height: data.height ?? 0,
        currentWeight: data.currentWeight ?? 0,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
      });
    });
  }

  return results;
};
