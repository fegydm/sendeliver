// File: front/src/apps/hauler/tabs.hauler.tsx
// Last change: Final refactoring with new UI logic and naming conventions.

import React, { useState, useCallback } from "react";
import { Tabs } from "@/shared/ui/tabs.ui";
import Button from "@/shared/ui/button.ui";
import GeneralModal from "@/shared/modals/general.modal";
import ContextMenuTabsHauler, { ContextAction } from "./context-menu.tabs.hauler";

import DashboardComponent from "./dashboard/dashboard";
import ExchangeComponent from "./exchange/exchange";
import MapsComponent from "./maps/maps";
import PlannerComponent from "./planner/planner";
import OperationsComponent from "./operations/operations";
import AdminComponent from "./admin/admin";
import AnalyticsComponent from "./analytics/analytics";

import "./tabs.hauler.css";
import "./context-menu.tabs.hauler.css";

type Role = "hauler" | "broker" | "sender";

interface MenuItem {
  id: string;
  title: string;
  icon: string;
}

const menuItemsByRole: Record<Role, MenuItem[]> = {
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

const TabsHauler: React.FC<HaulerTabsProps> = ({ activeTab, setActiveTab, role = "hauler" }) => {
  const menuItems = menuItemsByRole[role] || [];
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>(
    () => menuItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean; tabId: string | null; }>({ x: 0, y: 0, visible: false, tabId: null });

  const visibleCount = Object.values(visibleCards).filter(Boolean).length;
  const allSelected = menuItems.every(item => visibleCards[item.id]);

  const handleToggleCard = useCallback((id: string) => {
    setVisibleCards(prev => {
      const newVisible = { ...prev, [id]: !prev[id] };
      if (id === activeTab && !newVisible[id]) {
        const ids = menuItems.map(m => m.id);
        const currentIdx = ids.indexOf(id);
        const next = ids.slice(currentIdx + 1).find(i => newVisible[i]);
        const previous = ids.slice(0, currentIdx).reverse().find(i => newVisible[i]);
        setActiveTab(next || previous || "");
      }
      return newVisible;
    });
  }, [activeTab, menuItems, setActiveTab]);

  const handleToggleAll = () => {
    const newVis: { [key:string]: boolean } = {};
    menuItems.forEach(item => { newVis[item.id] = allSelected ? item.id === activeTab : true; });
    setVisibleCards(newVis);
  };

  const handleContextMenu = (event: React.MouseEvent, tabId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.pageX, y: event.pageY, visible: true, tabId });
  };

  const getContextActions = (tabId: string): ContextAction[] => {
    return [
      { label: "Zavrieť", action: () => handleToggleCard(tabId), disabled: visibleCount <= 1 },
      { label: "Zavrieť ostatné", action: () => {
          const newVis: { [key:string]: boolean } = {};
          menuItems.forEach(item => { newVis[item.id] = item.id === tabId; });
          setVisibleCards(newVis);
        },
        disabled: visibleCount <= 1
      },
    ];
  };

  if (menuItems.length === 0) {
    return (
      <div className="hauler-tabs hauler-tabs--empty">
        <p>Pre rolu "{role}" nie sú definované žiadne karty.</p>
      </div>
    );
  }

  return (
    <>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <div className="hauler-tabs">
          <div className="hauler-tabs__header">
            <div className="hauler-tabs__title">carriers.sendeliver.com</div>
          </div>

          <div className="hauler-tabs__menu">
            {menuItems.filter(item => visibleCards[item.id]).map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                onContextMenu={(e) => handleContextMenu(e, item.id)}
                className={`hauler-tabs__menu-item ${activeTab === item.id ? "hauler-tabs__menu-item--active" : ""}`}
              >
                <div className="hauler-tabs__menu-icon">{item.icon}</div>
                <div className="hauler-tabs__menu-title">{item.title}</div>
                <div className={`hauler-tabs__menu-underline ${activeTab === item.id ? "hauler-tabs__menu-underline--active" : ""}`} />
              </div>
            ))}
            <Button
              className="hauler-tabs__add-btn"
              variant="ghost" size="icon"
              onClick={() => setIsModalOpen(true)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="hauler-tabs__content-wrapper">
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
        </div>
      </Tabs>

      <GeneralModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nastavenie zobrazenia kariet"
      >
        <div className="hauler-tabs__modal-body">
          {menuItems.map(item => (
            <label key={item.id} className="hauler-tabs__settings-item">
              <input
                type="checkbox"
                checked={!!visibleCards[item.id]}
                disabled={visibleCount === 1 && visibleCards[item.id]}
                onChange={() => handleToggleCard(item.id)}
              />
              {item.title}
            </label>
          ))}
          <hr className="hauler-tabs__settings-divider" />
          <label className="hauler-tabs__settings-item">
            <input type="checkbox" checked={allSelected} onChange={handleToggleAll} />
            Zobraziť všetky
          </label>
        </div>
      </GeneralModal>

      {contextMenu.visible && contextMenu.tabId && (
        <ContextMenuTabsHauler
          x={contextMenu.x}
          y={contextMenu.y}
          actions={getContextActions(contextMenu.tabId)}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}
    </>
  );
};

export default TabsHauler;
