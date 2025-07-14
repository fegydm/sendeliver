// File: front/src/App.tsx
// Last change: Removed unused 'useAuth' import.

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Navigation from "@/components/shared/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
import HomePage from "@/pages/home.page";
import NotFoundPage from "@/pages/notfound.page";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";
import GoogleAuthCallback from "@/pages/GoogleAuthCallback";
import LoginModal from "@/components/shared/modals/LoginModal";
import ProtectedRoute from "@/components/shared/auth/ProtectedRoute";

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header><Navigation /></header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/hauler" element={<HaulerPage />} />
          <Route path="/carrier" element={<HaulerPage />} />
          <Route path="/carriers" element={<HaulerPage />} />

          <Route path="/sender" element={<SenderPage />} />
          <Route path="/client" element={<SenderPage />} />
          <Route path="/clients" element={<SenderPage />} />

          <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          <Route path="/login" element={<LoginModal isOpen={true} onClose={() => navigate("/")} />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard (Protected Content)</div>} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer>
        <FooterPage 
          onAdminToggle={() => {}}
          isTestFooterVisible={false}
        />
        <div className="footer__floating"><FloatingButton /></div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
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
