/*
File: ./front/src/components/shared/admin/NotificationCenter.tsx
Last change: Separate file and fixed isAdmin check
*/
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import './NotificationCenter.css';

interface Notification {
  id: string;
  type: 'new_message' | 'status_update';
  data: any;
  timestamp: string;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!token || !isAdmin) return;

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//` +
                  `${window.location.host}/ws?token=${token}`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => console.log('WebSocket connection established');

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'notification') {
          const { payload } = message;
          const id = `${payload.type}_${Date.now()}`;
          const notif: Notification = {
            id,
            type: payload.type,
            data: payload.data,
            timestamp: payload.timestamp,
            read: false
          };
          setNotifications(prev => [notif, ...prev]);
          setUnreadCount(prev => prev + 1);

          if (Notification.permission === 'granted') {
            const title = payload.type === 'new_message'
              ? 'New Contact Message'
              : 'New Notification';
            const body = payload.type === 'new_message'
              ? `From: ${payload.data.name} - ${payload.data.subject}`
              : '';
            new Notification(title, { body });
          }
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    };

    newSocket.onerror = (err) => console.error('WebSocket error:', err);
    newSocket.onclose = () => console.log('WebSocket connection closed');

    setSocket(newSocket);
    if (Notification.permission === 'default') Notification.requestPermission();

    return () => { newSocket.close(); };
  }, [token, isAdmin]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const togglePanel = () => setIsOpen(open => !open);

  const handleClick = (n: Notification) => {
    markAsRead(n.id);
    if (n.type === 'new_message') {
      window.location.href = `/admin/messages/${n.data.id}`;
    }
  };

  const formatTime = (ts: string) => {
    const then = new Date(ts).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)} minute${diff>120?'s':''} ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hour${diff>7200?'s':''} ago`;
    return `${Math.floor(diff/86400)} day${diff>172800?'s':''} ago`;
  };

  return (
    <div className="notification-center">
      <button onClick={togglePanel} className="notification-bell" aria-label="Notifications">
        {/* bell icon */}
        {unreadCount>0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {isOpen && (
        <div className="notification-panel">
          <header>
            <h3>Notifications</h3>
            {notifications.length>0 && <button onClick={markAllAsRead}>Mark all as read</button>}
          </header>
          <div>
            {notifications.length===0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={n.read?'notification-item read':'notification-item unread'} onClick={() => handleClick(n)}>
                  {/* icon & content */}
                  <div>
                    <strong>{n.type==='new_message'?'New contact message':'Notification'}</strong>
                    <div>{n.type==='new_message'&&`From: ${n.data.name}`}</div>
                    <small>{formatTime(n.timestamp)}</small>
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

export default NotificationCenter;