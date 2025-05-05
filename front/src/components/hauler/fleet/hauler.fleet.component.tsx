// File: front/src/components/hauler/fleet/hauler.fleet.component.tsx

import React, { useState, useEffect } from "react";
import  { FleetToolbar } from "./elements/FleetToolbar";

import { FleetModuleConfig } from "./interfaces";
import { FleetImageModule } from "./modules/FleetImageModule";
import { FleetStatusModule } from "./modules/FleetStatusModule";
import { FleetDriverModule } from "./modules/FleetDriverModule";
import { FleetMapModule } from "./modules/FleetMapModule";

import {
  Vehicle,
  mockVehicles,
} from "@/data/mockFleet";
import { mockPeople, Person } from "@/data/mockPeople";

import { SideBar } from "./sections/SideBar";
import  { TopModules } from "./sections/TopModules";
import  { DetailForm } from "./sections/DetailForm";
import  {BottomSections } from "./sections/BottomSections";
import { VehicleEditForm } from "./modules/VehicleEditForm";

import "./fleet.css";

const HaulerFleetComponent: React.FC = () => {
  /* ---------------- state ---------------- */
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* toolbar search */
  const [searchTerm, setSearchTerm] = useState("");

  /* moduly (top panel) */
  const [modules, setModules] = useState<FleetModuleConfig[]>([]);

  /* ---------------- načítanie dát ---------------- */
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setSelected(mockVehicles[0] ?? null);
      setIsLoading(false);
    }, 500);
  }, []);

  /* ---------------- rebuild modules ---------------- */
  useEffect(() => {
    if (!selected) return;

    const driverPerson: Person | undefined = mockPeople.find(
      (p) => `${p.firstName} ${p.lastName}` === selected.driver
    );

    setModules([
      {
        key: "image",
        label: "Obrázok",
        component: <FleetImageModule src={selected.image} alt={selected.name} />,
        visible: true,
      },
      {
        key: "status",
        label: "Status",
        component: <FleetStatusModule vehicle={selected} />,
        visible: true,
      },
      {
        key: "driver",
        label: "Vodič",
        component: <FleetDriverModule driver={driverPerson} />,
        visible: true,
      },
      {
        key: "map",
        label: "Mapa",
        component: (
          <FleetMapModule
            latitude={(selected as any).location?.lat}
            longitude={(selected as any).location?.lng}
          />
        ),
        visible: Boolean((selected as any).location?.lat),
      },
    ]);
  }, [selected]);

  /* ťahanie v dropdown-e */
  const moveModule = (from: number, to: number) => {
    const next = [...modules];
    const [mod] = next.splice(from, 1);
    next.splice(to, 0, mod);
    setModules(next);
  };

  /* toggle viditeľnosti */
  const toggleModule = (key: string) =>
    setModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, visible: !m.visible } : m))
    );

  /* ---------------- render ---------------- */
  return (
    <div className="fleet-card">
      <FleetToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onReset={() => setSearchTerm("")}
        modules={modules}
        onToggleModule={toggleModule}
        onMoveModule={moveModule}
      />

      <div className="fleet-container">
        <aside className="fleet-sidebar">
          <SideBar
            vehicles={vehicles}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </aside>

        <main className="fleet-main">
          {isLoading ? (
            <div className="loading-message">Načítavam...</div>
          ) : selected ? (
            <>
              <TopModules modules={modules} onReorder={moveModule} />

              <DetailForm
                editForm={
                  <VehicleEditForm vehicle={selected} onChange={() => {}} />
                }
              />

              <BottomSections
                vehicleId={selected.id}
                showTrips
                showServices
              />
            </>
          ) : (
            <div className="empty-state">Vyberte vozidlo</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HaulerFleetComponent;
