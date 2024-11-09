// ./front/src/pages/home.page.tsx
import { useState } from 'react';
import Navigation from '../components/navigation.component';
import Banner from '../components/banners/banner.component';
import SearchForm from '../components/search-form.component';
import AiSearch from '../components/ai/ai-search.component';
import ContentSection from '../components/content-section.component';
import FloatingButton from '../components/floating-button.component';
import AIChat from '../components/ai/ai-chat.component';

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface TransportData {
  from?: string;
  fromTime?: string;
  to?: string;
  toTime?: string;
  weight?: string;
  pallets?: number;
}

const HomePage = ({ isDarkMode, onToggleDarkMode }: HomePageProps) => {
  const [activeSection, setActiveSection] = useState<'sender' | 'carrier' | null>(null);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [transportData, setTransportData] = useState<TransportData>({});

  const handleAIRequest = (section: 'sender' | 'carrier') => {
    setActiveSection(section);
    setIsAIChatOpen(true);
  };

  return (
    <div className={`min-w-[320px] ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navigation 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={onToggleDarkMode}
      />
      
      <div className="pt-16">
        <Banner />

        <main className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Client Section */}
            <ContentSection
              type="sender"
              isActive={activeSection === 'sender'}
              showStats={showQuickStats}
            >
              <div className="space-y-6">
                <AiSearch 
                  type="client"
                  onAIRequest={() => handleAIRequest('sender')}
                  onDataExtracted={(data) => setTransportData(data)}
                />
                <SearchForm type="client" />
              </div>
            </ContentSection>

            {/* Carrier Section */}
            <ContentSection
              type="carrier"
              isActive={activeSection === 'carrier'}
              showStats={showQuickStats}
            >
              <div className="relative">
                {activeSection === 'sender' && isAIChatOpen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                    <div className="bg-white dark:bg-gray-800 w-full h-full rounded-lg p-6 m-4">
                      <AIChat 
                        onClose={() => setIsAIChatOpen(false)}
                        onDataExtracted={(data) => {
                          setTransportData(data);
                          setIsAIChatOpen(false);
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  <AiSearch 
                    type="carrier"
                    onAIRequest={() => handleAIRequest('carrier')}
                  />
                  <SearchForm type="carrier" />
                </div>
              </div>
            </ContentSection>
          </div>

          {/* Quick Stats */}
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
        </main>
      </div>

      {/* AI Chat Modal pre ľavú stranu */}
      {activeSection === 'carrier' && isAIChatOpen && (
        <div className="fixed inset-y-0 left-0 w-1/2 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full h-3/4 rounded-lg p-6 m-4">
            <AIChat 
              onClose={() => setIsAIChatOpen(false)}
              onDataExtracted={(data) => {
                setTransportData(data);
                setIsAIChatOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <FloatingButton />
    </div>
  );
};

export default HomePage;