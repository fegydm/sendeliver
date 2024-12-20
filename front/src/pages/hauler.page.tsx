// ./front/src/pages/hauler.page.tsx
import React, { useEffect, useState } from "react";
import Navigation from "@/components/sections/navbars/navbar.component";
import BannerH from "@/components/sections/banners/banner-h.component";
import UnderConstruction from "@/components/elements/under-construction.element";
import "./hauler.page.css"; // Import CSS styles

const HaulerPage: React.FC = () => {
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
    <div className={`hauler-page ${isDarkMode ? "dark" : ""}`}>
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      <BannerH />
      <UnderConstruction />
    </div>
  );
};

export default HaulerPage;
