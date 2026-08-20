import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  _hasHydrated: boolean;

  setAccessToken: (token: string | null) => void;
  setHasHydrated: (state: boolean) => void;
  clearAuth: () => void;
}

const customStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(name);
    }
  },
};

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
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
