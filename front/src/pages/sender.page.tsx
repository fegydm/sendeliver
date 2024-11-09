// ./front/src/pages/sender.page.tsx
import React, { useEffect, useState } from 'react';
import Navigation from '../components/navigation.component';
import BannerS from '../components/banners/banner-s.component';
import UnderConstruction from '../components/under-construction.component';

const SenderPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-client-gray-100 dark:bg-client-gray-900">
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <BannerS />
      <div className="container mx-auto px-4">
        <UnderConstruction />
      </div>
    </div>
  );
};

export default SenderPage;