// ./front/src/App.tsx
import { useEffect, useState } from 'react';
import HomePage from './pages/home.page';
import WebSocketService from './services/websocket.service.mts';

interface WebSocketMessage {
 type: string;
 data: any;
}

const App: React.FC = () => {
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
   // Kontrola uloženej preferencie dark mode
   const savedMode = localStorage.getItem('darkMode');
   return savedMode ? JSON.parse(savedMode) : false;
 });

 const [wsService] = useState(() => new WebSocketService(import.meta.env.VITE_WS_URL || 'ws://localhost:5000'));

 useEffect(() => {
   // Uloženie dark mode preferencie
   localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

   // Aplikovanie dark mode na document
   if (isDarkMode) {
     document.documentElement.classList.add('dark');
   } else {
     document.documentElement.classList.remove('dark');
   }
 }, [isDarkMode]);

 useEffect(() => {
   // Inicializácia WebSocket pripojenia
   const initWebSocket = () => {
     wsService.connect();

     const handleConnection = () => {
       console.log('Connected to WebSocket server');
     };

     const handleError = (error: unknown) => {
       console.error('WebSocket error:', error);
     };

     const handleMessage = (message: WebSocketMessage) => {
       console.log('Received message:', message);
       // Tu môžete spracovať prijaté správy podľa typu
       switch (message.type) {
         case 'update':
           // Handle update
           break;
         case 'notification':
           // Handle notification
           break;
         default:
           console.log('Unhandled message type:', message.type);
       }
     };

     wsService.subscribe('connection', handleConnection);
     wsService.subscribe('error', handleError);
     wsService.subscribe('message', handleMessage);

     // Cleanup pri unmount
     return () => {
       wsService.unsubscribe('connection', handleConnection);
       wsService.unsubscribe('error', handleError);
       wsService.unsubscribe('message', handleMessage);
       wsService.disconnect();
     };
   };

   return initWebSocket();
 }, [wsService]);

 const toggleDarkMode = () => {
   setIsDarkMode((prevMode: boolean) => !prevMode);
 };

 return (
   <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
     <div className="dark:bg-gray-900">
       <HomePage 
         isDarkMode={isDarkMode} 
         onToggleDarkMode={toggleDarkMode} 
       />
     </div>
   </div>
 );
};

export default App;