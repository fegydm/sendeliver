import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.page";
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
      <Route
        path="/"
        element={
          <HomePage
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        }
      />
    </Routes>
  );
};

export default App;