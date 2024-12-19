// ./front/src/components/search-forms/manual-search-form.component.tsx
import React, { useState } from "react";

interface TransportData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

interface ManualSearchFormProps {
  type: "client" | "carrier";
  onSubmit: (data: TransportData) => void;
}

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
  type,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<TransportData>({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    deliveryTime: "",
    weight: 0,
    palletCount: 0,
  });

  const handleUpdate = (newData: Partial<TransportData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      onSubmit(updated); // Send updated data to the parent
      return updated;
    });
  };

  const isClient = type === "client";

  return (
    <div className="manual-search-form">
      {/* Locations */}
      <div className="form-row">
        <div className="form-group">
          <label>
            {isClient ? "Pickup location" : "Current location"}
          </label>
          <input
            type="text"
            value={formData.pickupLocation}
            onChange={(e) => handleUpdate({ pickupLocation: e.target.value })}
            placeholder="Enter location"
          />
        </div>
        <div className="form-group">
          <label>
            {isClient ? "Delivery location" : "Destination area"}
          </label>
          <input
            type="text"
            value={formData.deliveryLocation}
            onChange={(e) => handleUpdate({ deliveryLocation: e.target.value })}
            placeholder="Enter location"
          />
        </div>
      </div>

      {/* Time details */}
      <div className="form-row">
        <div className="form-group">
          <label>
            {isClient ? "Pickup time" : "Available from"}
          </label>
          <input
            type="datetime-local"
            value={formData.pickupTime}
            onChange={(e) => handleUpdate({ pickupTime: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>
            {isClient ? "Delivery time" : "Available until"}
          </label>
          <input
            type="datetime-local"
            value={formData.deliveryTime}
            onChange={(e) => handleUpdate({ deliveryTime: e.target.value })}
          />
        </div>
      </div>

      {/* Weight and pallet count */}
      <div className="form-row">
        <div className="form-group">
          <label>
            {isClient ? "Weight (kg)" : "Max load (kg)"}
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleUpdate({ weight: Number(e.target.value) })}
            min="0"
            step="100"
            placeholder="0"
          />
        </div>
        <div className="form-group">
          <label>
            {isClient ? "Number of pallets" : "Max pallets"}
          </label>
          <input
            type="number"
            value={formData.palletCount}
            onChange={(e) =>
              handleUpdate({ palletCount: Number(e.target.value) })
            }
            min="0"
            max="33"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default ManualSearchForm;
