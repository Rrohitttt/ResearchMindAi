import { create } from "zustand";
import { authApi, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("rm_token", res.access_token);
    set({ user: res.user });
  },

  register: async (fullName, email, password) => {
    const res = await authApi.register(fullName, email, password);
    localStorage.setItem("rm_token", res.access_token);
    set({ user: res.user });
  },

  logout: () => {
    localStorage.removeItem("rm_token");
    set({ user: null });
  },

  hydrate: async () => {
    const token = localStorage.getItem("rm_token");
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem("rm_token");
      set({ user: null, isLoading: false });
    }
  },
}));
