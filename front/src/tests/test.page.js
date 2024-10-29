// src/test/TestPage.js
import React, { useState, useEffect } from 'react';
import Navigation from '../components/navigation.component.js';  // Upravená cesta

const TestPage = () => {
  const [userState, setUserState] = useState('COOKIES_DISABLED');
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
      {/* Test Controls */}
      <div className="mb-4 bg-yellow-100 p-4">
        <p className="font-bold mb-2">Test Controls:</p>
        <select 
          value={userState} 
          onChange={(e) => setUserState(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="COOKIES_DISABLED">Bez Cookies</option>
          <option value="COOKIES_ENABLED">Cookies Povolené</option>
          <option value="LOGGED_IN">Prihlásený</option>
        </select>
      </div>

      {/* Backend Status */}
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <p className="font-bold">Backend Status:</p>
        <p>{backendStatus}</p>
      </div>

      {/* Navigation Component */}
      <Navigation 
        userState={userState}
        username={userState === 'LOGGED_IN' ? "Test User" : ""}
        userAvatar={userState === 'LOGGED_IN' ? "/api/placeholder/100/100" : ""}
      />
    </div>
  );
};

export default TestPage;