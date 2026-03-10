"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return <>{children}</>;
}
