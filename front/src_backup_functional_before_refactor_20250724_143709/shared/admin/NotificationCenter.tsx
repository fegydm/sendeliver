// File: front/src/components/shared/admin/NotificationCenter.tsx
// Last action: Refactored to use the central WebSocketContext.

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import './NotificationCenter.css';

interface Notification {
  id: number;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { isAdmin } = useAuth();
  const { lastMessage } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (lastMessage && (lastMessage.type === 'new_contact_message' || lastMessage.type === 'new_user_registered')) {
      const newNotification: Notification = {
        id: Date.now(),
        type: lastMessage.type,
        message: lastMessage.payload.summary, // Backend pošle zjednodušenú správu
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  }, [lastMessage]);

  if (!isAdmin) return null;
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notification-center">
      <button onClick={() => setIsOpen(!isOpen)} className="notification-center__bell">
        🔔
        {unreadCount > 0 && <span className="notification-center__badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-center__panel">
          <h3>Notifikácie</h3>
          {notifications.length === 0 ? <p>Žiadne nové notifikácie.</p> : (
            notifications.map(n => (
              <div key={n.id} className={`notification-center__item ${n.read ? 'notification-center__item--read' : ''}`}>
                <p>{n.message}</p>
                <small>{n.timestamp.toLocaleTimeString('sk-SK')}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;