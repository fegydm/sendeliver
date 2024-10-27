// /front/src/pages/TestPage.js
import React from 'react';
import Navigation from '../components/navigation.component';  // uisti sa že N je veľké ak tak máš pomenovaný súbor

const TestPage = () => {
  const [userState, setUserState] = React.useState('COOKIES_DISABLED');
  
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

      <Navigation 
        userState={userState}
        username={userState === 'LOGGED_IN' ? "Test User" : ""}
        userAvatar={userState === 'LOGGED_IN' ? "/api/placeholder/100/100" : ""}
      />
    </div>
  );
};

export default TestPage;