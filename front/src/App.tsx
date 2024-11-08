// ./front/src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import WebSocketService from './services/websocket.service';
import HomePage from './pages/home.page';
import SenderPage from './pages/sender.page';
import HaulerPage from './pages/hauler.page';
import NotFound from './pages/notfound.page';
import TestPage from './tests/test.page';
import SecretPageJozo from './pages/secret1.page';
import SecretPageLuke from './pages/secret2.page';

const App: React.FC = () => {
  const domain = window.location.hostname;
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  console.log("Current Domain: ", domain);

  useEffect(() => {
    WebSocketService.onMessage('connection', () => {
      console.log('WebSocket Connected');
    });

    WebSocketService.onMessage('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
    if (prefersDarkMode) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const isDevEnvironment = domain.includes('github.dev') || domain === 'localhost' || domain === '127.0.0.1';
  const isMainDomain = domain === 'www.sendeliver.com' || domain === 'sendeliver.com' || isDevEnvironment;
  const isSenderDomain = domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com';
  const isHaulerDomain = domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com';

  if (domain === 'jozo.sendeliver.com' || (isDevEnvironment && domain.includes('jozo'))) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <SecretPageJozo />
      </div>
    );
  }

  if (domain === 'luke.sendeliver.com' || (isDevEnvironment && domain.includes('luke'))) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <SecretPageLuke />
      </div>
    );
  }

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Routes>
          {isDevEnvironment && <Route path="/test" element={<TestPage />} />}

          {isSenderDomain && <Route path="/" element={<SenderPage />} />}
          {isHaulerDomain && <Route path="/" element={<HaulerPage />} />}

          {isMainDomain ? (
            <>
              <Route path="/" element={<HomePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
              <Route path="/sender" element={<SenderPage />} />
              <Route path="/hauler" element={<HaulerPage />} />

              {/* Presmerovania pre alternatívne URL */}
              <Route path="/clients" element={<Navigate to="/sender" replace />} />
              <Route path="/carriers" element={<Navigate to="/hauler" replace />} />

              {isDevEnvironment && <Route path="/jozo" element={<SecretPageJozo />} />}
              {isDevEnvironment && <Route path="/luke" element={<SecretPageLuke />} />}
            </>
          ) : (
            <Route path="*" element={<NotFound />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
