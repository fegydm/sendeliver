// ./front/src/pages/hauler.page.js
import React from 'react';
import Navigation from '../components/navigation.component';
import BannerH from '../components/banner-h.component';
import UnderConstruction from '../components/under-construction.component';

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
