// File: front/src/apps/hauler/operations/fleet/sidebar.fleet.tsx
// Last change: Updated export name to follow SidebarFleet convention

import React, { useState } from "react";
import { Vehicle } from "@/data/mockFleet";
import { StatusChip } from "@/shared/elements/status-chip.element"; // Correct import path

interface SidebarFleetProps {
  vehicles: Vehicle[];
  selectedId?: string;
  onSelect: (vehicle: Vehicle) => void;
}

const SidebarFleet: React.FC<SidebarFleetProps> = ({
  vehicles,
  selectedId,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const types = ["All", ...Array.from(new Set(vehicles.map(v => v.type)))];
  const statuses = ["All", ...Array.from(new Set(vehicles.map(v => v.status)))];

  const filtered = vehicles.filter(v => {
    const mSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const mType = typeFilter === "All" || v.type === typeFilter;
    const mStatus = statusFilter === "All" || v.status === statusFilter;
    return mSearch && mType && mStatus;
  });

  return (
    <aside className="fleet-side-filter">
      {/* Search box */}
      <div className="fleet-side-filter__search">
        <input
          type="text"
          className="fleet-side-filter__search-input"
          placeholder="Search vehicle..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Type & Status dropdowns */}
      <div className="fleet-side-filter__controls">
        <select
          className="fleet-side-filter__select"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="fleet-side-filter__select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Vehicle list */}
      <ul className="fleet-side-filter__list">
        {filtered.length === 0 && (
          <li className="fleet-side-filter__empty">No vehicles found</li>
        )}
        {filtered.map(v => (
          <li
            key={v.id}
            className={`fleet-side-filter__item${v.id === selectedId ? ' fleet-side-filter__item--active' : ''}`}
            onClick={() => onSelect(v)}
          >
            <img
              src={v.image}
              alt={v.name}
              className="fleet-side-filter__img"
              onError={e => {
                (e.target as HTMLImageElement).src = "/vehicles/placeholder.jpg";
              }}
            />
            <div className="fleet-side-filter__info">
              <div className="fleet-side-filter__name">{v.name}</div>
              <StatusChip status={v.status || 'INACTIVE'} />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export { SidebarFleet };
export default SidebarFleet;