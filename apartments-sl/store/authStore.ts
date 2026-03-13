import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserRole = "RENTER" | "LANDLORD";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
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

// Shared helper — always fetches only the columns we care about
async function loadProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, phone, role, avatar_url")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,

      signIn: async (email, password) => {
        set({ isLoading: true });
        const supabase = createClient();
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            if (
              error.message.toLowerCase().includes("email not confirmed") ||
              error.message.toLowerCase().includes("invalid login")
            ) {
              throw new Error(
                "Email not confirmed. Please check your inbox and click the confirmation link, then try again.",
              );
            }
            throw error;
          }

          let profile = await loadProfile(supabase, data.user.id);

          // Self-healing: if the trigger didn't create the profile row, create it now
          if (!profile) {
            const meta = data.user.user_metadata ?? {};
            const role: UserRole =
              meta.role === "LANDLORD" ? "LANDLORD" : "RENTER";
            const full_name: string =
              meta.full_name ?? email.split("@")[0] ?? "User";

            await supabase.from("users").upsert(
              { id: data.user.id, email, full_name, role },
              { onConflict: "id" },
            );

            if (role === "LANDLORD") {
              await supabase
                .from("landlord_profiles")
                .upsert({ user_id: data.user.id }, { onConflict: "user_id" });
            }

            profile = await loadProfile(supabase, data.user.id);
          }

          if (!profile) {
            // Still null — RLS is blocking the read. Sign out cleanly.
            await supabase.auth.signOut();
            set({ user: null, profile: null, isLoading: false });
            throw new Error(
              "Could not load your account. Please ensure the database migrations have been applied (see README), then try again.",
            );
          }

          set({ user: data.user, profile, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signUp: async (email, password, fullName, role) => {
        set({ isLoading: true });
        const supabase = createClient();
        try {
          // Pass full_name and role as user metadata so the database trigger
          // (004_auth_trigger.sql) can create the profile row automatically.
          // This works even if email confirmation is enabled because the
          // trigger fires on auth.users INSERT, before any session exists.
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role } },
          });
          if (error) throw error;
          if (!data.user) throw new Error("Signup failed — no user returned");

          // If there is no session the user must confirm their email first.
          if (!data.session) {
            set({ isLoading: false });
            throw new Error("__EMAIL_CONFIRMATION_REQUIRED__");
          }

          // Session exists: either email confirmation is disabled, or the user
          // already confirmed.  Load the profile (trigger should have created
          // it; fall back to a direct insert just in case).
          let profile = await loadProfile(supabase, data.user.id);
          if (!profile) {
            await supabase
              .from("users")
              .insert({ id: data.user.id, email, full_name: fullName, role })
              .single();
            if (role === "LANDLORD") {
              await supabase
                .from("landlord_profiles")
                .insert({ user_id: data.user.id });
            }
            profile = await loadProfile(supabase, data.user.id);
          }

          set({ user: data.user, profile, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signOut: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, profile: null, isLoading: false });
      },

      refreshProfile: async () => {
        set({ isLoading: true });
        const supabase = createClient();
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            set({ user: null, profile: null, isLoading: false });
            return;
          }
          const profile = await loadProfile(supabase, user.id);
          set({ user, profile, isLoading: false });
        } catch {
          set({ user: null, profile: null, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage-v3",
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    },
  ),
);

// Needed so AuthProvider can set state without triggering a re-render cycle
export { useAuthStore as authStore };
