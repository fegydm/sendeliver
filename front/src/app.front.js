// ./front/src/app.front.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import WebSocketService from './services/websocket.service';
import HomePage from './pages/home.page';
import SenderPage from './pages/sender.page';
import HaulerPage from './pages/hauler.page';
import NotFound from './pages/notfound.page';
import TestPage from './tests/test.page';
import SecretPageJozo from './pages/secret1.page';
import SecretPageLuke from './pages/secret2.page';

function App() {
 const domain = window.location.hostname;
 const [isDarkMode, setIsDarkMode] = useState(false);
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
         {isDevEnvironment && (
           <Route path="/test" element={<TestPage />} />
         )}

         {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
           <Route exact path="/" element={<HaulerPage />} />
         ) : 
         domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
           <Route exact path="/" element={<SenderPage />} />
         ) : 
         isMainDomain ? (
           <>
             <Route exact path="/" element={<HomePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />
             {isDevEnvironment && <Route path="/test" element={<TestPage />} />}
             {isDevEnvironment && <Route path="/jozo" element={<SecretPageJozo />} />}
             {isDevEnvironment && <Route path="/luke" element={<SecretPageLuke />} />}
           </>
         ) : (
           <Route path="*" element={<NotFound />} />
         )}
       </Routes>
     </div>
   </Router>
 );
}

export default App;