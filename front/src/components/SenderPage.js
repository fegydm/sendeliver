// ./front/src/components/SenderPage.js
import { useEffect, useState } from 'react';
import WebSocketService from '../services/websocket';

function SenderPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    WebSocketService.onMessage('delivery_offer', (data) => {
      setRequests(prev => [...prev, data]);
    });
  }, []);

  return (
    <div>
      <h1>Sender Dashboard</h1>
      {/* komponenty pridáme neskôr */}
    </div>
  );
}

export default SenderPage;  // pridaný export default