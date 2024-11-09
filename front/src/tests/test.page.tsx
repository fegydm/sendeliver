// ./front/src/tests/test.page.tsx
import { useState, useEffect } from 'react';
import Navigation from '../components/navigation.component';

interface TestPageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userState: string;
}

const TestPage = ({ isDarkMode, onToggleDarkMode, userState: initialUserState }: TestPageProps) => {
  const [currentUserState, setCurrentUserState] = useState(initialUserState);
  const [backendStatus, setBackendStatus] = useState('');

  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/test');
        const data = await response.json();
        setBackendStatus(data.message);
      } catch (error) {
        setBackendStatus('Error connecting to backend');
      }
    };
    testBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-4 bg-yellow-100 p-4">
        <p className="font-bold mb-2">Test Controls:</p>
        <select 
          value={currentUserState} 
          onChange={(e) => setCurrentUserState(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="COOKIES_DISABLED">Bez Cookies</option>
          <option value="COOKIES_ENABLED">Cookies Povolené</option>
          <option value="LOGGED_IN">Prihlásený</option>
        </select>
      </div>

      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p className="font-bold">Backend Status:</p>
        <p>{backendStatus}</p>
      </div>

      <Navigation 
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    </div>
  );
};

export default TestPage;