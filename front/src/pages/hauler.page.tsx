// ./front/src/pages/hauler.page.tsx
import React, { useEffect, useState } from 'react';
import Navigation from '../components/navigation.component';
import BannerH from '../components/banner-h.component';
import UnderConstruction from '../components/under-construction.component';

const HaulerPage: React.FC = () => {
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
   <div className="min-h-screen bg-hauler-gray-100 dark:bg-hauler-gray-900">
     <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
     <BannerH />
     <div className="container mx-auto px-4">
       <UnderConstruction />
     </div>
   </div>
 );
};

export default HaulerPage;