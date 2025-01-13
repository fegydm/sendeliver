// ./front/src/pages/sender.page.tsx
import React, { useEffect, useState } from "react";
import Navigation from "@/components/sections/navbars/navbar.component";
import BannerS from "@/components/sections/banners/banner-s.component"; // Import BannerS
import UnderConstruction from "@/components/elements/under-construction.element";
// import "./sender.page.css"; // Import CSS styles

const SenderPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className={`sender-page ${isDarkMode ? "dark" : ""}`}>
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <BannerS /> {/* Dynamically renders the Sender banner */}
      <UnderConstruction />
    </div>
  );
};

export default SenderPage;
