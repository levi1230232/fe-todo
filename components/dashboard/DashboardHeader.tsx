"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  isLoggingOut: boolean;
  onLogout: () => void;
}

export function DashboardHeader({
  userName,
  isLoggingOut,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ready to conquer the day, {userName}! 👋
        </h1>
      </div>

      <Button
        variant="destructive"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? "Log out..." : "Logout"}
      </Button>
    </div>
  );
}
