// ./front/src/pages/home.page.js
import React, { useState, useEffect } from 'react';
import Navigation from '../components/navigation.component';
import Banner from '../components/banner.component';
import SearchForm from '../components/search-form.component';
import AiSearch from '../components/ai-search.component';
import QuickActions from '../components/quick-actions.component';
import ContentSection from '../components/content-section.component';
import FloatingButton from '../components/floating-button.component';

const HomePage = ({ isDarkMode, onToggleDarkMode }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [userState, setUserState] = useState('COOKIES_DISABLED');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);

  const handleFocus = (section) => {
    if (activeSection === section) return;
    setIsAnimating(true);
    setActiveSection(section);
    setShowQuickStats(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <Navigation 
        userState={userState}
        isDarkMode={isDarkMode} 
        onToggleDarkMode={onToggleDarkMode}
      />
      <Banner />

      <main className="container mx-auto px-4 py-8">
        <QuickActions />

        <div className="flex flex-col md:flex-row gap-4 items-stretch min-h-[600px]">
          <ContentSection
            type="sender"
            isActive={activeSection === 'sender'}
            showStats={showQuickStats}
            onFocus={handleFocus}
          >
            <SearchForm type="client" isActive={activeSection === 'sender'} />
            <AiSearch type="client" isActive={activeSection === 'sender'} />
          </ContentSection>

          <ContentSection
            type="carrier"
            isActive={activeSection === 'carrier'}
            showStats={showQuickStats}
            onFocus={handleFocus}
          >
            <SearchForm type="carrier" isActive={activeSection === 'carrier'} />
            <AiSearch type="carrier" isActive={activeSection === 'carrier'} />
          </ContentSection>
        </div>
      </main>

      <FloatingButton />
    </div>
  );
};

export default HomePage;