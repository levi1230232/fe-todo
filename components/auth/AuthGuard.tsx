"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const { data: user, isLoading, isError } = useUser();

  const isUnauthorized = hasHydrated && (!accessToken || isError);

  useEffect(() => {
    if (hasHydrated && isUnauthorized && !isLoading) {
      router.replace("/login");
    }
  }, [hasHydrated, isUnauthorized, isLoading, router]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Authenticating...</p>
      </div>
    );
  }

  if (isUnauthorized || !user) {
    return null;
  }

  return <>{children}</>;
}
