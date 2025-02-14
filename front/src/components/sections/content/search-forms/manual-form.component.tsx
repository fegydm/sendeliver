// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Fixed country code handling and form state management

import React, { useState, useRef } from 'react';
import CountrySelect from './CountrySelect';
import PostalCitySelect from './PostalCitySelect';
import { FormData } from '@/types/ai.types';
import "@/styles/sections/manual-form.component.css";

interface ManualSearchFormProps {
 onSubmit: (data: FormData) => void;
 formData?: FormData;
}

const DEFAULT_FORM_DATA: FormData = {
 pickup: {
   country: { code: '', flag: '' },
   psc: '',
   city: '',
   time: ''
 },
 delivery: {
   country: { code: '', flag: '' },
   psc: '',
   city: '',
   time: ''
 },
 cargo: {
   pallets: 0,
   weight: 0
 }
};

const ManualSearchForm: React.FC<ManualSearchFormProps> = ({
 onSubmit,
 formData = DEFAULT_FORM_DATA
}) => {
 // Component refs
 const pickupPscRef = useRef<HTMLInputElement>(null);
 const deliveryPscRef = useRef<HTMLInputElement>(null);

 // Component state
 const [localFormData, setLocalFormData] = useState<FormData>(formData);
 const [isPickupValid, setIsPickupValid] = useState(false);
 const [isDeliveryValid, setIsDeliveryValid] = useState(false);

 // Handle country selection
 const handleCountrySelect = (locationType: 'pickup' | 'delivery', code: string, flag: string) => {
   console.log('Country selected:', { locationType, code, flag });
   
   setLocalFormData(prev => {
     const newData = {
       ...prev,
       [locationType]: {
         ...prev[locationType],
         country: { code, flag },
         psc: '',
         city: ''
       }
     };
     console.log('Form data updated:', {
       previous: prev[locationType].country,
       new: newData[locationType].country
     });
     return newData;
   });

   // Reset validation and focus postal code input
   if (locationType === 'pickup') {
     setIsPickupValid(false);
     setTimeout(() => pickupPscRef.current?.focus(), 0);
   } else {
     setIsDeliveryValid(false);
     setTimeout(() => deliveryPscRef.current?.focus(), 0);
   }
 };

 // Focus handlers
 const focusPostalCode = (locationType: 'pickup' | 'delivery') => {
   if (locationType === 'pickup') {
     pickupPscRef.current?.focus();
   } else {
     deliveryPscRef.current?.focus();
   }
 };

 // Selection handlers
 const handleValidSelection = (locationType: 'pickup' | 'delivery') => {
   console.log('Valid selection for:', locationType);
   if (locationType === 'pickup') {
     setIsPickupValid(true);
   } else {
     setIsDeliveryValid(true);
   }
 };

 // Form submission
 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   console.log('Submitting form data:', localFormData);
   onSubmit(localFormData);
 };

 return (
   <form className="manual-form" onSubmit={handleSubmit}>
     {/* Pickup section */}
     <div className={`form-section ${isPickupValid ? 'valid' : 'invalid'}`}>
       <h3 className="section-title">Pickup Details</h3>
       <div className="location-fields">
         <div className="flag-placeholder">
           {localFormData.pickup.country.flag && (
             <img
               src={localFormData.pickup.country.flag}
               alt="Pickup Country Flag"
               className="flag-image"
             />
           )}
         </div>

         <div className="field-group">
           <label className="field-label">Country</label>
           <CountrySelect
             onCountrySelect={(code, flag) => handleCountrySelect('pickup', code, flag)}
             onNextFieldFocus={() => focusPostalCode('pickup')}
             initialValue={localFormData.pickup.country.code}
             locationType="pickup"
           />
         </div>

         <PostalCitySelect
           pscRef={pickupPscRef}
           onValidSelection={() => handleValidSelection('pickup')}
           locationType="pickup"
           cc={localFormData.pickup.country.code}
         />
       </div>

       <div className="datetime-field">
         <label className="field-label">Loading Time</label>
         <input
           type="datetime-local"
           value={localFormData.pickup.time}
           onChange={(e) =>
             setLocalFormData(prev => ({
               ...prev,
               pickup: { ...prev.pickup, time: e.target.value }
             }))
           }
           className="datetime-input"
         />
       </div>
     </div>

     {/* Delivery section */}
     <div className={`form-section ${isDeliveryValid ? 'valid' : 'invalid'}`}>
       <h3 className="section-title">Delivery Details</h3>
       <div className="location-fields">
         <div className="flag-placeholder">
           {localFormData.delivery.country.flag && (
             <img
               src={localFormData.delivery.country.flag}
               alt="Delivery Country Flag"
               className="flag-image"
             />
           )}
         </div>

         <div className="field-group">
           <label className="field-label">Country</label>
           <CountrySelect
             onCountrySelect={(code, flag) => handleCountrySelect('delivery', code, flag)}
             onNextFieldFocus={() => focusPostalCode('delivery')}
             initialValue={localFormData.delivery.country.code}
             locationType="delivery"
           />
         </div>

         <PostalCitySelect
           pscRef={deliveryPscRef}
           onValidSelection={() => handleValidSelection('delivery')}
           locationType="delivery"
           cc={localFormData.delivery.country.code}
         />
       </div>

       <div className="datetime-field">
         <label className="field-label">Delivery Time</label>
         <input
           type="datetime-local"
           value={localFormData.delivery.time}
           onChange={(e) =>
             setLocalFormData(prev => ({
               ...prev,
               delivery: { ...prev.delivery, time: e.target.value }
             }))
           }
           className="datetime-input"
         />
       </div>
     </div>

     {/* Cargo section */}
     <div className="form-section">
       <h3 className="section-title">Cargo Details</h3>
       <div className="cargo-container">
         <div className="field-group">
           <label className="field-label">Number of Pallets</label>
           <input
             type="number"
             value={localFormData.cargo.pallets}
             onChange={(e) =>
               setLocalFormData(prev => ({
                 ...prev,
                 cargo: { ...prev.cargo, pallets: Number(e.target.value) }
               }))
             }
             min="0"
             className="form-input"
           />
         </div>
         <div className="field-group">
           <label className="field-label">Total Weight (kg)</label>
           <input
             type="number"
             value={localFormData.cargo.weight}
             onChange={(e) =>
               setLocalFormData(prev => ({
                 ...prev,
                 cargo: { ...prev.cargo, weight: Number(e.target.value) }
               }))
             }
             min="0"
             step="0.1"
             className="form-input"
           />
         </div>
       </div>
     </div>

     <button
       type="submit"
       className="submit-button"
       disabled={!isPickupValid || !isDeliveryValid}
     >
       Submit Transport Request
     </button>
   </form>
 );
};

export default ManualSearchForm;