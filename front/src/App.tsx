// File: front/src/App.tsx
// Last change: Integrated MessageBanner component for email verification status display.

import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Navigation from "@/components/shared/navbars/navbar.component";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";
import ProtectedRoute from "@/components/shared/auth/ProtectedRoute";
import MessageBanner from "@/components/shared/elements/MessageBanner"; // NEW: Import MessageBanner

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
      {/* NEW: Place MessageBanner directly below the Navbar */}
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