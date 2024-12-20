// ./front/src/components/search-forms/manual-search-form.component.tsx
import React, { useState, useEffect } from "react";

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
 formData?: TransportData; // Changed from initialData to formData to match parent state
}

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
 type,
 onSubmit,
 formData: externalFormData // Renamed to avoid confusion with local state
}) => {
 const [localFormData, setLocalFormData] = useState<TransportData>({
   pickupLocation: "",
   deliveryLocation: "",
   pickupTime: "",
   deliveryTime: "",
   weight: 0,
   palletCount: 0,
 });

 // Update local form data when external data changes
 useEffect(() => {
   if (externalFormData) {
     setLocalFormData(externalFormData);
   }
 }, [externalFormData]);

 const handleUpdate = (newData: Partial<TransportData>) => {
   setLocalFormData((prev) => {
     const updated = { ...prev, ...newData };
     onSubmit(updated);
     return updated;
   });
 };

 const isClient = type === "client";

 // Use local form data for form values
 const {
   pickupLocation,
   deliveryLocation,
   pickupTime,
   deliveryTime,
   weight,
   palletCount
 } = localFormData;

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
           value={pickupLocation}
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
           value={deliveryLocation}
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
           value={pickupTime}
           onChange={(e) => handleUpdate({ pickupTime: e.target.value })}
         />
       </div>
       <div className="form-group">
         <label>
           {isClient ? "Delivery time" : "Available until"}
         </label>
         <input
           type="datetime-local"
           value={deliveryTime}
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
           value={weight}
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
           value={palletCount}
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