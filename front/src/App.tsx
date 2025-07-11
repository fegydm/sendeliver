// File: front/src/App.tsx
// Last change: Removed duplicate Router component.

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter, kept Routes, Route, Navigate
import { useAuth } from "@/contexts/AuthContext";

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
import GoogleAuthCallback from "@/pages/GoogleAuthCallback";
import LoginModal from "@/components/shared/modals/LoginModal";

// ProtectedRoute component to guard routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  // Stav isLoginModalOpen je teraz nepoužívaný, pretože LoginModal je riadený routou.
  // Môže byť odstránený, ak sa nepoužíva inde.
  // const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);

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

          {/* Login Route - LoginModal is displayed when /login is active */}
          <Route path="/login" element={<LoginModal isOpen={true} onClose={() => { /* No action needed here, route handles closing */ }} />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Dashboard (Protected Content)</div>
            </ProtectedRoute>
          } />
          
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
    // Router je teraz iba v main.tsx, tu ho už neobalujeme
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
