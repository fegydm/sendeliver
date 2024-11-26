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
      onSubmit(updated); // Odosielame aktualizované dáta rodičovi
      return updated;
    });
  };

  const isClient = type === "client";

  return (
    <div className="space-y-4">
      {/* Lokality */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Miesto nakládky" : "Aktuálna poloha"}
          </label>
          <input
            type="text"
            value={formData.pickupLocation}
            onChange={(e) => handleUpdate({ pickupLocation: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Zadajte miesto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Miesto vykládky" : "Cieľová oblasť"}
          </label>
          <input
            type="text"
            value={formData.deliveryLocation}
            onChange={(e) => handleUpdate({ deliveryLocation: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Zadajte miesto"
          />
        </div>
      </div>

      {/* Časové údaje */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Čas nakládky" : "Čas dostupnosti"}
          </label>
          <input
            type="datetime-local"
            value={formData.pickupTime}
            onChange={(e) => handleUpdate({ pickupTime: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Čas vykládky" : "Koniec dostupnosti"}
          </label>
          <input
            type="datetime-local"
            value={formData.deliveryTime}
            onChange={(e) => handleUpdate({ deliveryTime: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Hmotnosť a počet paliet */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Hmotnosť (kg)" : "Max. nosnosť (kg)"}
          </label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleUpdate({ weight: Number(e.target.value) })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
            step="100"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? "Počet paliet" : "Max. počet paliet"}
          </label>
          <input
            type="number"
            value={formData.palletCount}
            onChange={(e) =>
              handleUpdate({ palletCount: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
