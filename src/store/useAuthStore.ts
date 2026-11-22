import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';

// "Remember me" unchecked means the session should end when the browser closes.
// Such sessions are marked with a cookie that has no expiry: the browser drops it on
// close (and every tab shares it, unlike sessionStorage). If the marker is gone on the
// next load, the persisted session is discarded.
const SESSION_COOKIE = 'alloh_session';

const hasSessionCookie = () =>
  typeof document !== 'undefined' &&
  document.cookie.split('; ').some((c) => c.startsWith(`${SESSION_COOKIE}=`));

const setSessionCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`;
  }
};

const clearSessionCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
};

// Saved demands are stored per account so they survive logout (and the forced
// re-login on role switch) without showing up for the next person on the device.
const getUserKey = (user: User | null) => user?.id || user?.email || null;

const NO_SAVED_DEMANDS: string[] = [];

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole;
  activeRole: UserRole; // Current operating mode in two-sided marketplace
  isAuthenticated: boolean;
  isInitialized: boolean;
  rememberMe: boolean;
  savedDemandsByUser: Record<string, string[]>;

  // Actions
  setCredentials: (credentials: { user: User; accessToken: string; refreshToken: string; rememberMe?: boolean }) => void;
  updateUser: (user: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  clearCredentials: () => void;
  setInitialized: (initialized: boolean) => void;
  toggleSaveDemand: (demandId: string) => void;
  removeSavedDemands: (demandIds: string[]) => void;
}

// Shape persisted before version 1: a single saved list that logout wiped.
type PersistedStateV0 = Partial<AuthState> & { savedDemandIds?: string[] };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: 'buyer',
      activeRole: 'buyer',
      isAuthenticated: false,
      isInitialized: false,
      rememberMe: true,
      savedDemandsByUser: {},

      setCredentials: ({ user, accessToken, refreshToken, rememberMe = true }) => {
        if (rememberMe) {
          clearSessionCookie();
        } else {
          setSessionCookie();
        }
        set({
          user,
          accessToken,
          refreshToken,
          role: user.role || 'buyer',
          activeRole: user.role || 'buyer',
          isAuthenticated: true,
          rememberMe,
        });
      },

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      setRole: (role) =>
        set((state) => ({
          role,
          activeRole: role,
          user: state.user ? { ...state.user, role } : null,
        })),

      // Saved demands are deliberately kept: they're keyed by account.
      clearCredentials: () => {
        clearSessionCookie();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: 'buyer',
          activeRole: 'buyer',
          isAuthenticated: false,
          rememberMe: true,
        });
      },

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      toggleSaveDemand: (demandId) => set((state) => {
        const key = getUserKey(state.user);
        if (!key) return {};
        const current = state.savedDemandsByUser[key] ?? [];
        const next = current.includes(demandId)
          ? current.filter((id) => id !== demandId)
          : [...current, demandId];
        return { savedDemandsByUser: { ...state.savedDemandsByUser, [key]: next } };
      }),

      removeSavedDemands: (demandIds) => set((state) => {
        const key = getUserKey(state.user);
        if (!key) return {};
        const current = state.savedDemandsByUser[key] ?? [];
        return {
          savedDemandsByUser: {
            ...state.savedDemandsByUser,
            [key]: current.filter((id) => !demandIds.includes(id)),
          },
        };
      }),
    }),
    {
      name: 'alloh-auth-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as PersistedStateV0;
        if (version < 1) {
          const { savedDemandIds, ...rest } = state;
          const key = getUserKey(rest.user ?? null);
          return {
            ...rest,
            savedDemandsByUser: key && savedDemandIds?.length ? { [key]: savedDemandIds } : {},
          } as AuthState;
        }
        return state as AuthState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.isAuthenticated && !state.rememberMe && !hasSessionCookie()) {
          state.clearCredentials();
        }
        state.setInitialized(true);
      },
    }
  )
);

/** The current account's saved demand ids (stable reference, safe as a selector result). */
export const useSavedDemandIds = () =>
  useAuthStore((state) => {
    const key = getUserKey(state.user);
    return (key && state.savedDemandsByUser[key]) || NO_SAVED_DEMANDS;
  });
