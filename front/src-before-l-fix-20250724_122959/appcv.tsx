// File: ./front/src/App.tsx

import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import navigation from "@/components/shared/navbars/navbar.comp";
import footerpage from "@/components/shared/footers/footer-page.comp";
import footertest from "@/components/shared/footers/footer-test.comp";
import floatingbutton from "@/components/elements/floating-button.comp";
import homepage from "@/pages/home.page";
import senderpage from "@/pages/sender.page";
import haulerpage from "@/pages/hauler.page";
import notfoundpage from "@/pages/notfound.page";

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
        </>
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
