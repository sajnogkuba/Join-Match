export const NotificationType = {
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_REJECTED: 'FRIEND_REQUEST_REJECTED',
  EVENT_INVITE: 'EVENT_INVITE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  TEAM_REQUEST: 'TEAM_REQUEST',
  TEAM_REQUEST_ACCEPTED: 'TEAM_REQUEST_ACCEPTED',
  TEAM_REQUEST_REJECTED: 'TEAM_REQUEST_REJECTED',
  TEAM_LEFT: 'TEAM_LEFT',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  TEAM_CANCELED: 'TEAM_CANCELED'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationData {
  senderId?: number;
  senderName?: string;
  requestId?: number;
  teamId?: number;
  teamRequestId?: number;
  leaderId?: number;
  userId?: number;
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
