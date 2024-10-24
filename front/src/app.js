// ./front/src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import WebSocketService from './services/websocket';
import HomePage from './components/HomePage';
import SenderPage from './components/SenderPage';
import HaulerPage from './components/HaulerPage';
import NotFound from './components/NotFound';

function App() {
  const domain = window.location.hostname;
  console.log("Current Domain: ", domain);

  useEffect(() => {
    // Initialize WebSocket connection
    WebSocketService.onMessage('connection', () => {
      console.log('WebSocket Connected');
    });

    // Handle potential WebSocket errors
    WebSocketService.onMessage('error', (error) => {
      console.error('WebSocket Error:', error);
    });
  }, []);

  return (
    <Router>
      <Routes>
        {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
          <Route exact path="/" element={<HaulerPage />} />
        ) : 
        domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
          <Route exact path="/" element={<SenderPage />} />
        ) : 
        domain === 'www.sendeliver.com' || domain === 'sendeliver.com' ? (
          <Route exact path="/" element={<HomePage />} />
        ) : (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
