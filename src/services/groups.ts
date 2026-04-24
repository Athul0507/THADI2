import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type Group = {
  id: string;
  groupName: string;
  inviteLink?: string;
  inviteCode?: string;
  users: string[];
};

const mapGroup = (id: string, data: any): Group => ({
  id,
  groupName: data.groupName ?? data.groupNAme ?? 'Group',
  inviteLink: data.inviteLink,
  inviteCode: data.inviteCode ?? id,
  users: Array.isArray(data.users) ? data.users : [],
});

const groupsRef = collection(db, 'groups');

const createInviteLink = (groupId: string) => `thadi2://join?groupId=${groupId}`;

const parseInviteInput = (value: string) => {
  const raw = value.trim();
  if (!raw) {
    return '';
  }

  if (!raw.includes('://')) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    return parsed.searchParams.get('groupId') ?? parsed.pathname.replace(/\//g, '') ?? raw;
  } catch {
    return raw;
  }
};

export const getUserGroups = async (uid: string): Promise<Group[]> => {
  const q = query(groupsRef, where('users', 'array-contains', uid));
  const snap = await getDocs(q);
  return snap.docs.map((docSnap) => mapGroup(docSnap.id, docSnap.data()));
};

export const getGroupById = async (groupId: string): Promise<Group | null> => {
  const ref = doc(db, 'groups', groupId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return mapGroup(snap.id, snap.data());
};

export const createGroup = async (uid: string, groupName: string): Promise<Group> => {
  const trimmedName = groupName.trim();
  if (!trimmedName) {
    throw new Error('Enter a group name to create your squad.');
  }

  const ref = doc(groupsRef);
  const inviteCode = ref.id;
  const payload = {
    groupName: trimmedName,
    inviteCode,
    inviteLink: createInviteLink(inviteCode),
    users: [uid],
    createdBy: uid,
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, payload);
  return mapGroup(ref.id, payload);
};

export const joinGroupByInvite = async (uid: string, inviteInput: string): Promise<Group> => {
  const inviteCode = parseInviteInput(inviteInput);
  if (!inviteCode) {
    throw new Error('Paste an invite code or link to join a group.');
  }

  const directDoc = await getDoc(doc(db, 'groups', inviteCode));
  if (directDoc.exists()) {
    const group = mapGroup(directDoc.id, directDoc.data());
    if (!group.users.includes(uid)) {
      await updateDoc(directDoc.ref, { users: arrayUnion(uid) });
      group.users = [...group.users, uid];
    }
    return group;
  }

  const inviteQuery = query(groupsRef, where('inviteCode', '==', inviteCode));
  const inviteSnap = await getDocs(inviteQuery);
  const first = inviteSnap.docs[0];

  if (!first) {
    throw new Error('That invite link does not match any group yet.');
  }

  const group = mapGroup(first.id, first.data());
  if (!group.users.includes(uid)) {
    await updateDoc(first.ref, { users: arrayUnion(uid) });
    group.users = [...group.users, uid];
  }
  return group;
};
