// File: front/src/contexts/WebSocketContext.tsx
// Last action: Created a robust, centralized WebSocket provider for the entire app.

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './auth.context';

interface WebSocketContextType {
  lastMessage: any | null;
  sendMessage: (type: string, payload: any) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) socket.close();
      return;
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("Central WebSocket: Connected");
    ws.onmessage = (event) => setLastMessage(JSON.parse(event.data));
    ws.onclose = () => console.log("Central WebSocket: Disconnected");
    ws.onerror = (error) => console.error("Central WebSocket Error:", error);

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [isAuthenticated, token]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    }
  }, [socket]);

  const value = {
    lastMessage,
    sendMessage,
    isConnected: socket?.readyState === WebSocket.OPEN,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};