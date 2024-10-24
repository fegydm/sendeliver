// ./back/services/wsService.js
import { getCache, setCache } from '../config/redis.js';

export const handleMessage = async (ws, rawData) => {
  try {
    const data = JSON.parse(rawData);
    
    switch(data.type) {
      case 'subscribe':
        // Handle subscription
        break;
      case 'publish':
        // Handle publishing
        break;
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  } catch (err) {
    ws.send(JSON.stringify({ error: err.message }));
  }
};
