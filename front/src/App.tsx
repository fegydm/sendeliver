// File: src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
// Providers
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
// Components
import Navigation from "@/components/shared/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
import VideoPage from "@/pages/video.page";
import DocumentationPage from "@/pages/DocumentationPage";
import HomePage from "@/pages/home.page";
// Static pages moved to shared components
import AboutPage from "@/components/shared/pages/AboutPage";
import ContactPage from "@/components/shared/pages/ContactPage";
import NotFoundPage from "@/pages/notfound.page";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FooterTest from "@/components/shared/footers/footer-test.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";
import useScrollBounce from "@/hooks/useScrollBounce";
import PinForm from "@/components/shared/elements/pin-form.element";

// Idle timeout: 3 minutes
const IDLE_TIMEOUT = 30 * 60 * 1000;

// Public routes (accessible without PIN)
const PUBLIC_ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
} as const;

// Protected routes (require PIN)
const SENDER_ROUTES = ["/sender", "/client", "/clients"] as const;
const HAULER_ROUTES = ["/hauler", "/carrier", "/carriers"] as const;
const PROTECTED_SINGLE_ROUTES = {
  DOCUMENTATION: "/dokumentacia",
  VIDEO: "/:alias",
} as const;

interface AppContentProps {
  authenticated: boolean;
  idle: boolean;
  onAuthenticated: () => void;
}

// Main content including routing, renders public and protected sections
const AppContent: React.FC<AppContentProps> = ({ authenticated, idle, onAuthenticated }) => {
  useScrollBounce();
  const { theme } = useTheme();
  const [isTestFooterVisible, setIsTestFooterVisible] = useState(false);

  return (
    <div data-theme={theme}>
      <header><Navigation /></header>
      <main>
        <Routes>
          {/* Public routes */}
          <Route path={PUBLIC_ROUTES.HOME} element={<HomePage />} />
          <Route path={PUBLIC_ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={PUBLIC_ROUTES.CONTACT} element={<ContactPage />} />

          {/* Protected sender routes */}
          {SENDER_ROUTES.map(path => (
            <Route
              key={path}
              path={path}
              element={
                authenticated && !idle
                  ? <SenderPage />
                  : <PinForm domain="sender" onCorrectPin={onAuthenticated} />
              }
            />
          ))}

          {/* Protected hauler routes */}
          {HAULER_ROUTES.map(path => (
            <Route
              key={path}
              path={path}
              element={
                authenticated && !idle
                  ? <HaulerPage />
                  : <PinForm domain="hauler" onCorrectPin={onAuthenticated} />
              }
            />
          ))}

          {/* Protected single routes */}
          <Route
            path={PROTECTED_SINGLE_ROUTES.DOCUMENTATION}
            element={
              authenticated && !idle
                ? <DocumentationPage />
                : <PinForm domain="hauler" onCorrectPin={onAuthenticated} />
            }
          />
          <Route
            path={PROTECTED_SINGLE_ROUTES.VIDEO}
            element={
              authenticated && !idle
                ? <VideoPage />
                : <PinForm domain="hauler" onCorrectPin={onAuthenticated} />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <footer>
        <FooterPage onAdminToggle={setIsTestFooterVisible} isTestFooterVisible={isTestFooterVisible} />
        <div className="footer__floating"><FloatingButton /></div>
        <FooterTest isVisible={isTestFooterVisible} onClose={() => setIsTestFooterVisible(false)} />
      </footer>
    </div>
  );
};

// Root component manages authentication and idle timer
const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("authenticated") === "true");
  const [idle, setIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());

  // Listen for user activity globally
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => {
      if (authenticated) {
        lastActivityRef.current = Date.now();
        if (idle) setIdle(false);
      }
    };
    events.forEach(evt => window.addEventListener(evt, handleActivity));

    const interval = setInterval(() => {
      if (authenticated && Date.now() - lastActivityRef.current > IDLE_TIMEOUT) {
        setIdle(true);
      }
    }, 1000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      clearInterval(interval);
    };
  }, [authenticated, idle]);

  // Called after successful PIN entry
  const handleAuthenticated = () => {
    localStorage.setItem("authenticated", "true");
    setAuthenticated(true);
    lastActivityRef.current = Date.now();
    setIdle(false);
  };

  return (
    <TranslationProvider>
      <LanguagesProvider>
        <CountriesProvider>
          <ThemeProvider>
            <AppContent
              authenticated={authenticated}
              idle={idle}
              onAuthenticated={handleAuthenticated}
            />
          </ThemeProvider>
        </CountriesProvider>
      </LanguagesProvider>
    </TranslationProvider>
  );
};

export default App;
