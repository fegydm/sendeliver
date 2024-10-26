// ./front/src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import WebSocketService from './services/websocket';
import HomePage from './pages/HomePage';
import SenderPage from './pages/SenderPage';
import HaulerPage from './pages/HaulerPage';
import NotFound from './pages/NotFound';
import TestPage from './pages/TestPage';  // Nový import

function App() {
  const domain = window.location.hostname;
  console.log("Current Domain: ", domain);

  useEffect(() => {
    WebSocketService.onMessage('connection', () => {
      console.log('WebSocket Connected');
    });

    WebSocketService.onMessage('error', (error) => {
      console.error('WebSocket Error:', error);
    });
  }, []);

  // Pre lokálny vývoj považujeme localhost za hlavnú doménu
  const isLocalhost = domain === 'localhost' || domain === '127.0.0.1';
  const isMainDomain = domain === 'www.sendeliver.com' || domain === 'sendeliver.com' || isLocalhost;

  return (
    <Router>
      <Routes>
        {/* Testovacia stránka - dostupná len na localhoste */}
        {isLocalhost && (
          <Route path="/test" element={<TestPage />} />
        )}

        {/* Existujúce routy podľa domény */}
        {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
          <Route exact path="/" element={<HaulerPage />} />
        ) : 
        domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
          <Route exact path="/" element={<SenderPage />} />
        ) : 
        isMainDomain ? (
          <Route exact path="/" element={<HomePage />} />
        ) : (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;