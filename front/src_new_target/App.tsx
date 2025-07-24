// File: front/src/App.tsx
// Last change: Added ShowEmailBannerButton for cases when user dismissed the banner but still needs email verification.

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@shared/contexts/AuthContext";
import { TranslationProvider } from "@/shared/contexts/TranslationContext";
import { LanguagesProvider } from "@shared/contexts/LanguagesContext";
import { CountriesProvider } from "@shared/contexts/CountriesContext";
import { ThemeProvider } from "@shared/contexts/ThemeContext";

import Navigation from "@shared/components/navigation/shared.navbar.comp";
import FooterPage from "@shared/components/footer/shared.footer.comp";
import FloatingButton from "@shared/components/elements/shared.floating-button.comp";
import auth.protected-route.comp from "@features/auth/components/auth.protected-route.comp";
import shared.message-banner.comp from "@shared/components/elements/shared.message-banner.comp"; 


const HomePage = lazy(() => import("@/pages/home.page"));
const HaulerPage = lazy(() => import("@/pages/hauler.page"));
const SenderPage = lazy(() => import("@/pages/sender.page"));
const NotFoundPage = lazy(() => import("@/pages/notfound.page"));
const GoogleAuthCallback = lazy(() => import("@/pages/GoogleAuthCallback"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const CompleteAccountLinkPage = lazy(() => import("@/pages/CompleteAccountLinkPage"));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage"));

const AppContent: React.FC = () => {
  return (
    <div>
      <header><Navigation /></header>
      
      {/* Email verification components */}
        <shared.message-banner.comp />
      
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

            <Route element={<auth.protected-route.comp />}>
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