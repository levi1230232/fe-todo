import React from "react";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
  isOpen?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  isOpen = false,
}) => {
  const displayCount = count > 99 ? "99+" : count;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full p-2.5 transition-all duration-200 cursor-pointer ${
        isOpen
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Bell className="h-5 w-5" />

      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex items-center justify-center">
          <span className="bg-destructive absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {displayCount}
          </span>
        </span>
      )}
    </div>
  );
};
