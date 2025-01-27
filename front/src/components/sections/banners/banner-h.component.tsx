// File: front/src/components/banner-h.component.tsx
// Last change: Renamed CSS classes to match the "banner-h" convention.

import React, { useState } from "react";
import "@/styles/sections/banner-h.component.css" 

const BannerH: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" },
  ];

  return (
    <div className={`banner-h-container ${activeCard === "dark" ? "banner-h-dark" : ""}`}>
      <div className="banner-h-title">carriers.sendeliver.com</div>

      <div className="banner-h-menu-container">
        {menuItems.map((item) => {
          const isActive = activeCard === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveCard(item.id)}
              className={`banner-h-menu-item ${isActive ? "banner-h-active" : ""}`}
            >
              <div className="banner-h-menu-icon">{item.icon}</div>
              <div className="banner-h-menu-title">{item.title}</div>
              <div className={`banner-h-menu-underline ${isActive ? "banner-h-active" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerH;
