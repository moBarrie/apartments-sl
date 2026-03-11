"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        // Fires once on page load with whatever session exists.
        if (session?.user) {
          // Restore profile from DB (e.g. after a page refresh).
          useAuthStore.getState().refreshProfile();
        } else {
          // No active session — stop the loading spinner immediately.
          useAuthStore.setState({
            user: null,
            profile: null,
            isLoading: false,
          });
        }
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null, profile: null, isLoading: false });
      } else if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        useAuthStore.getState().refreshProfile();
      }
      // SIGNED_IN is deliberately ignored —
      // signIn() and signUp() already set user + profile themselves.
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
