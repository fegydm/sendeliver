// File: front/src/components/banner-s.component.tsx
// Last change: Renamed CSS classes to ensure isolation.

import React, { useState } from "react";
// import "./banner-s.component.css"; // Corrected import for CSS styles

const BannerS: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "orders", title: "Orders", icon: "📦" },
    { id: "exchange", title: "Exchange", icon: "💱" },
  ];

  return (
    <div className={`banner-s-container ${activeCard === "dark" ? "banner-s-dark" : ""}`}>
      <div className="banner-s-title">clients.sendeliver.com</div>

      <div className="banner-s-menu-container">
        {menuItems.map((item) => {
          const isActive = activeCard === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveCard(item.id)}
              className={`banner-s-menu-item ${isActive ? "banner-s-active" : ""}`}
            >
              <div className="banner-s-menu-icon">{item.icon}</div>
              <div className="banner-s-menu-title">{item.title}</div>
              <div className={`banner-s-menu-underline ${isActive ? "banner-s-active" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerS;
