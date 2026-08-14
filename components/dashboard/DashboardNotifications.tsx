"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Notification } from "@/types/notification";

interface DashboardNotificationsProps {
  notifications: Notification[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function DashboardNotifications({
  notifications,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: DashboardNotificationsProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "HH:mm dd/MM/yyyy") : null;
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-slate-100 rounded-lg text-sm space-y-1"
              >
                <p className="font-semibold text-slate-900 leading-snug">
                  {item.title}
                </p>
                <p className="text-slate-600 leading-relaxed break-words">
                  {item.content}
                </p>
                {item.createdAt && (
                  <span className="text-xs text-slate-400 block">
                    {formatDate(item.createdAt)}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">
              No new notifications.
            </p>
          )}
        </CardContent>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 pt-0 border-t border-slate-100 mt-2">
          <span className="text-xs text-slate-500">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.max(page - 1, 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.min(page + 1, totalPages))}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
