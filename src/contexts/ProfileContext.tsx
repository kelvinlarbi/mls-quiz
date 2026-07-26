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
  subscribeProfiles,
  fetchProfileOnce,
  createProfile as fbCreateProfile,
  deleteProfile as fbDeleteProfile,
  setActiveProfileId,
  updateProfileAttempt,
  touchProfileLastActive,
  clearOldStorageKeys,
} from "../hooks/useProfileStorage";

interface ProfileContextValue {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  selectProfile: (id: string) => void;
  addProfile: (name: string, avatar: string, color: string) => Promise<void>;
  removeProfile: (id: string) => void;
  updateAttempt: (attempt: QuizAttempt) => void;
  touchActive: () => void;
  logout: () => void;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeProfiles((all) => {
      setProfiles(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Resolve active profile from localStorage ID whenever profiles change
  useEffect(() => {
    const activeId = localStorage.getItem("mls_active_profile_id");
    if (!activeId || profiles.length === 0) {
      if (!activeId) setActiveProfile(null);
      return;
    }
    const match = profiles.find((p) => p.id === activeId);
    if (match) {
      setActiveProfile(match);
    } else {
      // Profile was deleted remotely; clear the stored ID
      setActiveProfileId(null);
      setActiveProfile(null);
    }
  }, [profiles]);

  const selectProfile = useCallback(
    (id: string) => {
      setActiveProfileId(id);
      const match = profiles.find((p) => p.id === id);
      setActiveProfile(match ?? null);
    },
    [profiles]
  );

  const addProfile = useCallback(
    async (name: string, avatar: string, color: string) => {
      const profile = await fbCreateProfile(name, avatar, color);
      // Optimistically set active so navigation works immediately
      setActiveProfile(profile);
    },
    []
  );

  const removeProfile = useCallback(
    async (id: string) => {
      await fbDeleteProfile(id);
      // Firestore snapshot handles state cleanup
    },
    []
  );

  const updateAttempt = useCallback(
    async (attempt: QuizAttempt) => {
      const id = activeProfile?.id;
      if (!id) return;
      await updateProfileAttempt(id, attempt);
      // Snapshot picks up changes
    },
    [activeProfile]
  );

  const touchActive = useCallback(async () => {
    const id = activeProfile?.id;
    if (!id) return;
    await touchProfileLastActive(id);
  }, [activeProfile]);

  const logout = useCallback(() => {
    setActiveProfileId(null);
    setActiveProfile(null);
  }, []);

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
        loading,
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
