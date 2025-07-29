// File: src/apps/hauler/operations/fleet/sidebar.fleet.tsx
// Last change: Fixed import path and TypeScript errors with undefined values

import React, { useState, useMemo } from "react";
import { Sidebar, SidebarFilter } from "@/shared/layouts/sidebar/sidebar";
import { ListItem } from "@/shared/elements/list-item.element";
import { Vehicle } from "@/data/mockFleet";
import "./sidebar.fleet.css";

interface SidebarFleetProps {
  vehicles: Vehicle[];
  selectedId?: string;
  onSelect: (vehicle: Vehicle) => void;
  isLoading?: boolean;
}

export const SidebarFleet: React.FC<SidebarFleetProps> = ({
  vehicles,
  selectedId,
  onSelect,
  isLoading = false
}) => {
  // Local filter state
  const [quickSearch, setQuickSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Generate filter options from vehicles
  const typeOptions = useMemo(() => {
    const types = vehicles
      .map(v => v.type)
      .filter((type): type is string => Boolean(type))
      .filter((type, index, arr) => arr.indexOf(type) === index)
      .sort();
      
    return [
      { value: "All", label: "All Types" },
      ...types.map(type => ({ value: type, label: type }))
    ];
  }, [vehicles]);

  const statusOptions = useMemo(() => {
    const statuses = vehicles
      .map(v => v.status)
      .filter((status): status is string => Boolean(status))
      .filter((status, index, arr) => arr.indexOf(status) === index)
      .sort();
      
    return [
      { value: "All", label: "All Statuses" },
      ...statuses.map(status => ({ value: status, label: status }))
    ];
  }, [vehicles]);

  // Define filters configuration
  const filters: SidebarFilter[] = [
    {
      key: "type",
      type: "select",
      options: typeOptions,
      value: typeFilter,
      onChange: (value) => setTypeFilter(value as string),
      className: "sidebar-fleet__type-filter"
    },
    {
      key: "status", 
      type: "select",
      options: statusOptions,
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as string),
      className: "sidebar-fleet__status-filter"
    }
  ];

  // Apply filters to vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Quick search in basic fields (plate, name, type)
      const matchesSearch = quickSearch === "" || 
        vehicle.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
        vehicle.plateNumber?.toLowerCase().includes(quickSearch.toLowerCase()) ||
        vehicle.type?.toLowerCase().includes(quickSearch.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "All" || vehicle.type === typeFilter;
      
      // Status filter  
      const matchesStatus = statusFilter === "All" || vehicle.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, quickSearch, typeFilter, statusFilter]);

  // Render individual vehicle item
  const renderVehicleItem = (vehicle: Vehicle, isSelected: boolean) => {
    return (
      <ListItem
        item={{
          id: vehicle.id,
          name: vehicle.name,
          image: vehicle.image,
          type: vehicle.type,
          status: vehicle.status,
          plateNumber: vehicle.plateNumber,
        }}
        isSelected={isSelected}
        onClick={() => onSelect(vehicle)}
        imageAlt={`${vehicle.name} vehicle`}
        fallbackImage="/vehicles/placeholder.jpg"
        showImage={true}
        showStatus={true}
        renderMeta={(item) => (
          <>
            <span className="sidebar-fleet__plate">{item.plateNumber}</span>
            <span className="sidebar-fleet__separator">•</span>
            <span className="sidebar-fleet__type">{item.type}</span>
          </>
        )}
        className="sidebar-fleet__vehicle-item"
      />
    );
  };

  return (
    <Sidebar
      // Search configuration
      searchTerm={quickSearch}
      searchPlaceholder="Plate, name, type or..."
      onSearchChange={setQuickSearch}
      showSearch={true}
      
      // Filters configuration
      filters={filters}
      showFilters={true}
      
      // Items configuration
      items={filteredVehicles}
      selectedId={selectedId}
      onSelectItem={onSelect}
      renderItem={renderVehicleItem}
      
      // State configuration
      isLoading={isLoading}
      loadingMessage="Loading vehicles..."
      emptyMessage="No vehicles found"
      
      // Styling
      className="sidebar-fleet"
    />
  );
};

export default SidebarFleet;