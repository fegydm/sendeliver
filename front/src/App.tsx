// File: src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
// Import all providers
import { TranslationProvider } from "@/contexts/TranslationContext";
import { LanguagesProvider } from "@/contexts/LanguagesContext";
import { CountriesProvider } from "@/contexts/CountriesContext";
import { ThemeProvider } from "@/contexts/ThemeContext"; // Import ThemeProvider
import Navigation from "@/components/shared/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
import VideoPage from "@/pages/video.page";
import NotFoundPage from "@/pages/notfound.page";
import HomePage from "@/pages/home.page";
import TestPage from "@/pages/test.page";
import Test2Page from "@/pages/test2";
import Test1Page from "@/pages/test1";
import Test3Page from "@/pages/test3";
import DocumentationPage from "@/pages/DocumentationPage";
import FooterPage from "@/components/shared/footers/footer-page.component";
import FooterTest from "@/components/shared/footers/footer-test.component";
import FloatingButton from "@/components/shared/elements/floating-button.element";
import useScrollBounce from "@/hooks/useScrollBounce";

const ROUTES = {
  HOME: "/",
  SENDER: ["/sender", "/client", "/clients"],
  HAULER: ["/hauler", "/carrier", "/carriers"],
  TEST: "/test",
  TEST2: "/test2",
  TEST1: "/test1",
  TEST3: "/test3",
} as const;

const App: React.FC = () => {
  useScrollBounce();

  // State for test footer visibility
  const [isTestFooterVisible, setIsTestFooterVisible] = React.useState<boolean>(false);

  return (
    <TranslationProvider>
      <LanguagesProvider>
        <CountriesProvider>
          <ThemeProvider>
            <header>
              {/* Navigation no longer needs dark mode props */}
              <Navigation />
            </header>
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
                <Route path="/dokumentacia" element={<DocumentationPage />} />
                <Route path="/:alias" element={<VideoPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <footer>
              <FooterPage
                onAdminToggle={setIsTestFooterVisible}
                isTestFooterVisible={isTestFooterVisible}
              />
              <div className="footer__floating">
                <FloatingButton />
              </div>
              <FooterTest
                isVisible={isTestFooterVisible}
                onClose={() => setIsTestFooterVisible(false)}
              />
            </footer>
          </ThemeProvider>
        </CountriesProvider>
      </LanguagesProvider>
    </TranslationProvider>
  );
};

export default App;