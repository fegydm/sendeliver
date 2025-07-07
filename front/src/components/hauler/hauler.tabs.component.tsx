// File: ./front/src/components/hauler/hauler.tabs.component.tsx
// Purpose: Role-aware tab container for the Hauler area, following BEM naming (block: hauler-tabs)
// Comments are in English as requested.

import React, { useState } from "react";
import { Tabs } from "@/components/shared/ui/tabs.ui";
import Button from "@/components/shared/ui/button.ui";

// Import tab screens – keep these as-is; they decide internally what to show
import HaulerDashboard from "./content/HaulerDashboard";
import HaulerFleetComponent from "./content/HaulerFleetComponent";
import HaulerPeople from "./content/HaulerPeople";
import HaulerLogbook from "./content/HaulerLogbook";
import HaulerExchange from "./content/HaulerExchange";
import HaulerAnalytics from "./content/HaulerAnalytics";
import HaulerWebCards from "./content/HaulerWebCards";
import HaulerBilling from "./content/HaulerBilling";
import HaulerLocations from "./content/HaulerLocations";

import "./hauler.tabs.component.css"; // BEM-named stylesheet

// -------------------------
// Types & Constants
// -------------------------

type Role = "hauler" | "broker" | "sender";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

// Map roles → their visible menu items (shared items reuse the same id)
const menuItemsByRole: Record<Role, MenuItem[]> = {
  hauler: [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" },
    { id: "analytics", title: "Analytics", icon: "📈" },
    { id: "webcards", title: "WebCard", icon: "🌐" },
    { id: "billing", title: "Billing", icon: "💳" },
    { id: "locations", title: "Locations", icon: "📍" },
  ],
  broker: [
    // Broker shares most cards; adapt if needed
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "exchange", title: "Exchange", icon: "💱" },
    { id: "analytics", title: "Analytics", icon: "📈" },
    { id: "locations", title: "Locations", icon: "📍" },
  ],
  sender: [], // Sender has its own page – expose empty list here for clarity
};

interface HaulerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role?: Role; // default = "hauler"
}

const HaulerTabs: React.FC<HaulerTabsProps> = ({ activeTab, setActiveTab, role = "hauler" }) => {
  // Visible menu items come from role mapping
  const menuItems = menuItemsByRole[role];

  // Initialise visibility map (every item visible by default)
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>(
    () => menuItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helpers -----------------------------------------------------
  const visibleCount = Object.values(visibleCards).filter(Boolean).length;
  const allSelected = menuItems.every(item => visibleCards[item.id]);

  const handleToggleCard = (id: string) => {
    setVisibleCards(prev => {
      const nextVisible = { ...prev, [id]: !prev[id] };

      // If we just hid the active tab, select the next/prev visible one
      if (id === activeTab && !nextVisible[id]) {
        const ids = menuItems.map(m => m.id);
        const currentIdx = ids.indexOf(id);
        const next = ids.slice(currentIdx + 1).find(i => nextVisible[i]);
        const previous = ids.slice(0, currentIdx).reverse().find(i => nextVisible[i]);
        setActiveTab(next || previous || "");
      }

      return nextVisible;
    });
  };

  const handleToggleAll = () => {
    const newVis: { [key: string]: boolean } = {};
    menuItems.forEach(item => {
      newVis[item.id] = allSelected ? item.id === activeTab : true;
    });
    setVisibleCards(newVis);
  };

  // Nothing to render (e.g. role = sender) ----------------------
  if (menuItems.length === 0) {
    return (
      <div className="hauler-tabs hauler-tabs--empty">
        {/* Empty state for roles without tabs */}
        <p>No tabs defined for role "{role}".</p>
      </div>
    );
  }

  // -------------------------
  // Render
  // -------------------------

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <div className="hauler-tabs">
        {/* Header */}
        <div className="hauler-tabs__header">
          <div className="hauler-tabs__title">carriers.sendeliver.com</div>
          <Button
            className="hauler-tabs__settings-btn"
            variant="ghost"
            size="icon"
            // ButtonProps.role accepts only "hauler" | "sender" | undefined; map broker → hauler for styling.
            role={role === "sender" ? "sender" : "hauler"}
            aria-label="Settings"
            onClick={() => setIsModalOpen(true)}
          >
            ⚙️
          </Button>
        </div>

        {/* Settings modal */}
        {isModalOpen && (
          <div className="hauler-tabs__modal" role="dialog" aria-modal="true">
            <div className="hauler-tabs__modal-body">
              <h3>Settings</h3>
              {menuItems.map(item => (
                <label key={item.id} className="hauler-tabs__settings-item">
                  <input
                    type="checkbox"
                    checked={visibleCards[item.id]}
                    disabled={visibleCount === 1 && visibleCards[item.id]}
                    onChange={() => handleToggleCard(item.id)}
                  />
                  {item.title}
                </label>
              ))}
              <hr className="hauler-tabs__settings-divider" />
              <label className="hauler-tabs__settings-item">
                <input type="checkbox" checked={allSelected} onChange={handleToggleAll} />
                All
              </label>
              <Button variant="close" size="icon" onClick={() => setIsModalOpen(false)}>
                ✖️
              </Button>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="hauler-tabs__menu">
          {menuItems
            .filter(item => visibleCards[item.id])
            .map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={
                  "hauler-tabs__menu-item" + (activeTab === item.id ? " hauler-tabs__menu-item--active" : "")
                }
              >
                <div className="hauler-tabs__menu-icon">{item.icon}</div>
                <div className="hauler-tabs__menu-title">{item.title}</div>
                <div
                  className={
                    "hauler-tabs__menu-underline" + (activeTab === item.id ? " hauler-tabs__menu-underline--active" : "")
                  }
                />
              </div>
            ))}
        </div>
      </div>

      {/* Tabs content – rendered only if the card is visible */}
      {menuItems.map(item =>
        visibleCards[item.id] ? (
          <Tabs.Content key={item.id} value={item.id}>
            {item.id === "dashboard" && <HaulerDashboard />}
            {item.id === "fleet" && <HaulerFleetComponent />}
            {item.id === "people" && <HaulerPeople />}
            {item.id === "logbook" && <HaulerLogbook />}
            {item.id === "exchange" && <HaulerExchange />}
            {item.id === "analytics" && <HaulerAnalytics />}
            {item.id === "webcards" && <HaulerWebCards />}
            {item.id === "billing" && <HaulerBilling />}
            {item.id === "locations" && <HaulerLocations />}
          </Tabs.Content>
        ) : null
      )}
    </Tabs>
  );
};

export default HaulerTabs;
