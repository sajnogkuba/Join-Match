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
  addMessages: (conversationId: number, msgs: ChatMessage[]) => void;
  clearMessages: (conversationId: number) => void;
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

export const ChatProvider: React.FC<ChatProviderProps> = ({ userId, userName, children }) => {
  const [messages, setMessages] = useState<Record<number, ChatMessage[]>>({});
  const { stompClient, isConnected } = useChatWebSocket();
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  // 🧹 czyści wiadomości danej rozmowy
  const clearMessages = useCallback((conversationId: number) => {
    setMessages(prev => ({ ...prev, [conversationId]: [] }));
  }, []);

  // 📦 dodaje całą tablicę wiadomości (z bazy)
  const addMessages = useCallback((conversationId: number, msgs: ChatMessage[]) => {
    setMessages(prev => ({ ...prev, [conversationId]: msgs }));
  }, []);

  // ➕ dodaje pojedynczą wiadomość (socket)
  const addMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages(prev => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }));

      setUnreadCounts(prev => {
        const isMine = userId != null && msg.senderId === userId;
        const isActive = activeConversationId === msg.conversationId;
        if (isMine || isActive) return prev;
        return { ...prev, [msg.conversationId]: (prev[msg.conversationId] || 0) + 1 };
      });
    },
    [userId, activeConversationId]
  );

  const sendMessage = useCallback(
    (conversationId: number, content: string) => {
      if (!stompClient || !isConnected || !userId || !userName) return;
      const payload = { conversationId, senderId: userId, senderName: userName, content };
      stompClient.publish({ destination: '/app/chat.sendMessage', body: JSON.stringify(payload) });
    },
    [stompClient, isConnected, userId, userName]
  );

  // ✅ po wejściu do rozmowy usuń licznik nieprzeczytanych
  const markConversationRead = useCallback((id: number) => {
    setUnreadCounts(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, []);

  const setActiveConversation = useCallback((id: number | null) => {
    setActiveConversationId(id);
    if (id != null) {
      setUnreadCounts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  }, []);

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        addMessage,
        addMessages,
        clearMessages,
        stompClient,
        isConnected,
        unreadCounts,
        totalUnreadCount,
        activeConversationId,
        setActiveConversation,
        markConversationRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
