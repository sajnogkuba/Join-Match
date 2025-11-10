import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Client } from '@stomp/stompjs';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

export interface ChatMessage {
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  createdAt: string;
}

interface ChatContextType {
  messages: Record<number, ChatMessage[]>;
  sendMessage: (conversationId: number, content: string) => void;
  addMessage: (msg: ChatMessage) => void;
  stompClient: Client | null;
  isConnected: boolean;
  unreadCounts: Record<number, number>;
  totalUnreadCount: number;
  activeConversationId: number | null;
  setActiveConversation: (id: number | null) => void;
  markConversationRead: (id: number) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};

interface ChatProviderProps {
  userId: number | null;
  userName: string | null;
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  userId,
  userName,
  children,
}) => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const { stompClient, isConnected } = useChatWebSocket();
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  const sendMessage = useCallback(
    (conversationId: number, content: string) => {
      if (!stompClient) {
        console.warn('❌ brak stompClient (jeszcze się łączy?)');
        return;
      }
      if (!isConnected) {
        console.warn('❌ WebSocket niepołączony');
        return;
      }
      if (!userId || !userName) {
        console.warn('❌ Brak danych użytkownika (userId/userName)');
        return;
      }

      const payload = { conversationId, senderId: userId, senderName: userName, content };
      console.log('➡️ publish /app/chat.sendMessage', payload);
      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(payload),
      });
    },
    [stompClient, isConnected, userId, userName]
  );

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => ({
      ...prev,
      [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
    }));

    setUnreadCounts(prev => {
      const isMine = userId != null && msg.senderId === userId;
      const isActive = activeConversationId === msg.conversationId;
      if (isMine || isActive) return prev;
      const current = prev[msg.conversationId] || 0;
      return { ...prev, [msg.conversationId]: current + 1 };
    });
  }, [userId, activeConversationId]);

  const markConversationRead = useCallback((id: number) => {
    setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
  }, []);

  const setActiveConversation = useCallback((id: number | null) => {
    setActiveConversationId(id);
    if (id != null) {
      setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
    }
  }, []);

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        addMessage,
        stompClient,
        isConnected,
        unreadCounts,
        totalUnreadCount,
        activeConversationId,
        setActiveConversation,
        markConversationRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
