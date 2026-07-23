import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { QuizAttempt } from "../hooks/useQuizStorage";
import type { UserProfile } from "../hooks/useProfileStorage";
import {
  getAllProfiles,
  getActiveProfile,
  createProfile,
  deleteProfile,
  setActiveProfileId,
  updateProfileAttempt,
  touchProfileLastActive,
  clearOldStorageKeys,
} from "../hooks/useProfileStorage";

interface ProfileContextValue {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  selectProfile: (id: string) => void;
  addProfile: (name: string, avatar: string, color: string) => UserProfile;
  removeProfile: (id: string) => void;
  updateAttempt: (attempt: QuizAttempt) => void;
  touchActive: () => void;
  logout: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => getAllProfiles());
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(() => getActiveProfile());
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    // Clear old session keys once on mount
    clearOldStorageKeys();
    setInitialised(true);
  }, []);

  // Re-read from localStorage when document is focused (cross-tab sync)
  useEffect(() => {
    const sync = () => {
      setProfiles(getAllProfiles());
      setActiveProfile(getActiveProfile());
    };
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const selectProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    setActiveProfile(getActiveProfile());
    setProfiles(getAllProfiles());
  }, []);

  const addProfile = useCallback((name: string, avatar: string, color: string) => {
    const profile = createProfile(name, avatar, color);
    setProfiles(getAllProfiles());
    setActiveProfile(profile);
    return profile;
  }, []);

  const removeProfile = useCallback((id: string) => {
    deleteProfile(id);
    const remaining = getAllProfiles();
    setProfiles(remaining);
    const active = getActiveProfile();
    setActiveProfile(active);
  }, []);

  const updateAttempt = useCallback((attempt: QuizAttempt) => {
    const id = getActiveProfile()?.id;
    if (!id) return;
    updateProfileAttempt(id, attempt);
    setProfiles(getAllProfiles());
    setActiveProfile(getActiveProfile());
  }, []);

  const touchActive = useCallback(() => {
    const id = getActiveProfile()?.id;
    if (!id) return;
    touchProfileLastActive(id);
    setProfiles(getAllProfiles());
  }, []);

  const logout = useCallback(() => {
    setActiveProfileId(null);
    setActiveProfile(null);
    setProfiles(getAllProfiles());
  }, []);

  if (!initialised) {
    return null;
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        selectProfile,
        addProfile,
        removeProfile,
        updateAttempt,
        touchActive,
        logout,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}
