// ./front/src/components/HaulerPage.js
import { useEffect, useState } from 'react';
import WebSocketService from '../services/websocket';

function HaulerPage() {
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    // Počúvaj na nové delivery requesty
    WebSocketService.onMessage('delivery_request', (data) => {
      setAvailableRequests(prev => [...prev, data]);
    });
  }, []);

  const sendOffer = (requestId, offerData) => {
    WebSocketService.sendDeliveryOffer(requestId, {
      price: offerData.price,
      estimatedTime: offerData.estimatedTime,
      // ... ďalšie údaje
    });
  };

  return (
    <div>
      {/* UI komponenty */}
    </div>
  );
}