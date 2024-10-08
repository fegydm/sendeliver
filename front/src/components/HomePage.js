import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Welcome to Sendeliver</h1>
      <p>Please choose your portal:</p>
      <ul>
        <li><Link to="/sender">Sender Portal</Link></li>
        <li><Link to="/hauler">Hauler Portal</Link></li>
      </ul>
    </div>
  );
}

export default HomePage;

