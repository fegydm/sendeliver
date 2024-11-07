// ./front/src/pages/sender.page.tsx
import React from 'react';
import Navigation from '../components/navigation.component';
import BannerS from '../components/banner-s.component';
import UnderConstruction from '../components/under-construction.component';

const SenderHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderHomePage;
