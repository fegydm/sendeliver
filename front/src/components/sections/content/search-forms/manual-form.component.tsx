// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Added type prop to LocationFormProvider instances

import React, { useState, useRef } from 'react';
import CountrySelect from './CountrySelect';
import LocationSelect from './PostalCitySelect';
import { LocationFormProvider } from './LocationContext';
import "@/styles/sections/manual-form.component.css";

interface FormData {
 pickup: {
   country: {
     code: string;
     flag: string;
   };
   postalCode: string;
   city: string;
   loadingTime: string;
 };
 delivery: {
   country: {
     code: string;
     flag: string;
   };
   postalCode: string;
   city: string;
   deliveryTime: string;
 };
 cargo: {
   pallets: number;
   weight: number;
 };
}

const ManualSearchForm: React.FC = () => {
 const pickupPostalRef = useRef<HTMLInputElement>(null);
 const deliveryPostalRef = useRef<HTMLInputElement>(null);

 const [formData, setFormData] = useState<FormData>({
   pickup: {
     country: { code: '', flag: '' },
     postalCode: '',
     city: '',
     loadingTime: ''
   },
   delivery: {
     country: { code: '', flag: '' },
     postalCode: '',
     city: '',
     deliveryTime: ''
   },
   cargo: {
     pallets: 0,
     weight: 0
   }
 });

 const [isPickupValid, setIsPickupValid] = useState(false);
 const [isDeliveryValid, setIsDeliveryValid] = useState(false);

 const handleCountrySelect = (type: 'pickup' | 'delivery', code: string, flag: string) => {
   setFormData(prev => ({
     ...prev,
     [type]: {
       ...prev[type],
       country: { code, flag },
       postalCode: '',
       city: ''
     }
   }));
   if (type === 'pickup') setIsPickupValid(false);
   else setIsDeliveryValid(false);
 };

 const focusPostalCode = (type: 'pickup' | 'delivery') => {
   if (type === 'pickup') {
     pickupPostalRef.current?.focus();
   } else {
     deliveryPostalRef.current?.focus();
   }
 };

 const handleValidSelection = (type: 'pickup' | 'delivery') => {
   if (type === 'pickup') {
     setIsPickupValid(true);
   } else {
     setIsDeliveryValid(true);
   }
 };

 const handleSearch = () => {
   console.log('Searching with form data:', formData);
 };

 const handleSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   handleSearch();
 };

 return (
   <form className="manual-form" onSubmit={handleSubmit}>
     {/* Pickup section */}
     <div className={`form-section ${isPickupValid ? 'valid' : 'invalid'}`}>
       <h3 className="section-title">Pickup Details</h3>
       
       <LocationFormProvider type="pickup">
         <div className="location-fields">
           <div className="flag-placeholder">
             {formData.pickup.country.flag && (
               <img 
                 src={formData.pickup.country.flag} 
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
               initialValue={formData.pickup.country.code}
             />
           </div>
           
           <LocationSelect
             postalCodeRef={pickupPostalRef}
             onValidSelection={() => handleValidSelection('pickup')}
           />
         </div>

         <div className="datetime-field">
           <label className="field-label">Loading Time</label>
           <input
             type="datetime-local"
             value={formData.pickup.loadingTime}
             onChange={(e) => setFormData(prev => ({
               ...prev,
               pickup: { ...prev.pickup, loadingTime: e.target.value }
             }))}
             className="datetime-input"
           />
         </div>
       </LocationFormProvider>
     </div>

     {/* Delivery section */}
     <div className={`form-section ${isDeliveryValid ? 'valid' : 'invalid'}`}>
       <h3 className="section-title">Delivery Details</h3>
       
       <LocationFormProvider type="delivery">
         <div className="location-fields">
           <div className="flag-placeholder">
             {formData.delivery.country.flag && (
               <img 
                 src={formData.delivery.country.flag} 
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
               initialValue={formData.delivery.country.code}
             />
           </div>
           
           <LocationSelect
             postalCodeRef={deliveryPostalRef}
             onValidSelection={() => handleValidSelection('delivery')}
           />
         </div>

         <div className="datetime-field">
           <label className="field-label">Delivery Time</label>
           <input
             type="datetime-local"
             value={formData.delivery.deliveryTime}
             onChange={(e) => setFormData(prev => ({
               ...prev,
               delivery: { ...prev.delivery, deliveryTime: e.target.value }
             }))}
             className="datetime-input"
           />
         </div>
       </LocationFormProvider>
     </div>

     {/* Cargo section */}
     <div className="form-section">
       <h3 className="section-title">Cargo Details</h3>
       <div className="cargo-container">
         <div className="field-group">
           <label className="field-label">Number of Pallets</label>
           <input
             type="number"
             value={formData.cargo.pallets}
             onChange={(e) => setFormData(prev => ({
               ...prev,
               cargo: { ...prev.cargo, pallets: Number(e.target.value) }
             }))}
             min="0"
             className="form-input"
           />
         </div>
         <div className="field-group">
           <label className="field-label">Total Weight (kg)</label>
           <input
             type="number"
             value={formData.cargo.weight}
             onChange={(e) => setFormData(prev => ({
               ...prev,
               cargo: { ...prev.cargo, weight: Number(e.target.value) }
             }))}
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