// ./front/src/pages/sender.page.tsx
import React, { useState } from 'react';
import Navigation from '../components/navigation.component';
import BannerS from '../components/banner-s.component';
import UnderConstruction from '../components/under-construction.component';

const SenderHomePage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderHomePage;
