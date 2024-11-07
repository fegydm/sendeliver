// ./front/src/pages/home.page.tsx
import { useState } from 'react';
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
    <div className={`min-w-[320px] ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navigation 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={onToggleDarkMode}
      />
      
      {/* Main content s padding-top pre fixed navigation */}
      <div className="pt-16">
        <Banner />

        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Section */}
            <ContentSection
              type="sender"
              isActive={activeSection === 'sender'}
              showStats={showQuickStats}
              onFocus={() => handleFocus('sender')}
            >
              <div className="space-y-6">
                <SearchForm type="client" />
                <AiSearch type="client" />
              </div>
            </ContentSection>

            {/* Carrier Section */}
            <ContentSection
              type="carrier"
              isActive={activeSection === 'carrier'}
              showStats={showQuickStats}
              onFocus={() => handleFocus('carrier')}
            >
              <div className="space-y-6">
                <SearchForm type="carrier" />
                <AiSearch type="carrier" />
              </div>
            </ContentSection>
          </div>

          {/* Quick Stats */}
          {showQuickStats && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Aktívne doručenia</h3>
                <p className="text-3xl font-bold text-blue-500">1,234</p>
              </div>
              <div className={`p-6 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Dostupní kuriéri</h3>
                <p className="text-3xl font-bold text-green-500">567</p>
              </div>
              <div className={`p-6 rounded-lg shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="text-lg font-semibold mb-2">Dokončené dnes</h3>
                <p className="text-3xl font-bold text-purple-500">89</p>
              </div>
            </div>
          )}
        </main>
      </div>

      <FloatingButton />
    </div>
  );
};

export default HomePage;