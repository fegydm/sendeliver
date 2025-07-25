// File: front/src/components/hauler/banner/hauler.content.component.tsx
// Component for the top navigation banner, supports hauler section only

import React from "react";
import "./hc.component.css";

interface HaulerContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const HaulerContent: React.FC<HaulerContentProps> = ({ activeTab, setActiveTab }) => {
  // Menu items for hauler (Carriers)
  const haulerMenuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" },
    { id: "analytics", title: "Analytics", icon: "📈" },
    { id: "webcards", title: "WebCards", icon: "🌐" },
    { id: "billing", title: "Billing", icon: "💳" },
  ];

  return (
    <div className="hc-container">
      <div className="hc-title">carriers.sendeliver.com</div>

      <div className="hc-menu-container">
        {haulerMenuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`hc-menu-item ${activeTab === item.id ? "hc-active" : ""}`}
          >
            <div className="hc-menu-icon">{item.icon}</div>
            <div className="hc-menu-title">{item.title}</div>
            <div className={`hc-menu-underline ${activeTab === item.id ? "hc-active" : ""}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HaulerContent;