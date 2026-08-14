"use client";

import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useSuspenseQuery({
    queryKey: ["auth", "refresh"],
    queryFn: async () => {
      try {
        const res = await authService.refresh();
        setAccessToken(res.data.accessToken);
        return res.data;
      } catch (err) {
        clearAuth();
        return null; 
      }
    },
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return <>{children}</>;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <AuthInitializer>{children}</AuthInitializer>
    </Suspense>
  );
}