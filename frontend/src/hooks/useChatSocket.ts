import { useEffect } from 'react';
import type { Client } from '@stomp/stompjs';

interface UseChatSocketProps {
  stompClient: Client | null;
  isConnected: boolean;
  conversationId: number | null;
  onNewMessage: (message: any) => void;
}

export const useChatSocket = ({
  stompClient,
  isConnected,
  conversationId,
  onNewMessage,
}: UseChatSocketProps) => {
  useEffect(() => {
    if (!stompClient || !isConnected || !conversationId) return;

    const subscription = stompClient.subscribe(
      `/topic/conversation/${conversationId}`,
      (message) => {
        try {
          const msg = JSON.parse(message.body);
          onNewMessage(msg);
        } catch (e) {
          console.error('JSON parse error for chat message', e);
        }
      }
    );

    return () => {
      try { subscription.unsubscribe(); } catch {}
    };
  }, [stompClient, isConnected, conversationId, onNewMessage]);
};
