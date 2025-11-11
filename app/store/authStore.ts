import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string | null, userId: string | null, email?: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      isAuthenticated: false,
      setAuth: (token, userId, email) => {
        set({
          token,
          userId,
          email: email || null,
          isAuthenticated: !!userId, // Sadece userId varsa authenticated sayılır
        });
      },
      logout: () => {
        set({
          token: null,
          userId: null,
          email: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

