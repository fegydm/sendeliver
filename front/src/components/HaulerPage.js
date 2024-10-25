// ./front/src/components/HaulerPage.js
import { useEffect, useState } from 'react';
import WebSocketService from '../services/websocket';

function HaulerPage() {
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    WebSocketService.onMessage('delivery_request', (data) => {
      setAvailableRequests(prev => [...prev, data]);
    });
  }, []);

  return (
    <div>
      <h1>Hauler Dashboard</h1>
      {/* komponenty pridáme neskôr */}
    </div>
  );
}

export default HaulerPage;  // pridaný export default