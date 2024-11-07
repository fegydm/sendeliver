// ./front/src/pages/hauler.page.tsx
import React, { useState } from 'react';
import Navigation from '../components/navigation.component';
import BannerH from '../components/banner-h.component';
import UnderConstruction from '../components/under-construction.component';

const HaulerHomePage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <BannerH />
      <UnderConstruction />
    </div>
  );
};

export default HaulerHomePage;
