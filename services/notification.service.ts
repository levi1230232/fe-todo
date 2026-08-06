import { api } from "@/lib/axios";

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean | string;
  type?: string;
  [key: string]: any;
}

export const NotificationService = {
  getAllNotification(params?: NotificationQuery) {
    return api.get("/notifications", { params });
  },

  getUnreadCount() {
    return api.get("/notifications/unread/count");
  },

  getNotificationById(id: number) {
    return api.get(`/notifications/${id}`);
  },

  markAsRead(id: number) {
    return api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.patch("/notifications/read-all");
  },

  deleteNotification(id: number) {
    return api.delete(`/notifications/${id}`);
  },

  deleteAllNotifications() {
    return api.delete("/notifications");
  },
};
