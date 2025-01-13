// File: ./front/src/App.tsx
// Last change: Cleaned up dark mode handling and routing logic

import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HaulerPage from "./pages/hauler.page";
import SenderPage from "./pages/sender.page";
import SecretPage1 from "./pages/secret1.page";
import SecretPage2 from "./pages/secret2.page";
import NotFoundPage from "./pages/notfound.page";
import HomePage from "./pages/home.page";
import TestPage from "./pages/test.page";
import useScrollBounce from "./hooks/useScrollBounce";
import { TestFooterProvider } from "./lib/test-footer-context";

// Define route constants for better readability and maintenance
const ROUTES = {
  HOME: "/",
  SENDER: ["/sender", "/client", "/clients"],
  HAULER: ["/hauler", "/carrier", "/carriers"],
  TEST: "/test",
  SECRET: ["/secret1", "/secret2"],
} as const;

const App: React.FC = () => {
  useScrollBounce();

  // State for dark mode, using system preference fallback
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : prefersDark;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <TestFooterProvider>
      <Routes>
        {/* Home Route */}
        <Route path={ROUTES.HOME} element={<HomePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />} />

        {/* Sender Routes */}
        {ROUTES.SENDER.map(path => (
          <Route key={path} path={path} element={<SenderPage />} />
        ))}

        {/* Hauler Routes */}
        {ROUTES.HAULER.map(path => (
          <Route key={path} path={path} element={<HaulerPage />} />
        ))}

        {/* Test Route */}
        <Route path={ROUTES.TEST} element={<TestPage />} />

        {/* Secret Routes */}
        <Route path="/secret1" element={<SecretPage1 />} />
        <Route path="/secret2" element={<SecretPage2 />} />

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TestFooterProvider>
  );
};

export default App;
