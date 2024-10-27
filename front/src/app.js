// ./front/src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import WebSocketService from './services/websocket.service';
import HomePage from './pages/home.page';
import SenderPage from './pages/SenderPage';
import HaulerPage from './pages/HaulerPage';
import NotFound from './pages/NotFound';
import TestPage from './test/TestPage';

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

  // Uprav podmienky pre github.dev
  const isDevEnvironment = domain.includes('github.dev') || domain === 'localhost' || domain === '127.0.0.1';
  const isMainDomain = domain === 'www.sendeliver.com' || domain === 'sendeliver.com' || isDevEnvironment;

  return (
    <Router>
      <Routes>
        {/* Test route dostupná v dev prostredí */}
        {isDevEnvironment && (
          <Route path="/test" element={<TestPage />} />
        )}

        {/* Ostatné routy */}
        {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
          <Route exact path="/" element={<HaulerPage />} />
        ) : 
        domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
          <Route exact path="/" element={<SenderPage />} />
        ) : 
        isMainDomain ? (
          <>
            <Route exact path="/" element={<HomePage />} />
            {/* V dev prostredí pridáme aj test route na root úrovni */}
            {isDevEnvironment && <Route path="/test" element={<TestPage />} />}
          </>
        ) : (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;