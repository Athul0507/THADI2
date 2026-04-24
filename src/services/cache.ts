import AsyncStorage from '@react-native-async-storage/async-storage';

export type CachedWeight = {
  weight: number;
  createdAt: number;
};

export type CachedProfile = {
  userId: string;
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  createdAt: number;
};

const weightsKey = (uid: string) => `thadi2:weights:${uid}`;
const syncKey = (uid: string) => `thadi2:weights:lastSync:${uid}`;
const profileKey = (uid: string) => `thadi2:profile:${uid}`;

export const getCachedWeights = async (uid: string): Promise<CachedWeight[]> => {
  const raw = await AsyncStorage.getItem(weightsKey(uid));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CachedWeight[];
  } catch {
    return [];
  }
};

export const setCachedWeights = async (uid: string, weights: CachedWeight[], lastSync: number) => {
  await AsyncStorage.setItem(weightsKey(uid), JSON.stringify(weights));
  await AsyncStorage.setItem(syncKey(uid), String(lastSync));
};

export const appendCachedWeights = async (
  uid: string,
  weights: CachedWeight[],
  lastSync: number
) => {
  const existing = await getCachedWeights(uid);
  const merged = [...existing, ...weights].sort((a, b) => a.createdAt - b.createdAt);
  await setCachedWeights(uid, merged, lastSync);
  return merged;
};

export const getLastSync = async (uid: string): Promise<number | null> => {
  const raw = await AsyncStorage.getItem(syncKey(uid));
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getCachedProfile = async (uid: string): Promise<CachedProfile | null> => {
  const raw = await AsyncStorage.getItem(profileKey(uid));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedProfile;
  } catch {
    return null;
  }
};

export const setCachedProfile = async (uid: string, profile: CachedProfile) => {
  await AsyncStorage.setItem(profileKey(uid), JSON.stringify(profile));
};
