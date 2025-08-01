// File: front/src/App.tsx
// Last change: Corrected file imports to match kebab-case naming convention and fixed component wrapping order for user-specific themes.

import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth.context";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider } from "@/contexts/theme.context";

import Navigation from "@/shared/navigation/navbar";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FloatingButton from "@/shared/elements/floating-button.element";
import ProtectedRoute from "@/shared/guards/protected-route.guard";
import MessageBanner from "@/shared/elements/message-banner.element"; // Corrected import path

const HomePage = lazy(() => import("@/pages/home.page"));
const HaulerPage = lazy(() => import("@/apps/hauler/hauler"));
const SenderPage = lazy(() => import("@/pages/sender.page"));
const NotFoundPage = lazy(() => import("@/pages/notfound.page"));
const GoogleAuthCallback = lazy(() => import("@/pages/google-auth-callback.page")); // Corrected import path
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const CompleteAccountLinkPage = lazy(() => import("@/pages/complete-account-link.page")); // Corrected import path
const VerifyEmailPage = lazy(() => import("@/pages/verify-email.page")); // Corrected import path

const AppContent: React.FC = () => {
  const location = useLocation();
  
  // Logic to determine the active role based on the URL path.
  const getActiveRole = () => {
    if (location.pathname.includes('/hauler') || location.pathname.includes('/carrier')) {
      return 'hauler';
    }
    if (location.pathname.includes('/sender') || location.pathname.includes('/client')) {
      return 'sender';
    }
    // Default theme for other pages
    return 'broker';
  };
  
  const activeRole = getActiveRole();

  return (
    <ThemeProvider activeRole={activeRole}>
      <header><Navigation /></header>
      
      <MessageBanner />
      
      <main>
        <Suspense fallback={<div className="text-center p-12">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route path="/hauler" element={<HaulerPage />} />
            <Route path="/carrier" element={<HaulerPage />} />
            <Route path="/carriers" element={<HaulerPage />} />

            <Route path="/sender" element={<SenderPage />} />
            <Route path="/client" element={<SenderPage />} />
            <Route path="/clients" element={<SenderPage />} />

            <Route path="/auth/callback" element={<GoogleAuthCallback />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/complete-account-link" element={<CompleteAccountLinkPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard (Protected Content)</div>} />
            </Route>
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <footer>
        <FooterPage 
          onAdminToggle={() => {}}
          isTestFooterVisible={false}
        />
        <div className="footer__floating"><FloatingButton /></div>
      </footer>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <TranslationProvider>
      <LanguagesProvider>
        <CountriesProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
        </CountriesProvider>
      </LanguagesProvider>
    </TranslationProvider>
  );
};

export default App;