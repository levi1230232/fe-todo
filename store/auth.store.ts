import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  _hasHydrated: boolean;

  setAccessToken: (token: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      _hasHydrated: false,

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      clearAuth: () => {
        set({
          accessToken: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({}),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
