// ./front/src/pages/HomePage.js
import React, { useState } from 'react';
import Navigation from '../components/navigation.component';
import Banner from '../components/banner.component';
import SearchForm from '../components/search-form.component';
import AiSearch from '../components/ai-search.component';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleFocus = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen">
      <Navigation authStatus="anonymous" />
      <Banner />

      <div className="flex">
        {/* Sender Section */}
        <div
          className={`w-1/2 space-y-4 p-6 transition-all duration-300 ${
            activeSection === 'carrier'
              ? 'bg-gray-100 text-gray-400 border-gray-200'
              : 'bg-[#FF00FF]/20 text-black border-[#FF00FF]/50'
          }`}
          onFocus={() => handleFocus('sender')}
        >
          <SearchForm type="client" />
          <AiSearch type="client" />
        </div>

        {/* Hauler Section */}
        <div
          className={`w-1/2 space-y-4 p-6 transition-all duration-300 ${
            activeSection === 'sender'
              ? 'bg-gray-100 text-gray-400 border-gray-200'
              : 'bg-[#74cc04]/20 text-black border-[#74cc04]/50'
          }`}
          onFocus={() => handleFocus('carrier')}
        >
          <SearchForm type="carrier" />
          <AiSearch type="carrier" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
