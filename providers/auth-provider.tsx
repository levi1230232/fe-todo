// components/AuthProvider.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const { isLoading } = useQuery({
    queryKey: ["auth", "refresh"],
    queryFn: async () => {
      const res = await authService.refresh();
      setAccessToken(res.data.accessToken);
      return res.data;
    },
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  });

  if (isLoading) {
    return <div>Loading app...</div>;
  }

  return <>{children}</>;
}
