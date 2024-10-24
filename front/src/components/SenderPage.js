// ./front/src/components/SenderPage.js
import { useEffect, useState } from 'react';
import WebSocketService from '../services/websocket';

function SenderPage() {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    // Počúvaj na ponuky od dopravcov
    WebSocketService.onMessage('delivery_offer', (data) => {
      setOffers(prev => [...prev, data]);
    });
  }, []);

  const createDeliveryRequest = (requestData) => {
    WebSocketService.sendDeliveryRequest({
      pickup: requestData.pickup,
      delivery: requestData.delivery,
      cargo: requestData.cargo,
      // ... ďalšie údaje
    });
  };

  return (
    <div>
      {/* UI komponenty */}
    </div>
  );
}