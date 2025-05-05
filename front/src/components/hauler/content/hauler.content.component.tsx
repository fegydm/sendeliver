// File: ./front/src/components/hauler/content/hauler.content.component.tsx
// Last change: Applied filtering to menu and restored modal list.

import React, { useState } from "react";
import { Tabs } from "@/components/shared/ui/tabs.ui";
import Button from "@/components/shared/ui/button.ui";
import HaulerDashboard from "./HaulerDashboard";
import HaulerFleetComponent from "../fleet/hauler.fleet.component";
import HaulerPeople from "./HaulerPeople";
import HaulerLogbook from "./HaulerLogbook";
import HaulerExchange from "./HaulerExchange";
import HaulerAnalytics from "./HaulerAnalytics";
import HaulerWebCards from "./HaulerWebCards";
import HaulerBilling from "./HaulerBilling";
import HaulerLocations from "./HaulerLocations";
import "./hauler.cards.css";
import "./hc.component.css";

interface HaulerContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const HaulerContent: React.FC<HaulerContentProps> = ({ activeTab, setActiveTab }) => {
  const haulerMenuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" },
    { id: "analytics", title: "Analytics", icon: "📈" },
    { id: "webcards", title: "WebCard", icon: "🌐" },
    { id: "billing", title: "Billing", icon: "💳" },
    { id: "locations", title: "Locations", icon: "📍" },
    { id: "", title: "", icon: "" },
  ];

  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>(
    haulerMenuItems.reduce((acc, item) => ({ ...acc, [item.id]: item.id !== "" }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleCount = Object.values(visibleCards).filter(Boolean).length;
  const allSelected = haulerMenuItems.filter(item => item.id).every(item => visibleCards[item.id]);

  const handleToggleCard = (id: string) => {
    setVisibleCards(prev => {
      const newVis = { ...prev, [id]: !prev[id] };
      if (id === activeTab && !newVis[id]) {
        const items = haulerMenuItems.map(item => item.id).filter(i => i && newVis[i]);
        const origIndex = haulerMenuItems.map(item => item.id).indexOf(id);
        const next = haulerMenuItems.slice(origIndex + 1).map(item => item.id).find(i => i && newVis[i]);
        const prevVisible = haulerMenuItems
          .slice(0, origIndex)
          .reverse()
          .map(item => item.id)
          .find(i => i && newVis[i]);
        const newActive = next || prevVisible;
        if (newActive) setActiveTab(newActive);
      }
      return newVis;
    });
  };

  const handleToggleAll = () => {
    // Toggle all: if all are selected, deselect all except the activeTab; otherwise select all
    const newVis = haulerMenuItems.reduce((acc, item) => {
      if (!item.id) return acc;
      if (allSelected) {
        // Deselect all except keep activeTab visible
        acc[item.id] = item.id === activeTab;
      } else {
        acc[item.id] = true;
      }
      return acc;
    }, {} as { [key: string]: boolean });

    setVisibleCards(newVis);
    // If activeTab was hidden in other flow, ensure it's valid
    if (!newVis[activeTab]) {
      const first = haulerMenuItems.map(item => item.id).find(i => i && newVis[i]);
      if (first) setActiveTab(first);
    }
  };

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <div className="hc-container">
        <div className="hc-header">
          <div className="hc-title">carriers.sendeliver.com</div>
          <Button
            className="hc-settings-button"
            variant="ghost"
            size="icon"
            role="hauler"
            aria-label="Settings"
            onClick={() => setIsModalOpen(true)}
          >⚙️</Button>
        </div>

        {isModalOpen && (
          <div className="hc-modal">
            <div className="hc-modal-content">
              <h3>Settings</h3>
              {haulerMenuItems.map(item =>
                item.id ? (
                  <label key={item.id} className="settings-item">
                    <input
                      type="checkbox"
                      checked={visibleCards[item.id]}
                      disabled={visibleCount === 1 && visibleCards[item.id]}
                      onChange={() => handleToggleCard(item.id)}
                    />
                    {item.title}
                  </label>
                ) : null
              )}
              <hr className="settings-divider" />
              <label className="settings-item">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                />
                All
              </label>
              <Button
                variant="close"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >✖️</Button>
            </div>
          </div>
        )}

        <div className="hc-menu-container">
          {haulerMenuItems
            .filter(item => item.id && visibleCards[item.id])
            .map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`hc-menu-item ${activeTab === item.id ? "hc-active" : ""}`}
              >
                <div className="hc-menu-icon">{item.icon}</div>
                <div className="hc-menu-title">{item.title}</div>
                <div
                  className={`hc-menu-underline ${
                    activeTab === item.id ? "hc-active" : ""
                  }`}
                />
              </div>
            ))}
        </div>
      </div>

      {haulerMenuItems.map(item =>
        item.id && visibleCards[item.id] ? (
          <Tabs.Content key={item.id} value={item.id}>
            <div className="hauler-card">
              {item.id === "dashboard" && <HaulerDashboard />}
              {item.id === "fleet" && <HaulerFleetComponent />}
              {item.id === "people" && <HaulerPeople />}
              {item.id === "logbook" && <HaulerLogbook />}
              {item.id === "exchange" && <HaulerExchange />}
              {item.id === "analytics" && <HaulerAnalytics />}
              {item.id === "webcards" && <HaulerWebCards />}
              {item.id === "billing" && <HaulerBilling />}
              {item.id === "locations" && <HaulerLocations />}
            </div>
          </Tabs.Content>
        ) : null
      )}
    </Tabs>
  );
};

export default HaulerContent;
