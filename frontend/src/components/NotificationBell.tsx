import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, UserPlus, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../Context/NotificationContext';
import { NotificationType } from '../Api/types/Notification';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';

dayjs.locale('pl');

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotification();

  // Zamknij dropdown gdy klikniesz poza nim
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: any) => {
    // Oznacz jako przeczytane
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Zamknij dropdown
    setIsOpen(false);

    // Przekieruj na podstawie typu powiadomienia
    if (notification.type === NotificationType.FRIEND_REQUEST) {
      // Sprawdź czy jesteś już na stronie profile
      if (window.location.pathname === '/profile') {
        window.location.href = '/profile#pending-requests';
      } else {
        navigate('/profile#pending-requests');
      }
    } else if (notification.type === NotificationType.FRIEND_REQUEST_ACCEPTED || 
               notification.type === NotificationType.FRIEND_REQUEST_REJECTED) {
      // Sprawdź czy jesteś już na stronie profile
      if (window.location.pathname === '/profile') {
        window.location.href = '/profile#friends';
      } else {
        navigate('/profile#friends');
      }
    } else if (
      notification.type === NotificationType.TEAM_REQUEST ||
      notification.type === NotificationType.TEAM_REQUEST_ACCEPTED ||
      notification.type === NotificationType.TEAM_REQUEST_REJECTED ||
      notification.type === NotificationType.TEAM_LEFT
    ) {
      // Nawigacja do konkretnej drużyny
      if (notification.data?.teamId) {
        navigate(`/team/${notification.data.teamId}`);
      }
    }
  };

  const formatTime = (createdAt: string | number[]) => {
    
    let notificationTime;
    
    // Sprawdź czy data przychodzi jako tablica (format LocalDateTime z Java)
    if (Array.isArray(createdAt)) {
      // Konwertuj tablicę [year, month, day, hour, minute, second, nano] na Date
      const [year, month, day, hour, minute, second] = createdAt;
      notificationTime = dayjs(new Date(year, month - 1, day, hour, minute, second));
    } else {
      notificationTime = dayjs(createdAt);
    }
    
    if (!notificationTime.isValid()) {
      console.error('Invalid date:', createdAt);
      return 'Nieznana data';
    }
    
    const now = dayjs();
    
    if (now.diff(notificationTime, 'minute') < 1) {
      return 'Teraz';
    } else if (now.diff(notificationTime, 'hour') < 1) {
      return `${now.diff(notificationTime, 'minute')} min temu`;
    } else if (now.diff(notificationTime, 'day') < 1) {
      return `${now.diff(notificationTime, 'hour')} godz. temu`;
    } else {
      return notificationTime.format('DD.MM.YYYY HH:mm');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
        return <UserPlus size={16} className="text-violet-400" />;
      case NotificationType.FRIEND_REQUEST_ACCEPTED:
        return <UserPlus size={16} className="text-green-400" />;
      case NotificationType.FRIEND_REQUEST_REJECTED:
        return <UserPlus size={16} className="text-red-400" />;
      case NotificationType.TEAM_REQUEST:
        return <Users size={16} className="text-violet-400" />;
      case NotificationType.TEAM_REQUEST_ACCEPTED:
        return <Users size={16} className="text-green-400" />;
      case NotificationType.TEAM_REQUEST_REJECTED:
        return <Users size={16} className="text-red-400" />;
      case NotificationType.TEAM_LEFT:
        return <Users size={16} className="text-amber-400" />;
      default:
        return <Bell size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ikona dzwonka */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
        title="Powiadomienia"
      >
        <Bell size={20} className="text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold">Powiadomienia</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X size={16} className="text-zinc-400" />
            </button>
          </div>

          {/* Lista powiadomień */}
          <div className="max-h-80 overflow-y-auto dark-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={32} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-400 text-sm">Brak powiadomień</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors ${
                    !notification.isRead ? 'bg-zinc-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock size={12} />
                        <span>{formatTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
