// ./back/services/wsService.js
import { getCache, setCache } from '../config/redis.js';

export const handleMessage = async (ws, rawData) => {
 try {
   const data = JSON.parse(rawData);
   console.log('Processing message:', data);
   
   switch(data.type) {
     case 'delivery_request':
       // Handler pre novú požiadavku na prepravu
       await handleDeliveryRequest(ws, data);
       break;
       
     case 'delivery_offer':
       // Handler pre ponuku od dopravcu
       await handleDeliveryOffer(ws, data);
       break;
       
     case 'message':
       // Handler pre chat správy
       await handleChatMessage(ws, data);
       break;
       
     default:
       console.warn('Unknown message type:', data.type);
       ws.send(JSON.stringify({
         type: 'error',
         message: 'Unknown message type'
       }));
   }
 } catch (err) {
   console.error('Error in handleMessage:', err);
   ws.send(JSON.stringify({
     type: 'error',
     message: err.message
   }));
 }
};

// Handler funkcie
async function handleDeliveryRequest(ws, data) {
 try {
   // Tu pridáme logiku pre spracovanie delivery requestu
   // Napríklad broadcast všetkým pripojeným dopravcom
   
   await setCache(`delivery:${data.id}`, JSON.stringify(data));
   
   broadcastToRole(ws, 'hauler', {
     type: 'new_delivery',
     data: data
   });
 } catch (error) {
   throw new Error('Failed to process delivery request');
 }
}

async function handleDeliveryOffer(ws, data) {
 try {
   // Tu pridáme logiku pre spracovanie ponuky od dopravcu
   // Poslať ju späť odosielateľovi delivery requestu
   
   await setCache(`offer:${data.id}`, JSON.stringify(data));
   
   // Toto by malo ísť konkrétnemu klientovi
   sendToClient(data.clientId, {
     type: 'new_offer',
     data: data
   });
 } catch (error) {
   throw new Error('Failed to process delivery offer');
 }
}

async function handleChatMessage(ws, data) {
 try {
   // Spracovanie chat správy
   // Poslať správu konkrétnemu príjemcovi
   
   sendToClient(data.recipientId, {
     type: 'chat_message',
     data: data
   });
 } catch (error) {
   throw new Error('Failed to process chat message');
 }
}

// Helper funkcie
function broadcastToRole(ws, role, message) {
 // Poslať správu všetkým klientom s danou rolou
 ws.getWss().clients.forEach(client => {
   if (client.role === role && client.readyState === 1) {
     client.send(JSON.stringify(message));
   }
 });
}

function sendToClient(clientId, message) {
 // Poslať správu konkrétnemu klientovi
 ws.getWss().clients.forEach(client => {
   if (client.id === clientId && client.readyState === 1) {
     client.send(JSON.stringify(message));
   }
 });
}