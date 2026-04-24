import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { appendCachedWeights, getCachedWeights, getLastSync, setCachedWeights } from './cache';
import { updateCurrentWeight } from './users';

export type WeightEntry = {
  weight: number;
  createdAt: number;
};

const weightsRef = (uid: string) => collection(db, 'users', uid, 'weights');

const mapWeight = (data: any): WeightEntry => ({
  weight: data.weight ?? 0,
  createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
});

export const fetchAllWeights = async (uid: string): Promise<WeightEntry[]> => {
  const q = query(weightsRef(uid), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => mapWeight(docSnap.data()));
};

export const syncWeights = async (uid: string): Promise<WeightEntry[]> => {
  const lastSync = await getLastSync(uid);
  if (!lastSync) {
    const all = await fetchAllWeights(uid);
    const newest = all.length > 0 ? all[all.length - 1].createdAt : Date.now();
    await setCachedWeights(uid, all, newest);
    return all;
  }

  const q = query(
    weightsRef(uid),
    where('createdAt', '>', Timestamp.fromMillis(lastSync)),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  const fresh = snap.docs.map((docSnap) => mapWeight(docSnap.data()));
  if (fresh.length === 0) {
    return getCachedWeights(uid);
  }
  const newest = fresh[fresh.length - 1].createdAt;
  return appendCachedWeights(uid, fresh, newest);
};

export const addWeight = async (uid: string, weight: number): Promise<WeightEntry> => {
  const createdAt = Timestamp.now();
  await addDoc(weightsRef(uid), { weight, createdAt });
  await updateCurrentWeight(uid, weight);
  const entry = { weight, createdAt: createdAt.toMillis() };
  await appendCachedWeights(uid, [entry], entry.createdAt);
  return entry;
};

export const fetchRecentWeights = async (uid: string, count = 7): Promise<WeightEntry[]> => {
  const q = query(weightsRef(uid), orderBy('createdAt', 'desc'), limit(count));
  const snap = await getDocs(q);
  const entries = snap.docs.map((docSnap) => mapWeight(docSnap.data()));
  return entries.reverse();
};
