import React, { useEffect, useState } from 'react';
import { useChat } from '../Context/ChatContext';
import { useChatSocket } from '../hooks/useChatSocket';
import api from '../Api/axios';
import { useAuth } from '../Context/authContext';
import { useLocation } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const myUserId = (user as any)?.id ?? null;

  const {
    messages,
    sendMessage,
    addMessage,
    stompClient,
    isConnected,
    setActiveConversation,
    markConversationRead
  } = useChat();

  const location = useLocation() as any;
  const state = (location && location.state) || {};

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState('');

  // Resolve conversation from navigation state
  useEffect(() => {
    const resolve = async () => {
      if (typeof state?.conversationId === 'number') {
        setConversationId(state.conversationId);
        return;
      }
      if (typeof state?.targetUserId === 'number' && myUserId != null) {
        try {
          // BACKEND oczekuje @RequestParam user1Id & user2Id
          const res = await api.post(
            '/conversations/direct',
            null,
            { params: { user1Id: myUserId, user2Id: state.targetUserId } }
          );
          const cid = res.data?.id || res.data?.conversationId;
          if (cid) setConversationId(cid);
        } catch (e) {
          console.error('Nie udało się utworzyć/odczytać rozmowy', e);
        }
      }
    };
    resolve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.conversationId, state?.targetUserId, myUserId]);

  // Subscribe to conversation messages
  useChatSocket({
    stompClient,
    isConnected,
    conversationId: conversationId ?? null,
    onNewMessage: (msg) => {
      addMessage({
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatarUrl: msg.senderAvatarUrl,
        content: msg.content,
        createdAt: Array.isArray(msg.createdAt)
          ? new Date(
              msg.createdAt[0],
              (msg.createdAt[1] || 1) - 1,
              msg.createdAt[2] || 1,
              msg.createdAt[3] || 0,
              msg.createdAt[4] || 0,
              msg.createdAt[5] || 0
            ).toISOString()
          : msg.createdAt
      });
    },
  });

  // Load history when conversation resolved
  useEffect(() => {
    const loadHistory = async () => {
      if (conversationId == null) return;
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        const list = res.data as any[];
        list.forEach(m => {
          addMessage({
            conversationId: m.conversationId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderAvatarUrl: m.senderAvatarUrl,
            content: m.content,
            createdAt: Array.isArray(m.createdAt)
              ? new Date(
                  m.createdAt[0],
                  (m.createdAt[1] || 1) - 1,
                  m.createdAt[2] || 1,
                  m.createdAt[3] || 0,
                  m.createdAt[4] || 0,
                  m.createdAt[5] || 0
                ).toISOString()
              : m.createdAt,
          });
        });
      } catch (e) {
        console.error('Błąd wczytywania historii czatu', e);
      }
    };

    loadHistory();
  }, [conversationId, addMessage]);

  // Manage active conversation and read state
  useEffect(() => {
    if (conversationId != null) {
      setActiveConversation(conversationId);
      markConversationRead(conversationId);
    }
    return () => {
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation, markConversationRead]);

  const handleSend = () => {
    if (input.trim() !== '' && conversationId != null) {
      sendMessage(conversationId, input);
      setInput('');
    }
  };

  const list = conversationId != null ? (messages[conversationId] || []) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-zinc-900 p-4 mt-20">
      <div className="text-xs text-zinc-500 mb-2">
        WS: {isConnected ? 'połączony' : 'rozłączony'} | conv: {conversationId ?? '—'} | user: {myUserId ?? '—'}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {list.map((m, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[70%] ${
              m.senderId === myUserId ? 'ml-auto bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-200'
            }`}
          >
            <div className="text-sm font-medium">{m.senderName}</div>
            <div className="text-sm">{m.content}</div>
          </div>
        ))}
        {conversationId == null && (
          <div className="text-zinc-400 text-sm">Wybierz użytkownika, aby rozpocząć rozmowę.</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none"
          placeholder="Napisz wiadomość..."
        />
        <button
          onClick={handleSend}
          className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-white"
          disabled={conversationId == null}
        >
          Wyślij
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
