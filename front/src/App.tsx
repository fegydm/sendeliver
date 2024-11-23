// ./front/src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.page";

const App: React.FC = () => {
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
    <div className="relative min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
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
    </div>
  );
};

export default App;