// File: front/src/components/sections/banners/banner-h.component.tsx
// Last change: BannerH now only switches activeTab, fixed styles path

import React from "react";
import "@/styles/sections/banner-h.component.css";

interface BannerHProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BannerH: React.FC<BannerHProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" },
  ];

  return (
    <div className="banner-h-container">
      <div className="banner-h-title">carriers.sendeliver.com</div>

      <div className="banner-h-menu-container">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`banner-h-menu-item ${activeTab === item.id ? "banner-h-active" : ""}`}
          >
            <div className="banner-h-menu-icon">{item.icon}</div>
            <div className="banner-h-menu-title">{item.title}</div>
            <div className={`banner-h-menu-underline ${activeTab === item.id ? "banner-h-active" : ""}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerH;
