// ./front/src/app.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import WebSocketService from './services/websocket.service';
import HomePage from './pages/home.page';
import SenderPage from './pages/sender.page';
import HaulerPage from './pages/hauler.page';
import NotFound from './pages/notfound.page';
import TestPage from './test/test.page';
import SecretPage from './pages/secret.page1';
import SecretPageLuke from './pages/secret.page2';

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

  // Rozšírené podmienky pre rôzne prostredia
  const isDevEnvironment = domain.includes('github.dev') || domain === 'localhost' || domain === '127.0.0.1';
  const isMainDomain = domain === 'www.sendeliver.com' || domain === 'sendeliver.com' || isDevEnvironment;
  
  // Nová podmienka pre tajné stránky
  if (domain === 'jozo.sendeliver.com' || (isDevEnvironment && domain.includes('jozo'))) {
    return <SecretPage />;
  }

  if (domain === 'luke.sendeliver.com' || (isDevEnvironment && domain.includes('luke'))) {
    return <SecretPageLuke />;
  }

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
            {/* Tajná stránka dostupná aj cez cestu v dev móde */}
            {isDevEnvironment && <Route path="/jozo" element={<SecretPage />} />}
            {isDevEnvironment && <Route path="/luke" element={<SecretPageLuke />} />}
          </>
        ) : (
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
