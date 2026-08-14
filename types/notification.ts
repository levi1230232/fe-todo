export enum NotificationType {
  DEADLINE = "DEADLINE",
  ASSIGNED = "ASSIGNED",
  COMMENT = "COMMENT",
  STATUS_CHANGED = "STATUS_CHANGED",
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
