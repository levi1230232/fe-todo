"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data: user, isLoading } = useUser();

  const isAuthenticated = !!accessToken && !!user;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Checking status...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
