import type { QuizAttempt } from "./useQuizStorage";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: number;
  lastActive: number;
  attempt: QuizAttempt | null;
}

const PROFILES_COLLECTION = "profiles";
const ACTIVE_KEY = "mls_active_profile_id";

/* ---------- localStorage helpers (active ID only) ---------- */

function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveActiveId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

/* ---------- Firestore helpers ---------- */

function profileDoc(id: string) {
  return doc(db, PROFILES_COLLECTION, id);
}

function profileData(profile: UserProfile): Record<string, unknown> {
  return {
    name: profile.name,
    avatar: profile.avatar,
    color: profile.color,
    createdAt: profile.createdAt,
    lastActive: profile.lastActive,
    attempt: profile.attempt,
  };
}

function parseDoc(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    name: data.name as string,
    avatar: data.avatar as string,
    color: data.color as string,
    createdAt: (data.createdAt as number) ?? Date.now(),
    lastActive: (data.lastActive as number) ?? Date.now(),
    attempt: (data.attempt as QuizAttempt) ?? null,
  };
}

/* ---------- Public API ---------- */

export function subscribeProfiles(
  onProfiles: (profiles: UserProfile[]) => void
): Unsubscribe {
  const col = collection(db, PROFILES_COLLECTION);
  return onSnapshot(col, (snapshot) => {
    const profiles: UserProfile[] = [];
    snapshot.forEach((snap) => {
      profiles.push(parseDoc(snap.id, snap.data() as Record<string, unknown>));
    });
    profiles.sort((a, b) => b.lastActive - a.lastActive);
    onProfiles(profiles);
  });
}

export async function fetchProfilesOnce(): Promise<UserProfile[]> {
  const col = collection(db, PROFILES_COLLECTION);
  const snapshot = await getDocs(col);
  const profiles: UserProfile[] = [];
  snapshot.forEach((snap) => {
    profiles.push(parseDoc(snap.id, snap.data() as Record<string, unknown>));
  });
  profiles.sort((a, b) => b.lastActive - a.lastActive);
  return profiles;
}

export async function fetchProfileOnce(
  id: string
): Promise<UserProfile | null> {
  const ref = profileDoc(id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return parseDoc(snap.id, snap.data() as Record<string, unknown>);
}

export async function createProfile(
  name: string,
  avatar: string,
  color: string
): Promise<UserProfile> {
  const id = crypto.randomUUID?.() ?? Date.now().toString(36);
  const now = Date.now();
  const profile: UserProfile = {
    id,
    name,
    avatar,
    color,
    createdAt: now,
    lastActive: now,
    attempt: null,
  };
  await setDoc(profileDoc(id), profileData(profile));
  saveActiveId(id);
  return profile;
}

export async function deleteProfile(id: string): Promise<void> {
  await deleteDoc(profileDoc(id));
  const activeId = loadActiveId();
  if (activeId === id) {
    saveActiveId(null);
  }
}

export function setActiveProfileId(id: string | null): void {
  saveActiveId(id);
}

export async function updateProfileAttempt(
  profileId: string,
  attempt: QuizAttempt
): Promise<void> {
  const ref = profileDoc(profileId);
  await setDoc(ref, { attempt, lastActive: Date.now() }, { merge: true });
}

export async function touchProfileLastActive(
  profileId: string
): Promise<void> {
  const ref = profileDoc(profileId);
  await setDoc(ref, { lastActive: Date.now() }, { merge: true });
}

export function clearOldStorageKeys(): void {
  const keys = ["active_quiz_attempt_v2", "active_quiz_attempt"];
  keys.forEach((k) => localStorage.removeItem(k));
}
