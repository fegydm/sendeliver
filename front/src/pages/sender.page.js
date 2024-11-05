// ./front/src/pages/sender.page.js
import React from 'react';
import Navigation from '../components/navigation.component.js';
import BannerS from '../components/banner-s.component.js';
import UnderConstruction from '../components/under-construction.component.js';

const SenderHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderHomePage;
