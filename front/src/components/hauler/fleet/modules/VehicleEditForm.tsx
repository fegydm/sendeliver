// File: front/src/components/hauler/fleet/modules/VehicleEditForm.tsx
import React from "react";
import type { Vehicle } from "@/data/mockFleet";

interface VehicleEditFormProps {
  vehicle: Vehicle;
  onChange: (field: keyof Vehicle, value: any) => void;
}

export const VehicleEditForm: React.FC<VehicleEditFormProps> = ({ vehicle, onChange }) => {
  return (
    <form className="vehicle-edit-form">
      {/* Example fields */}
      <div>
        <label>Name</label>
        <input
          type="text"
          value={vehicle.name}
          onChange={e => onChange("name", e.target.value)}
        />
      </div>
      <div>
        <label>Plate</label>
        <input
          type="text"
          value={vehicle.plateNumber}
          onChange={e => onChange("plateNumber", e.target.value)}
        />
      </div>
      {/* add more fields as needed */}
    </form>
  );
};
