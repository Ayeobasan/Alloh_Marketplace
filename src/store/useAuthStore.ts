import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole;
  activeRole: UserRole; // Current operating mode in two-sided marketplace
  isAuthenticated: boolean;
  isInitialized: boolean;
  savedDemandIds: string[];
  
  // Actions
  setCredentials: (credentials: { user: User; accessToken: string; refreshToken: string }) => void;
  updateUser: (user: Partial<User>) => void;
  setRole: (role: UserRole) => void;
  clearCredentials: () => void;
  setInitialized: (initialized: boolean) => void;
  toggleSaveDemand: (demandId: string) => void;
}

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
      savedDemandIds: [],

      setCredentials: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken,
          role: user.role || 'buyer',
          activeRole: user.role || 'buyer',
          isAuthenticated: true,
        }),

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

      clearCredentials: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: 'buyer',
          activeRole: 'buyer',
          isAuthenticated: false,
          savedDemandIds: [],
        }),

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      toggleSaveDemand: (demandId) => set((state) => {
        const isSaved = state.savedDemandIds.includes(demandId);
        return {
          savedDemandIds: isSaved 
            ? state.savedDemandIds.filter(id => id !== demandId)
            : [...state.savedDemandIds, demandId]
        };
      }),
    }),
    {
      name: 'alloh-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
        }
      },
    }
  )
);
