import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axiosInstance, { setDisconnectWebSocket } from '../Api/axios';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Notification } from '../Api/types/Notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => Promise<void>;
  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  disconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  userId: number | null;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { disconnect } = useWebSocket(userId);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/notifications/${userId}`);
      const notificationsData = response.data.map((notification: any) => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : undefined
      }));
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await axiosInstance.get(`/notifications/${userId}/unread-count`);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, [userId]);

  // Ładowanie powiadomień przy inicjalizacji
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [userId, loadNotifications, loadUnreadCount]);

  // Rejestracja funkcji disconnect w axios
  useEffect(() => {
    setDisconnectWebSocket(disconnect);
    return () => {
      setDisconnectWebSocket(() => {});
    };
  }, [disconnect]);

  // Obsługa WebSocket - dodawanie nowych powiadomień
  useEffect(() => {
    const handleWebSocketNotification = (event: CustomEvent) => {
      const notification = event.detail;
      // Parsuj data jeśli jest stringiem
      if (notification.data && typeof notification.data === 'string') {
        try {
          notification.data = JSON.parse(notification.data);
        } catch (e) {
          console.error('Error parsing notification data:', e);
        }
      }
      addNotification(notification);
    };

    window.addEventListener('websocket-notification', handleWebSocketNotification as EventListener);
    
    return () => {
      window.removeEventListener('websocket-notification', handleWebSocketNotification as EventListener);
    };
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    loadNotifications,
    loadUnreadCount,
    disconnect
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
