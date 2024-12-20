// ./front/src/components/banner-h.component.tsx
import React, { useState } from "react";
import "./banner-h.component.css"; // Import CSS styles

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
    <div className={`banner-container ${activeCard === "dark" ? "dark" : ""}`}>
      <div className="banner-title">carriers.sendeliver.com</div>

      <div className="menu-container">
        {menuItems.map((item) => {
          const isActive = activeCard === item.id;

          return (
            <div
              key={item.id}
              onClick={() => setActiveCard(item.id)}
              className={`menu-item ${isActive ? "active" : ""}`}
            >
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-title">{item.title}</div>
              <div className={`menu-underline ${isActive ? "active" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BannerH;
