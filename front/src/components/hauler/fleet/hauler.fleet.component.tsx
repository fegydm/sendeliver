// ./front/src/components/hauler/fleet/hauler.fleet.component.tsx

import React, { useState, useEffect } from "react";
import { FleetToolbar } from "./elements/FleetToolbar";
import { FleetModuleConfig } from "./interfaces";
import { FleetImageModule } from "./modules/FleetImageModule";
import { FleetStatusModule } from "./modules/FleetStatusModule";
import { FleetDriverModule } from "./modules/FleetDriverModule";
import { FleetMapModule } from "./modules/FleetMapModule";
import { FleetUnitModule } from "./modules/FleetUnitModule";
import { Vehicle, mockVehicles } from "@/data/mockFleet";
import { mockPeople, Person } from "@/data/mockPeople";
import { SideBar } from "./sections/SideBar";
import { TopModules } from "./sections/TopModules";
import { DetailForm } from "./sections/DetailForm";
import { BottomSections } from "./sections/BottomSections";
import { VehicleEditForm } from "./modules/VehicleEditForm";
import { Button } from "@/components/shared/ui/button.ui";
import "./fleet.css";

const HaulerFleetComponent: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<FleetModuleConfig[]>([]);

  // Load mock data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVehicles(mockVehicles);
      setSelected(mockVehicles[0] ?? null);
      setIsLoading(false);
    }, 500);
  }, []);

  // Rebuild modules when selected vehicle changes
  useEffect(() => {
    if (!selected) return;
    const driverPerson: Person | undefined = mockPeople.find(
      (p) => `${p.firstName} ${p.lastName}` === selected.driver
    );
    setModules([
      {
        key: "image",
        label: "Obrázok",
        component: <FleetImageModule src={selected.image} alt={selected.name} type={selected.type} />,
        visible: true,
      },
      {
        key: "status",
        label: "Status",
        component: <FleetStatusModule vehicle={selected} />,
        visible: true,
      },
      {
        key: "unit",
        label: "Unit",
        component: <FleetUnitModule vehicle={selected} />,
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
        component: <FleetMapModule latitude={(selected as any).location?.lat} longitude={(selected as any).location?.lng} />,
        visible: Boolean((selected as any).location?.lat),
      },
    ]);
  }, [selected]);

  // Move module
  const moveModule = (from: number, to: number) => {
    const next = [...modules];
    const [mod] = next.splice(from, 1);
    next.splice(to, 0, mod);
    setModules(next);
  };

  // Toggle module visibility
  const toggleModule = (key: string) =>
    setModules((prev) =>
      prev.map((m) => (m.key === key ? { ...m, visible: !m.visible } : m))
    );

  // Add new vehicle
  const handleAddVehicle = () => {
    const newVehicle: Vehicle = {
      id: `new-${Date.now()}`,
      name: "Nové vozidlo",
      type: "Nákladné",
      status: "Dostupné",
      image: "/fleet/placeholder.jpg",
      driver: "",
      location: undefined,
      plateNumber: "XX123YY",
      brand: "Unknown",
      manufactureYear: 2023,
      capacity: "0t",
      odometerKm: 0,
      capacityFree: "0t",
      availability: "available",
    };
    setVehicles([newVehicle, ...vehicles]);
    setSelected(newVehicle);
  };

  // Delete vehicle
  const handleDeleteVehicle = () => {
    if (!selected) return;
    if (window.confirm(`Naozaj chcete odstrániť vozidlo "${selected.name}"?`)) {
      const updatedVehicles = vehicles.filter(v => v.id !== selected.id);
      setVehicles(updatedVehicles);
      setSelected(updatedVehicles[0] ?? null);
    }
  };

  // Handle vehicle field changes
  const handleVehicleChange = (field: keyof Vehicle, value: any) => {
    if (!selected) return;
    const updatedVehicle = { ...selected, [field]: value };
    setSelected(updatedVehicle);
    setVehicles(vehicles.map(v => (v.id === updatedVehicle.id ? updatedVehicle : v)));
  };

  return (
    <div className="fleet-container">
      {/* Toolbar */}
      <div className="fleet-toolbar">
        <div className="fleet-toolbar-left">
          <span className="fleet-count">{vehicles.length} vozidiel</span>
          <Button variant="ghost" size="icon" title="Pridať vozidlo" onClick={handleAddVehicle}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
          </Button>
          <Button variant="ghost" size="icon" title="Odstrániť vozidlo" onClick={handleDeleteVehicle} disabled={!selected}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path>
            </svg>
          </Button>
        </div>
        <div className="fleet-toolbar-right">
          <FleetToolbar
            searchTerm=""
            onSearchChange={() => {}}
            onReset={() => {}}
            modules={modules}
            onToggleModule={toggleModule}
            onMoveModule={moveModule}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="fleet-content">
        {/* Sidebar */}
        <div className="fleet-sidebar">
          {isLoading ? (
            <div className="loading-message">Načítavam...</div>
          ) : (
            <SideBar
              vehicles={vehicles}
              selectedId={selected?.id}
              onSelect={setSelected}
            />
          )}
        </div>

        {/* Details */}
        <div className="fleet-details">
          {selected ? (
            <>
              <div className="vehicle-photo-large-container">
                <div className="vehicle-photo-wrapper">
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="vehicle-photo-large"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/fleet/placeholder.jpg";
                      target.classList.add("fallback-image");
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="fleet-details-scroll-container">
                <TopModules modules={modules} onReorder={moveModule} />
                <DetailForm
                  editForm={<VehicleEditForm vehicle={selected} onChange={handleVehicleChange} />}
                />
                <BottomSections vehicleId={selected.id} showTrips showServices />
              </div>
            </>
          ) : (
            <div className="no-selection-message">Vyberte vozidlo zo zoznamu</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaulerFleetComponent;