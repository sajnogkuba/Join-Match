import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useChatWebSocket = () => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
    const socket = new SockJS(`${baseUrl}/ws`);

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      debug: (msg) => console.log('💬 CHAT WS:', msg),
      onConnect: () => {
        console.log('✅ Chat WebSocket connected');
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('🔌 Chat WebSocket disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error', frame);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
      setStompClient(null);
      setIsConnected(false);
    };
  }, []);

  return { stompClient, isConnected };
};
