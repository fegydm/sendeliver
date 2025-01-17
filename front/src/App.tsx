// File: ./front/src/App.tsx
// Last change: Fixed TypeScript error for window.location.pathname and added Test3Page

import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navigation from "@/components/sections/navbars/navbar.component";
import HaulerPage from "./pages/hauler.page";
import SenderPage from "./pages/sender.page";
import SecretPage1 from "./pages/secret1.page";
import SecretPage2 from "./pages/secret2.page";
import NotFoundPage from "../public/notfound.page";
import HomePage from "./pages/home.page";
import TestPage from "./pages/test.page";
import Test2Page from "./pages/test2";
import Test1Page from "./pages/test1";
import Test3Page from "./pages/test3";
import FooterPage from "@/components/sections/footers/footer-page.component";
import useScrollBounce from "./hooks/useScrollBounce";
import { TestFooterProvider } from "./lib/test-footer-context";

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

  // Determine if the current route is Test2Page, Test1Page, or Test3Page for conditional rendering
  const isTestPageWithoutHeaderFooter = [ROUTES.TEST2, ROUTES.TEST1, ROUTES.TEST3].includes(
    window.location.pathname as typeof ROUTES.TEST2
  );

  return (
    <>
      {/* Header Section - hidden for Test2Page, Test1Page, and Test3Page */}
      {!isTestPageWithoutHeaderFooter && (
        <header>
          <Navigation isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        </header>
      )}

      {/* Main Content Section */}
      <main>
        <Routes>
          <Route path={ROUTES.HOME} element={<HomePage />} />

          {ROUTES.SENDER.map(path => (
            <Route key={path} path={path} element={<SenderPage />} />
          ))}

          {ROUTES.HAULER.map(path => (
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

      {/* Footer Section - hidden for Test2Page, Test1Page, and Test3Page */}
      {!isTestPageWithoutHeaderFooter && (
        <footer>
          <TestFooterProvider>
            <FooterPage onPinVerified={() => {}} />
          </TestFooterProvider>
        </footer>
      )}
    </>
  );
};

export default App;
