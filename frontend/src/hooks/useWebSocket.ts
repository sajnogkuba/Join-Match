import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { setDisconnectWebSocket } from '../Api/axios';

interface UseWebSocketReturn {
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  stompClient: Client | null;
}

export const useWebSocket = (userId: number | null): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!userId || isConnected) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
      const socket = new SockJS(`${baseUrl}/ws`);
      
      const stompClient = new Client({
        webSocketFactory: () => socket,
        debug: () => {},
        onConnect: () => {
          setIsConnected(true);
          reconnectAttempts.current = 0;
          
          stompClient.subscribe(`/user/${userId}/queue/notifications`, (message) => {
            const notification = JSON.parse(message.body);
            window.dispatchEvent(new CustomEvent('websocket-notification', { 
              detail: notification 
            }));
          });
        },
        onStompError: (error) => {
          console.error('WebSocket connection error:', error);
          setIsConnected(false);
          
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, delay);
          }
        }
      });
      
      stompClient.activate();
      stompClientRef.current = stompClient;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [userId, isConnected]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (stompClientRef.current && isConnected) {
      stompClientRef.current.deactivate().then(() => {
        setIsConnected(false);
      });
    }
    
    stompClientRef.current = null;
    reconnectAttempts.current = 0;
  }, [isConnected]);

  useEffect(() => {
    setDisconnectWebSocket(disconnect);

    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
      setDisconnectWebSocket(() => {});
    };
  }, [userId, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    stompClient: stompClientRef.current
  };
};
