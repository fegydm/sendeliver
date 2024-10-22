import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../components/HomePage';
import SenderPage from '../components/SenderPage';
import HaulerPage from '../components/HaulerPage';
import NotFound from '../components/NotFound'; // Importuj komponent pre 404 stránku

function App() {
  const domain = window.location.hostname; // Získa aktuálnu doménu z URL
  console.log("Current Domain: ", domain); // Vypíše doménu pre diagnostické účely

  return (
    <Router>
      <Routes>
        {/* Ak je doména carriers.sendeliver.com alebo hauler.sendeliver.com, zobrazí sa HaulerPage */}
        {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
          <Route exact path="/" element={<HaulerPage />} />
        ) : 
        /* Ak je doména clients.sendeliver.com alebo sender.sendeliver.com, zobrazí sa SenderPage */
        domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
          <Route exact path="/" element={<SenderPage />} />
        ) : 
        /* Ak je doména www.sendeliver.com alebo sendeliver.com, zobrazí sa HomePage */
        domain === 'www.sendeliver.com' || domain === 'sendeliver.com' ? (
          <Route exact path="/" element={<HomePage />} />
        ) : (
          /* Pre všetky ostatné domény zobrazí NotFound stránku */
          <Route path="*" element={<NotFound />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
