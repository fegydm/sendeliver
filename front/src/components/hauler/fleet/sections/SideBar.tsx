// File: front/src/components/hauler/fleet/sections/SideBar.tsx

import React, { useState, useMemo } from "react";
import { SidebarList, Column } from "@/components/shared/elements/SidebarList";
import type { Vehicle } from "@/data/mockFleet";

interface SideBarProps {
  /** All vehicles to choose from */
  vehicles: Vehicle[];
  /** Currently selected vehicle id */
  selectedId?: string;
  /** Callback when user selects a vehicle */
  onSelect: (vehicle: Vehicle) => void;
}

/**
 * Fleet sidebar wrapper:
 * - handles search/filter state
 * - builds columns & filters config
 * - renders generic SidebarList<Vehicle>
 */
export const SideBar: React.FC<SideBarProps> = ({
  vehicles,
  selectedId,
  onSelect,
}) => {
  // search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Všetky");
  const [statusFilter, setStatusFilter] = useState("Všetky");

  // define columns for Vehicle
  const columns: Column<Vehicle>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Názov",
        renderCell: v => v.name,
      },
      {
        key: "plateNumber",
        header: "EČV",
        renderCell: v => v.plateNumber,
      },
      {
        key: "type",
        header: "Typ",
        renderCell: v => v.type,
      },
    ],
    []
  );

  // prepare filter options
  const filters = useMemo(() => [
    {
      name: "Typ",
      options: ["Všetky", ...Array.from(new Set(vehicles.map(v => v.type)))],
      value: typeFilter,
      onChange: setTypeFilter,
    },
    {
      name: "Stav",
      options: ["Všetky", ...Array.from(new Set(vehicles.map(v => v.status)))],
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ], [vehicles, typeFilter, statusFilter]);

  // filter vehicles by search + selected filters
  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "Všetky" || v.type === typeFilter;
      const matchesStatus = statusFilter === "Všetky" || v.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, searchTerm, typeFilter, statusFilter]);

  return (
    <SidebarList<Vehicle>
      items={filtered}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      selectedKey={selectedId}
      getKey={v => v.id}
      onSelectItem={onSelect}
    />
  );
};
