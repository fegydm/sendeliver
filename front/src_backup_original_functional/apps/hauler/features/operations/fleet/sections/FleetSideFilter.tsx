// File: ./front/src/components/hauler/fleet/sections/FleetSideFilter.tsx
// Last change: Search + type/status filters podľa vzoru z People a starej Fleet karty

import React, { useState } from "react";
import { Vehicle } from "@/data/mockFleet";
import StatusChip from "../elements/StatusChip";

interface FleetSideFilterProps {
  vehicles: Vehicle[];
  selectedId?: string;
  onSelect: (vehicle: Vehicle) => void;
}

const FleetSideFilter: React.FC<FleetSideFilterProps> = ({
  vehicles,
  selectedId,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Všetky");
  const [statusFilter, setStatusFilter] = useState("Všetky");

  const types = ["Všetky", ...Array.from(new Set(vehicles.map(v => v.type)))];
  const statuses = ["Všetky", ...Array.from(new Set(vehicles.map(v => v.status)))];

  const filtered = vehicles.filter(v => {
    const mSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const mType = typeFilter === "Všetky" || v.type === typeFilter;
    const mStatus = statusFilter === "Všetky" || v.status === statusFilter;
    return mSearch && mType && mStatus;
  });

  return (
    <aside className="fleet-side-filter">
      {/* Search box */}
      <div className="fleet-side-filter__search">
        <input
          type="text"
          className="fleet-side-filter__search-input"
          placeholder="Vyhľadať vozidlo..."
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
          <li className="fleet-side-filter__empty">Nenašli sa žiadne vozidlá</li>
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
              <StatusChip status={v.status} />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default FleetSideFilter;
