import type { QuizAttempt } from "./useQuizStorage";

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  createdAt: number;
  lastActive: number;
  attempt: QuizAttempt | null;
}

const PROFILES_KEY = "mls_app_profiles";
const ACTIVE_KEY = "mls_active_profile_id";

/* ---------- helpers ---------- */

function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

function saveActiveId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

/* ---------- public API ---------- */

export function getAllProfiles(): UserProfile[] {
  return loadProfiles();
}

export function getActiveProfile(): UserProfile | null {
  const id = loadActiveId();
  if (!id) return null;
  const profiles = loadProfiles();
  return profiles.find((p) => p.id === id) ?? null;
}

export function createProfile(name: string, avatar: string, color: string): UserProfile {
  const profile: UserProfile = {
    id: crypto.randomUUID?.() ?? Date.now().toString(36),
    name,
    avatar,
    color,
    createdAt: Date.now(),
    lastActive: Date.now(),
    attempt: null,
  };
  const profiles = loadProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  saveActiveId(profile.id);
  return profile;
}

export function deleteProfile(id: string): void {
  let profiles = loadProfiles();
  profiles = profiles.filter((p) => p.id !== id);
  saveProfiles(profiles);
  const activeId = loadActiveId();
  if (activeId === id) {
    saveActiveId(null);
  }
}

export function setActiveProfileId(id: string | null): void {
  saveActiveId(id);
}

export function updateProfileAttempt(profileId: string, attempt: QuizAttempt): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return;
  profiles[idx] = { ...profiles[idx], attempt, lastActive: Date.now() };
  saveProfiles(profiles);
}

export function touchProfileLastActive(profileId: string): void {
  const profiles = loadProfiles();
  const idx = profiles.findIndex((p) => p.id === profileId);
  if (idx === -1) return;
  profiles[idx].lastActive = Date.now();
  saveProfiles(profiles);
}

export function clearOldStorageKeys(): void {
  const keys = ["active_quiz_attempt_v2", "active_quiz_attempt"];
  keys.forEach((k) => localStorage.removeItem(k));
}
