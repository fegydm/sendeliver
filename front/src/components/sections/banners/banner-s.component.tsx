// ./front/src/components/banner-s.component.tsx
import React, { useState } from "react";
import "./banner-s.css-component.css"; // Import CSS styles

const BannerS: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("dashboard");

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "orders", title: "Orders", icon: "📦" },
    { id: "exchange", title: "Exchange", icon: "💱" },
  ];

  return (
    <div className={`banner-container ${activeCard === "dark" ? "dark" : ""}`}>
      <div className="banner-title">clients.sendeliver.com</div>

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

export default BannerS;
