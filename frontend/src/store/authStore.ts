import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: "RENTER" | "LANDLORD";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", { email, password });
          const { user, token } = response.data.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          // Set token in axios headers
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          toast.success("Welcome back!");
        } catch (error: any) {
          toast.error(error.response?.data?.error?.message || "Login failed");
          throw error;
        }
      },

      register: async (data) => {
        try {
          const response = await api.post("/auth/register", data);
          const { user, token } = response.data.data;

          set({
            user,
            token,
            isAuthenticated: true,
          });

          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          toast.success("Account created successfully!");
        } catch (error: any) {
          toast.error(
            error.response?.data?.error?.message || "Registration failed",
          );
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        delete api.defaults.headers.common["Authorization"];
        toast.success("Logged out successfully");
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
