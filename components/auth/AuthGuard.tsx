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
  const { data: user, isLoading, isError } = useUser();

  const isUnauthorized = !accessToken || isError;

  useEffect(() => {
    if (isUnauthorized && !isLoading) {
      router.replace("/login");
    }
  }, [isUnauthorized, isLoading, router]);

  if (isLoading || isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
