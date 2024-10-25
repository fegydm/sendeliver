// ./front/src/pages/HomePage.js
import React from 'react';
import Navigation from '../components/Navigation';
import Banner from '../components/Banner';
import SearchForm from '../components/SearchForm';
import AiSearch from '../components/AiSearch';  // pridané

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navigation authStatus="anonymous" />
      <Banner />
      
      <div className="flex">
        <div className="w-1/2 space-y-4">
          <SearchForm type="client" />
          <AiSearch type="client" />
        </div>
        <div className="w-1/2 space-y-4">
          <SearchForm type="carrier" />
          <AiSearch type="carrier" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;