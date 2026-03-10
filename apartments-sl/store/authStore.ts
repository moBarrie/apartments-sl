import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserRole = "RENTER" | "LANDLORD" | "ADMIN";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  profile_picture: string | null;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,

      signIn: async (email, password) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        set({ user: data.user });

        // Fetch profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profile) {
          set({ profile, isLoading: false });
        }
      },

      signUp: async (email, password, fullName, role) => {
        const supabase = createClient();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("User creation failed");

        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role,
        });

        if (profileError) throw profileError;

        // Create landlord profile if needed
        if (role === "LANDLORD") {
          await supabase.from("landlord_profiles").insert({
            user_id: data.user.id,
            city: "Freetown",
          });
        }

        set({ user: data.user });
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, profile: null });
      },

      refreshProfile: async () => {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          set({ user: null, profile: null, isLoading: false });
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        set({ user, profile, isLoading: false });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
