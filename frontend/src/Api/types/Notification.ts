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
  TEAM_CANCELED: 'TEAM_CANCELED',
  POST_COMMENT: 'POST_COMMENT',
  POST_REACTION: 'POST_REACTION',
  COMMENT_REACTION: 'COMMENT_REACTION',
  COMMENT_REPLY: 'COMMENT_REPLY',
  EVENT_JOIN_REQUEST: 'EVENT_JOIN_REQUEST',
  EVENT_JOIN_ACCEPTED: 'EVENT_JOIN_ACCEPTED',
  EVENT_JOIN_REJECTED: 'EVENT_JOIN_REJECTED',
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
  postId?: number;
  commentId?: number;
  reactionTypeId?: number;
  eventId?: number;
  eventName?: string;
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
