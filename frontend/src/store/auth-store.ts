import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('detective_token', token);
      localStorage.setItem('detective_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('detective_token');
      localStorage.removeItem('detective_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('detective_user', JSON.stringify(user));
    }
    set({ user });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('detective_token');
      const userStr = localStorage.getItem('detective_user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
