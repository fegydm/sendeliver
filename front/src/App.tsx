// ./front/src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from './pages/home.page';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <Router>
      <HomePage 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={handleToggleDarkMode}
      />
    </Router>
  );
};

export default App;