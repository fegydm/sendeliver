// File: src/App.tsx
// Last change: Added LanguageProvider to prevent multiple useLanguage initializations

import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Navigation from "@/components/sections/navbars/navbar.component";
import HaulerPage from "@/pages/hauler.page";
import SenderPage from "@/pages/sender.page";
// Removed static pages for secret videos
// import JozoPage from "@/pages/jozo.page";
// import LukyPage from "@/pages/luky.page";
import VideoPage from "@/pages/video.page"; // English comment: Dynamic video page for secret videos
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
  // Removed static secret routes
  // SECRET: ["/jozo", "/luky"],
} as const;

const AppContent: React.FC = () => {
  useScrollBounce();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : prefersDark;
  });

  const [isTestFooterVisible, setIsTestFooterVisible] = useState(false);

  // Debugovací useEffect pre detekciu načítavania en.svg
  useEffect(() => {
    console.log('Debug observer initialized');
    
    // Monitorujeme pridávanie elementov do DOM
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            // Skontrolujeme img tagy
            if (node.nodeName === 'IMG') {
              const img = node as HTMLImageElement;
              if (img.src && img.src.includes('en.svg')) {
                console.error('DETECTED EN.SVG IMAGE:', img);
                console.error('Parent element:', img.parentElement);
                console.error('Full path:', img.src);
                
                // Skúsime nájsť komponenty podľa atribútov
                let parent = img.parentElement;
                let i = 0;
                const componentInfo = [];
                
                while (parent && i < 5) {
                  componentInfo.push({
                    element: parent,
                    id: parent.id,
                    className: parent.className,
                    tagName: parent.tagName
                  });
                  parent = parent.parentElement;
                  i++;
                }
                
                console.error('Component hierarchy:', componentInfo);
              }
            }
            
            // Skontrolujeme background-image v style atribúte
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              const style = element.getAttribute('style');
              
              if (style && style.includes('en.svg')) {
                console.error('DETECTED EN.SVG IN STYLE:', element);
                console.error('Style:', style);
              }
              
              // Skontrolujeme aj vnútorné elementy
              const imgs = element.querySelectorAll('img');
              imgs.forEach(img => {
                if (img.src && img.src.includes('en.svg')) {
                  console.error('DETECTED NESTED EN.SVG IMAGE:', img);
                  console.error('Parent component:', img.parentElement);
                }
              });
            }
          });
        }
        
        // Kontrola zmien atribútov
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          const target = mutation.target as HTMLImageElement;
          if (target.src && target.src.includes('en.svg')) {
            console.error('SRC ATTRIBUTE CHANGED TO EN.SVG:', target);
            console.error('Parent:', target.parentElement);
          }
        }
      });
    });
    
    // Začneme sledovať celý dokument
    observer.observe(document.documentElement, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['src', 'style']
    });
    
    // Vypíšeme všetky už existujúce en.svg obrázky
    const existingImages = document.querySelectorAll('img');
    existingImages.forEach(img => {
      if (img.src && img.src.includes('en.svg')) {
        console.error('EXISTING EN.SVG IMAGE:', img);
        console.error('Parent:', img.parentElement);
      }
    });
    
    // Cleanup pri odmontovaní komponentu
    return () => {
      console.log('Debug observer disconnected');
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // English comment: Determine if the current page should hide header and footer.
  const isTestPageWithoutHeaderFooter = [ROUTES.TEST2, ROUTES.TEST1, ROUTES.TEST3].includes(
    window.location.pathname as typeof ROUTES.TEST2
  );

  return (
    <>
      {!isTestPageWithoutHeaderFooter && (
        <header>
          <Navigation isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        </header>
      )}

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

          {/* English comment: Dynamic route for secret videos.
              If the alias exists in videoMap inside VideoPage, it will load the video,
              otherwise it will show an error message. */}
          <Route path="/:alias" element={<VideoPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <div id="result-table-dropdown-container" style={{ position: "relative" }}></div>
      </main>

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
            isVisible={isTestFooterVisible}
            onClose={() => setIsTestFooterVisible(false)}
          />
        </footer>
      )}
    </>
  );
};

// Wrap the entire app in LanguageProvider to prevent multiple useLanguage initializations
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;