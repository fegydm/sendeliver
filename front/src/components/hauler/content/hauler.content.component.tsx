// File: ./front/src/components/hauler/content/hauler.content.component.tsx
// Last change: Added imports for all card components

import React from "react";
import { Tabs } from "@/components/shared/ui/tabs.ui";
import HaulerDashboard from "./HaulerDashboard";
import HaulerFleet from "./HaulerFleet";
import HaulerPeople from "./HaulerPeople";
import HaulerLogbook from "./HaulerLogbook";
import HaulerExchange from "./HaulerExchange";
import HaulerAnalytics from "./HaulerAnalytics";
import HaulerWebCards from "./HaulerWebCards";
import HaulerBilling from "./HaulerBilling";
import "./hauler.cards.css";
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
    { id: "webcards", title: "WebCard", icon: "🌐" },
    { id: "billing", title: "Billing", icon: "💳" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
      
      {/* Content sections */}
      <Tabs.Content value="dashboard">
        <HaulerDashboard />
      </Tabs.Content>
      
      <Tabs.Content value="fleet">
        <HaulerFleet />
      </Tabs.Content>
      
      <Tabs.Content value="people">
        <HaulerPeople />
      </Tabs.Content>
      
      <Tabs.Content value="logbook">
        <HaulerLogbook />
      </Tabs.Content>
      
      <Tabs.Content value="exchange">
        <HaulerExchange />
      </Tabs.Content>
      
      <Tabs.Content value="analytics">
        <HaulerAnalytics />
      </Tabs.Content>
      
      <Tabs.Content value="webcards">
        <HaulerWebCards />
      </Tabs.Content>
      
      <Tabs.Content value="billing">
        <HaulerBilling />
      </Tabs.Content>
    </Tabs>
  );
};

export default HaulerContent;