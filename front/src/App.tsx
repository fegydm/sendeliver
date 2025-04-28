// File: src/App.tsx
import React, { useState, useEffect } from "react";
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
import NotFoundPage from "@/pages/notfound.page";
import HomePage from "@/pages/home.page";
import DocumentationPage from "@/pages/DocumentationPage";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FooterTest from "@/components/shared/footers/footer-test.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";
import useScrollBounce from "@/hooks/useScrollBounce";
import PinForm from "@/components/shared/elements/pin-form.element";

// Routes
const ROUTES = {
  HOME: "/",
  SENDER: ["/sender", "/client", "/clients"],
  HAULER: ["/hauler", "/carrier", "/carriers"],
  TEST: "/test",
  TEST2: "/test2",
  TEST1: "/test1",
  TEST3: "/test3",
} as const;

// Idle timeout: 3 minutes
const IDLE_TIMEOUT = 10 * 60 * 1000;

// Main app content when authenticated and active
const AppContent: React.FC = () => {
  useScrollBounce();
  const { theme } = useTheme();
  const [isTestFooterVisible, setIsTestFooterVisible] = useState(false);

  return (
    <div data-theme={theme}>
      <header><Navigation /></header>
      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          {ROUTES.SENDER.map(path => <Route key={path} path={path} element={<SenderPage />} />)}
          {ROUTES.HAULER.map(path => <Route key={path} path={path} element={<HaulerPage />} />)}
          <Route path="/dokumentacia" element={<DocumentationPage />} />
          <Route path="/:alias" element={<VideoPage />} />
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

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem("authenticated") === "true";
  });
  const [idle, setIdle] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Update lastActivity and reset idle on user interaction
  useEffect(() => {
    if (!authenticated) return;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];  
    const handleActivity = () => {
      setLastActivity(Date.now());
      setIdle(false);
    };
    events.forEach(evt => window.addEventListener(evt, handleActivity));
    // cleanup
    return () => events.forEach(evt => window.removeEventListener(evt, handleActivity));
  }, [authenticated]);

  // Check idle timeout periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (authenticated && Date.now() - lastActivity > IDLE_TIMEOUT) {
        setIdle(true);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [authenticated, lastActivity]);

  const handleCorrectPin = () => {
    localStorage.setItem("authenticated", "true");
    setAuthenticated(true);
    setIdle(false);
    setLastActivity(Date.now());
  };

  // Show PIN form until authenticated and active
  if (!authenticated || idle) {
    return <PinForm domain="hauler" onCorrectPin={handleCorrectPin} />;
  }

  return <AppContent />;
};

// Root with providers
const Root: React.FC = () => (
  <TranslationProvider>
    <LanguagesProvider>
      <CountriesProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </CountriesProvider>
    </LanguagesProvider>
  </TranslationProvider>
);

export default Root;
