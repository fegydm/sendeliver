import React, { useState } from 'react';
import Navigation from '../components/navigation.component';
import Banner from '../components/banner.component';
import SearchForm from '../components/search-form.component';
import AiSearch from '../components/ai-search.component';
import ContentSection from '../components/content-section.component';
import FloatingButton from '../components/floating-button.component';

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [activeSection, setActiveSection] = useState<'sender' | 'carrier' | null>(null);
  const [showQuickStats, setShowQuickStats] = useState(false);

  const handleFocus = (section: 'sender' | 'carrier'): void => {
    if (activeSection === section) return;
    setActiveSection(section);
    setShowQuickStats(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <Navigation 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={onToggleDarkMode}
      />
      <Banner />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch min-h-[600px]">
          <ContentSection
            type="sender"
            isActive={activeSection === 'sender'}
            showStats={showQuickStats}
            onFocus={(type) => handleFocus(type as 'sender' | 'carrier')}
          >
            <SearchForm type="client" />
            <AiSearch type="client" />
          </ContentSection>

          <ContentSection
            type="carrier"
            isActive={activeSection === 'carrier'}
            showStats={showQuickStats}
            onFocus={(type) => handleFocus(type as 'sender' | 'carrier')}
          >
            <SearchForm type="carrier" />
            <AiSearch type="carrier" />
          </ContentSection>
        </div>
      </main>

      <FloatingButton />
    </div>
  );
};

export default HomePage;
