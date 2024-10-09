import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../components/HomePage';
import SenderPage from '../components/SenderPage';
import HaulerPage from '../components/HaulerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sender" element={<SenderPage />} />
        <Route path="/hauler" element={<HaulerPage />} />
      </Routes>
    </Router>
  );
}
export default App;
