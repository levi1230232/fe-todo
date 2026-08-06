"use client";

import React, { useState } from "react";
import { NotificationItem, Notification } from "./NotificationItem";
import { NotificationBadge } from "./NotificationBadge";
import { CheckCheck, Trash2, Loader2, BellOff } from "lucide-react";
import { useNotifications } from "@/hooks/useNotification";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NotificationPopoverProps {
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  onNotificationClick,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tab, setTab] = useState<"ALL" | "UNREAD">("ALL");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    isMarkingAllRead,
    isDeleting,
  } = useNotifications(tab === "UNREAD" ? { isRead: "false" } : undefined);

  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div>
          <NotificationBadge count={unreadCount} isOpen={isOpen} />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-4 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary font-medium rounded-full">
                {unreadCount} news
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isMarkingAllRead}
                onClick={() => markAllAsRead()}
                className="p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                title="Mark all as Read"
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <CheckCheck className="w-4 h-4 text-primary" />
                )}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteAllNotifications()}
                className="p-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                title="Clear all notifications"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b px-4 bg-muted/10 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab("ALL")}
            className={`py-2.5 border-b-2 transition-colors ${
              tab === "ALL"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setTab("UNREAD")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "UNREAD"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-border/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <BellOff className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">You have no notifications</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">
                {tab === "UNREAD"
                  ? "You've read all notifications."
                  : "Work updates will appear here."}
              </p>
            </div>
          ) : (
            notifications.map((item: Notification) => (
              <NotificationItem
                key={item.id}
                notification={item}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onClick={handleItemClick}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
