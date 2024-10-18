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
       {domain === 'carriers.sendeliver.com' || domain === 'hauler.sendeliver.com' ? (
  <Route exact path="/" element={<HaulerPage />} />
) : domain === 'clients.sendeliver.com' || domain === 'sender.sendeliver.com' ? (
  <Route exact path="/" element={<SenderPage />} />
) : (
  <Route exact path="/" element={<HomePage />} />
)}
      </Routes>
    </Router>
  );
}

export default App;
