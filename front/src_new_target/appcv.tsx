// File: ./front/src/App.tsx

import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/shared/navbars/navbar.comp";
import FooterPage from "@/components/shared/footers/footer-page.comp";
import FooterTest from "@/components/shared/footers/footer-test.comp";
import FloatingButton from "@/components/elements/floating-button.comp";
import HomePage from "@/pages/home.page";
import SenderPage from "@/pages/sender.page";
import HaulerPage from "@/pages/hauler.page";
import NotFoundPage from "@/pages/notfound.page";

const App: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <>
      {/* Header */}
      <header>
        <Navigation isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      </header>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sender" element={<SenderPage />} />
          <Route path="/hauler" element={<HaulerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer>
        <FooterPage onAdminToggle={() => {}} />
        <FloatingButton />
        <FooterTest />
      </footer>
    </>
  );
};

export default App;
