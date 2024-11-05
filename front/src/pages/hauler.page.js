// ./front/src/pages/hauler.page.js
import React from 'react';
import Navigation from '../components/navigation.component.js';
import BannerH from '../components/banner-h.component.js';
import UnderConstruction from '../components/under-construction.component.js';

const HaulerHomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <BannerH />
      <UnderConstruction />
    </div>
  );
};

export default HaulerHomePage;
