import React from "react";

interface TransportData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

interface ManualSearchFormProps {
  type: "sender" | "hauler";
  onSubmit: (data: TransportData) => void;
  formData: TransportData;
}

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
  type,
  onSubmit,
  formData,
}) => {
  const handleUpdate = (newData: Partial<TransportData>) => {
    const updated = { ...formData, ...newData };
    onSubmit(updated);
  };

  const isSender = type === "sender";

  return (
    <div className={`manual-form--${type}`}>
      {/* Locations */}
      <div className="manual-form__row">
        <div className="manual-form__group">
          <label>
            {isSender ? "Pickup location *" : "Current location *"}
          </label>
          <input
            type="text"
            value={formData.pickupLocation || ""}
            onChange={(e) => handleUpdate({ pickupLocation: e.target.value })}
            placeholder={
              isSender ? "Enter pickup location" : "Enter current location"
            }
          />
        </div>
        <div className="manual-form__group">
          <label>
            {isSender ? "Delivery location" : "Destination area"}
          </label>
          <input
            type="text"
            value={formData.deliveryLocation || ""}
            onChange={(e) => handleUpdate({ deliveryLocation: e.target.value })}
            placeholder="Enter destination location"
          />
        </div>
      </div>

      {/* Time details */}
      <div className="manual-form__row">
        <div className="manual-form__group">
          <label>{isSender ? "Pickup time" : "Available from"}</label>
          <input
            type="datetime-local"
            value={formData.pickupTime || ""}
            onChange={(e) => handleUpdate({ pickupTime: e.target.value })}
          />
        </div>
        <div className="manual-form__group">
          <label>{isSender ? "Delivery time" : "Available until"}</label>
          <input
            type="datetime-local"
            value={formData.deliveryTime || ""}
            onChange={(e) => handleUpdate({ deliveryTime: e.target.value })}
          />
        </div>
      </div>

      {/* Weight and pallet count */}
      <div className="manual-form__row">
        <div className="manual-form__group">
          <label>{isSender ? "Weight (kg)" : "Max load (kg)"}</label>
          <input
            type="number"
            value={formData.weight || 0}
            onChange={(e) => handleUpdate({ weight: Number(e.target.value) })}
            min="0"
            step="100"
            placeholder="0"
          />
        </div>
        <div className="manual-form__group">
          <label>{isSender ? "Number of pallets" : "Max pallets"}</label>
          <input
            type="number"
            value={formData.palletCount || 0}
            onChange={(e) => handleUpdate({ palletCount: Number(e.target.value) })}
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
