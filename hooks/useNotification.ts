import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NotificationService,
  NotificationQuery,
} from "@/services/notification.service";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,

  lists: () => [...NOTIFICATION_KEYS.all, "list"] as const,

  list: (query?: NotificationQuery) =>
    [...NOTIFICATION_KEYS.lists(), query] as const,

  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export const useNotifications = (query?: NotificationQuery) => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATION_KEYS.list(query),

    queryFn: async () => {
      const response = await NotificationService.getAllNotification(query);

      return response.data;
    },

    placeholderData: (previousData) => previousData,
  });

  const unreadCountQuery = useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),

    queryFn: async () => {
      const response = await NotificationService.getUnreadCount();

      return response.data.unread;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => NotificationService.markAsRead(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.all,
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.all,
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => NotificationService.deleteNotification(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.all,
      });
    },
  });

  const deleteAllNotificationsMutation = useMutation({
    mutationFn: () => NotificationService.deleteAllNotifications(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_KEYS.all,
      });
    },
  });

  return {
    notifications: notificationsQuery.data?.data ?? [],

    pagination: notificationsQuery.data?.pagination,

    unreadCount: unreadCountQuery.data ?? 0,

    isLoading: notificationsQuery.isLoading,

    isUnreadCountLoading: unreadCountQuery.isLoading,

    isError: notificationsQuery.isError,

    error: notificationsQuery.error,

    markAsRead: markAsReadMutation.mutate,

    markAllAsRead: markAllAsReadMutation.mutate,

    deleteNotification: deleteNotificationMutation.mutate,

    deleteAllNotifications: deleteAllNotificationsMutation.mutate,

    isMarkingRead: markAsReadMutation.isPending,

    isMarkingAllRead: markAllAsReadMutation.isPending,

    isDeleting: deleteNotificationMutation.isPending,
  };
};
