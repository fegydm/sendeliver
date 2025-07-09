// File: front/src/App.tsx
// Posledná akcia: Finálna verzia integrujúca AuthProvider a umožňujúca "demo mód" na chránených stránkach.

import React from "react";
import { Routes, Route } from "react-router-dom";

// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Components & Pages
import Navigation from "@/components/shared/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
import HomePage from "@/pages/home.page";
import NotFoundPage from "@/pages/notfound.page";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";

const AppContent: React.FC = () => {
  // Stav pre testovací footer môže žiť tu, alebo byť presunutý do vlastného kontextu
  const [isTestFooterVisible, setIsTestFooterVisible] = React.useState(false);

  return (
    <div>
      <header><Navigation /></header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Routy sú teraz priame. O zobrazení dát rozhoduje komponent vo vnútri. */}
          <Route path="/hauler" element={<HaulerPage />} />
          <Route path="/carrier" element={<HaulerPage />} />
          <Route path="/carriers" element={<HaulerPage />} />

          <Route path="/sender" element={<SenderPage />} />
          <Route path="/client" element={<SenderPage />} />
          <Route path="/clients" element={<SenderPage />} />
          
          {/* TODO: Pridať ostatné routy ako /video, /dokumentacia atď. */}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer>
        <FooterPage 
          onAdminToggle={setIsTestFooterVisible} 
          isTestFooterVisible={isTestFooterVisible} 
        />
        <div className="footer__floating"><FloatingButton /></div>
        {/* FooterTest tu už nemusí byť, ak ho riadi FooterPage */}
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    // Vrátili sme všetky tvoje dôležité providery. AuthProvider je medzi nimi.
    <TranslationProvider>
      <LanguagesProvider>
        <CountriesProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ThemeProvider>
        </CountriesProvider>
      </LanguagesProvider>
    </TranslationProvider>
  );
};

export default App;