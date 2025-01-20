// File: ./front/src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "@/components/sections/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
import SecretPage1 from "@/pages/secret1.page";
import SecretPage2 from "@/pages/secret2.page";
import NotFoundPage from "@/pages/notfound.page";
import HomePage from "@/pages/home.page";
import TestPage from "@/pages/test.page";
import Test2Page from "@/pages/test2";
import Test1Page from "@/pages/test1";
import Test3Page from "@/pages/test3";
import FooterPage from "@/components/sections/footers/footer-page.component";
import FooterTest from "@/components/sections/footers/footer-test.component";
import FloatingButton from "@/components/elements/floating-button.element";
import useScrollBounce from "@/hooks/useScrollBounce";

const ROUTES = {
  HOME: "/",
  SENDER: ["/sender", "/client", "/clients"],
  HAULER: ["/hauler", "/carrier", "/carriers"],
  TEST: "/test",
  TEST2: "/test2",
  TEST1: "/test1",
  TEST3: "/test3",
  SECRET: ["/secret1", "/secret2"],
} as const;

const App: React.FC = () => {
  useScrollBounce();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : prefersDark;
  });

  const [isTestFooterVisible, setIsTestFooterVisible] = useState(() => {
    // Retrieve the visibility state from localStorage or default
    const savedState = localStorage.getItem("isTestFooterVisible");
    return savedState ? JSON.parse(savedState) : process.env.NODE_ENV === "development";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const handleTestFooterClose = () => {
    setIsTestFooterVisible(false);
    localStorage.removeItem("isTestFooterVisible");
  };

  const isTestPageWithoutHeaderFooter = [ROUTES.TEST2, ROUTES.TEST1, ROUTES.TEST3].includes(
    window.location.pathname as typeof ROUTES.TEST2
  );

  return (
    <>
      {/* Header Section */}
      {!isTestPageWithoutHeaderFooter && (
        <header>
          <Navigation isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        </header>
      )}

      {/* Main Content Section */}
      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />

          {ROUTES.SENDER.map((path) => (
            <Route key={path} path={path} element={<SenderPage />} />
          ))}

          {ROUTES.HAULER.map((path) => (
            <Route key={path} path={path} element={<HaulerPage />} />
          ))}

          <Route path={ROUTES.TEST} element={<TestPage />} />
          <Route path={ROUTES.TEST2} element={<Test2Page />} />
          <Route path={ROUTES.TEST1} element={<Test1Page />} />
          <Route path={ROUTES.TEST3} element={<Test3Page />} />

          <Route path="/secret1" element={<SecretPage1 />} />
          <Route path="/secret2" element={<SecretPage2 />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer Section */}
{!isTestPageWithoutHeaderFooter && (
  <footer>
    <FooterPage
      onAdminToggle={setIsTestFooterVisible}
      isTestFooterVisible={isTestFooterVisible}
    />
    <div className="footer-floating">
      <FloatingButton />
    </div>
    <FooterTest
      isVisible={isTestFooterVisible} // Pass visibility state
      onClose={() => setIsTestFooterVisible(false)} // Close logic
    />
  </footer>
)}


    </>
  );
};

export default App;
