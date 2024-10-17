import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../components/HomePage';
import SenderPage from '../components/SenderPage';
import HaulerPage from '../components/HaulerPage';

function App() {
  const domain = window.location.hostname;
  console.log("Current Domain: ", domain);
  
  return (
    <Router>
      <Routes>
        {domain === 'sender.sendeliver.com' || domain === 'clients.sendeliver.com' ? (
          <Route exact path="/" element={<SenderPage />} />
        ) : domain === 'hauler.sendeliver.com' || domain === 'carriers.sendeliver.com' ? (
          <Route exact path="/" element={<HaulerPage />} />
        ) : (
          <>
            <Route exact path="/" element={<HomePage />} />
            <Route path="/sender" element={<SenderPage />} />
            <Route path="/hauler" element={<HaulerPage />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
