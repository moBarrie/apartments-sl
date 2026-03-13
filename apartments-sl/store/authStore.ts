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
            const msg = error.message.toLowerCase();
            if (msg.includes("email not confirmed")) {
              throw new Error(
                "Your email address has not been confirmed yet. Please check your inbox for a verification link.",
              );
            }
            if (msg.includes("invalid login")) {
              throw new Error("Invalid email or password. Please try again.");
            }
            throw error;
          }

          let { data: profile, error: fetchError } = await supabase
            .from("users")
            .select("id, email, full_name, phone, role, avatar_url")
            .eq("id", data.user.id)
            .single();

          // Self-healing: if the trigger didn't create the profile row, create it now
          if (!profile) {
            const meta = data.user.user_metadata ?? {};
            const role: UserRole =
              meta.role === "LANDLORD" ? "LANDLORD" : "RENTER";
            const full_name: string =
              meta.full_name ?? email.split("@")[0] ?? "User";

            const { error: upsertError } = await supabase.from("users").upsert(
              { id: data.user.id, email, full_name, role },
              { onConflict: "id" },
            );

            if (upsertError) {
              await supabase.auth.signOut();
              set({ user: null, profile: null, isLoading: false });
              throw new Error(
                `Database error: ${upsertError.message}. Did you run the 'fix_auth_only.sql' script in Supabase?`,
              );
            }

            // Try fetching one last time
            const { data: finalProfile, error: finalError } = await supabase
              .from("users")
              .select("id, email, full_name, phone, role, avatar_url")
              .eq("id", data.user.id)
              .single();

            if (!finalProfile) {
              await supabase.auth.signOut();
              set({ user: null, profile: null, isLoading: false });
              throw new Error(
                `Profile load failed: ${finalError?.message || "Unknown error"}. Please check your database RLS policies.`,
              );
            }
            profile = finalProfile;
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
          // it; fall back to a direct upsert just in case).
          let { data: profile } = await supabase
            .from("users")
            .select("id, email, full_name, role")
            .eq("id", data.user.id)
            .single();

          if (!profile) {
            await supabase.from("users").upsert(
              { id: data.user.id, email, full_name: fullName, role },
              { onConflict: "id" },
            );

            if (role === "LANDLORD") {
              await supabase
                .from("landlord_profiles")
                .upsert({ user_id: data.user.id }, { onConflict: "user_id" });
            }

            const { data: finalProfile } = await supabase
              .from("users")
              .select("id, email, full_name, role")
              .eq("id", data.user.id)
              .single();
            profile = finalProfile;
          }

          set({ user: data.user, profile: profile as any, isLoading: false });

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
