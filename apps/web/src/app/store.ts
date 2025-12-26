import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  sessionId: string;
  setSessionId: (id: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  currentPreviewUrl: string | undefined;
  setCurrentPreviewUrl: (url: string | undefined) => void;
  user: { id: number; email: string; preferredGenres?: number[] } | null;
  token: string | null;
  setAuth: (user: { id: number; email: string; preferredGenres?: number[] } | null, token: string | null) => void;
  setUser: (user: { id: number; email: string; preferredGenres?: number[] } | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => {
      return {
        sessionId: '', // Start empty, will be set via hydration or effect
        setSessionId: (id) => set({ sessionId: id }),
        isMuted: false,
        setIsMuted: (muted) => set({ isMuted: muted }),
        currentIndex: 0,
        setCurrentIndex: (index) => set({ currentIndex: index }),
        currentPreviewUrl: undefined,
        setCurrentPreviewUrl: (url) => set({ currentPreviewUrl: url }),
        user: null,
        token: null,
        setAuth: (user, token) => set({ user, token }),
        setUser: (user) => set({ user }),
        logout: () => set({ user: null, token: null }),
      };
    },
    {
      name: 'swipesound-storage',
    }
  )
);

