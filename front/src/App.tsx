import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HaulerPage from "./pages/hauler.page";
import SenderPage from "./pages/sender.page";
import SecretPage1 from "./pages/secret1.page";
import SecretPage2 from "./pages/secret2.page";
import NotFoundPage from "./pages/notfound.page";
import HomePage from "./pages/home.page";
import TestPage from "./pages/test.page"; // Import TestPage
import useScrollBounce from "./hooks/useScrollBounce";

const App: React.FC = () => {
  useScrollBounce(); // Active scroll bounce effect for Windows

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };

  return (
    <Routes>
      {/* Root path */}
      <Route
        path="/"
        element={<HomePage isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />}
      />

      {/* Sender paths */}
      <Route path="/sender" element={<SenderPage />} />
      <Route path="/client" element={<SenderPage />} />
      <Route path="/clients" element={<SenderPage />} />

      {/* Hauler paths */}
      <Route path="/hauler" element={<HaulerPage />} />
      <Route path="/carrier" element={<HaulerPage />} />
      <Route path="/carriers" element={<HaulerPage />} />

      {/* Test page */}
      <Route path="/test" element={<TestPage />} />

      {/* Secret pages */}
      <Route path="/secret1" element={<SecretPage1 />} />
      <Route path="/secret2" element={<SecretPage2 />} />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
