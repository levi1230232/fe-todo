import React from "react";
import {
  X,
  Calendar,
  Trash2,
  UserPlus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format, isValid, parseISO, formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { Notification } from "./NotificationItem";

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
  onDelete: (id: number) => void;
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

export const NotificationDetailModal: React.FC<
  NotificationDetailModalProps
> = ({ notification, onClose, onDelete }) => {
  if (!notification) return null;

  const formattedFullDate = (dateString: string) => {
    if (!dateString) return "";
    const date = parseISO(dateString);
    return isValid(date)
      ? format(date, "HH:mm - dd/MM/yyyy", { locale: vi })
      : dateString;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border bg-background p-6 shadow-xl transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="rounded-xl border bg-muted/40 p-2.5">
            {getNotificationIcon(notification.type)}
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {notification.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedFullDate(notification.createdAt)}</span>
              <span>•</span>
              <span>{formatNotificationTime(notification.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
          {notification.content}
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <button
            type="button"
            onClick={() => {
              onDelete(notification.id);
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete notification
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
