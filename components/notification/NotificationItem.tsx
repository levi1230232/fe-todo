import React, { useState } from "react";
import {
  CheckCircle,
  UserPlus,
  MessageSquare,
  Clock,
  AlertCircle,
  Check,
  Trash2,
  X,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";
import { enUS, uk, vi } from "date-fns/locale";

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: "ASSIGNED" | "COMMENT" | "DEADLINE" | "STATUS_CHANGED" | string;
  isRead: boolean;
  createdAt: string;
  taskId?: number;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClick?: (notification: Notification) => void;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  ASSIGNED: <UserPlus className="h-5 w-5 text-blue-500" />,
  COMMENT: <MessageSquare className="h-5 w-5 text-green-500" />,
  DEADLINE: <Clock className="h-5 w-5 text-amber-500" />,
  STATUS_CHANGED: <CheckCircle className="h-5 w-5 text-purple-500" />,
};

const getNotificationIcon = (type: string) => {
  return (
    NOTIFICATION_ICONS[type] || (
      <AlertCircle className="h-5 w-5 text-gray-500" />
    )
  );
};

const formatNotificationTime = (dateString: string) => {
  if (!dateString) return "";
  const date =
    typeof dateString === "string"
      ? parseISO(dateString)
      : new Date(dateString);

  if (!isValid(date)) return "";

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: enUS,
  });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const { id, title, content, type, isRead, createdAt } = notification;

  const handleItemClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isRead
          ? "border-transparent bg-background hover:bg-muted/50"
          : "border-primary/20 bg-primary/5 shadow-xs hover:bg-primary/10"
      }`}
    >
      <div className="mt-0.5 shrink-0 rounded-lg border bg-background p-2 shadow-xs">
        {getNotificationIcon(type)}
      </div>

      <div className="min-w-0 flex-1 pr-16 sm:pr-12">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm ${
              isRead
                ? "font-medium text-foreground/80"
                : "font-semibold text-foreground"
            }`}
          >
            {title}
          </p>
          {!isRead && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {content}
        </p>
        <span className="mt-1.5 block text-[11px] text-muted-foreground/70">
          {formatNotificationTime(createdAt)}
        </span>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-md border bg-background/90 p-1 shadow-xs backdrop-blur-xs transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {!isRead && (
          <button
            type="button"
            title="Mark as Read"
            aria-label="Mark as Read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(id);
            }}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          title="Delete notification"
          aria-label="Delete notification"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
