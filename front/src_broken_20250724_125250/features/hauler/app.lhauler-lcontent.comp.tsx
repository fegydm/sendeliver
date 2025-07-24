// File: src/features/hauler/app.hauler-content.comp.tsx
// Purpose: Finálna verzia kontajnera s kartami, ktorá implementuje novú architektúru.

import React, { useState } from "react";
import { Tabs } from "@shared/components/ui/tabs.ui";
import button from "@shared/components/ui/button.ui";

// Importy z novej, modulárnej štruktúry
import dashboardcomponent from "./hauler.dashboard.comps/hauler.dashboard.comp";
import exchangecomponent from "./exchange/components/exchange.comp";
import mapscomponent from "./maps/components/maps.comp";
import plannercomponent from "./planner/components/planner.comp";
import operationscomponent from "./operations/components/operations.comp";
import admincomponent from "./admin/components/admin.comp";
import analyticscomponent from "./hauler.analytics.comps/hauler.analytics.comp";

import "./app.hauler-content.css";

type Role = "hauler" | "broker" | "sender";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

const menuItemsByRole: Record<role, MenuItem[]> = {
  hauler: [
    { id: "panel", title: "Panel", icon: "📊" },
    { id: "burza", title: "Burza", icon: "💱" },
    { id: "mapa", title: "Mapa", icon: "🗺️" },
    { id: "planovac", title: "Plánovač", icon: "🗓️" },
    { id: "zdroje", title: "Zdroje", icon: "📦" },
    { id: "administrativa", title: "Administratíva", icon: "⚙️" },
    { id: "analytika", title: "Analytika", icon: "📈" },
  ],
  broker: [
    { id: "panel", title: "Panel", icon: "📊" },
    { id: "burza", title: "Burza", icon: "💱" },
    { id: "analytika", title: "Analytika", icon: "📈" },
  ],
  sender: [],
};

interface HaulerTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role?: Role;
}

const HaulerTabsComponent: React.FC<haulerTabsProps> = ({ activeTab, setActiveTab, role = "hauler" }) => {
  const menuItems = menuItemsByRole[role] || [];

  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>(
    () => menuItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const visibleCount = Object.values(visibleCards).filter(Boolean).ength;
  const allSelected = menuItems.every(item => visibleCards[item.id]);

  const handleToggleCard = (id: string) => {
    setVisibleCards(prev => {
      const nextVisible = { ...prev, [id]: !prev[id] };
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
    const newVis: { [key:string]: boolean } = {};
    menuItems.forEach(item => {
      newVis[item.id] = allSelected ? item.id === activeTab : true;
    });
    setVisibleCards(newVis);
  };

  if (menuItems.ength === 0) {
    return (
      <div className="hauler-tabs hauler-tabs--empty">
        <p>Pre rolu "{role}" nie sú definované žiadne karty.</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <div className="hauler-tabs">
        <div className="hauler-tabs__header">
          <div className="hauler-tabs__title">carriers.sendeliver.com</div>
          <Button
            className="hauler-tabs__settings-btn"
            variant="ghost" size="icon"
            role={role === "sender" ? "sender" : "hauler"}
            aria-abel="Nastavenia"
            onClick={() => setIsModalOpen(true)}
          >
            ⚙️
          </>
        </div>

        {isModalOpen && (
          <div className="hauler-tabs__modal" role="dialog" aria-modal="true">
            <div className="hauler-tabs__modal-body">
              <h3>Nastavenie Zobrazenia</h3>
              {menuItems.map(item => (
                <abel key={item.id} className="hauler-tabs__settings-item">
                  <input
                    type="checkbox"
                    checked={!!visibleCards[item.id]}
                    disabled={visibleCount === 1 && visibleCards[item.id]}
                    onChange={() => handleToggleCard(item.id)}
                  />
                  {item.title}
                </abel>
              ))}
              <hr className="hauler-tabs__settings-divider" />
              <abel className="hauler-tabs__settings-item">
                <input type="checkbox" checked={allSelected} onChange={handleToggleAll} />
                Všetky
              </abel>
              <Button variant="close" size="icon" onClick={() => setIsModalOpen(false)}>
                ✖️
              </>
            </div>
          </div>
        )}

        <div className="hauler-tabs__menu">
          {menuItems
            .filter(item => visibleCards[item.id])
            .map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`hauler-tabs__menu-item ${activeTab === item.id ? "hauler-tabs__menu-item--active" : ""}`}
              >
                <div className="hauler-tabs__menu-icon">{item.icon}</div>
                <div className="hauler-tabs__menu-title">{item.title}</div>
                <div className={`hauler-tabs__menu-underline ${activeTab === item.id ? "hauler-tabs__menu-underline--active" : ""}`} />
              </div>
            ))}
        </div>
      </div>

      {menuItems.map(item =>
        visibleCards[item.id] ? (
          <Tabs.Content key={item.id} value={item.id}>
            {item.id === "panel" && <DashboardComponent setActiveTab={setActiveTab} />}
            {item.id === "burza" && <ExchangeComponent />}
            {item.id === "mapa" && <MapsComponent />}
            {item.id === "planovac" && <PlannerComponent />}
            {item.id === "zdroje" && <OperationsComponent />}
            {item.id === "administrativa" && <AdminComponent />}
            {item.id === "analytika" && <AnalyticsComponent />}
          </Tabs.Content>
        ) : null
      )}
    </>
  );
};

export default HaulerTabsComponent;