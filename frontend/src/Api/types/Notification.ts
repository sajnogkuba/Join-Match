export const NotificationType = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_REJECTED: 'FRIEND_REQUEST_REJECTED',
  EVENT_INVITE: 'EVENT_INVITE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  EVENT_CANCELLED: 'EVENT_CANCELLED'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationData {
  senderId: number;
  senderName: string;
  requestId: number;
}

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string | number[];
}
