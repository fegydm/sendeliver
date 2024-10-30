// ./front/src/components/search-form.component.js
import React, { useState } from 'react';

const SearchForm = ({ type }) => {
 const [formData, setFormData] = useState({
   from: '',
   to: '',
   date: '',
   weight: ''
 });

 const bgColor = type === 'client' ? 'bg-[#FF00FF]/10' : 'bg-[#74cc04]/10';

 return (
   <div className={`p-6 ${bgColor}`}>
     <form className="space-y-4">
       <input
         type="text"
         placeholder="From *"
         required
         className="w-full p-2 border rounded"
         value={formData.from}
         onChange={(e) => setFormData({...formData, from: e.target.value})}
       />
       <input
         type="text"
         placeholder="To"
         className="w-full p-2 border rounded"
         value={formData.to}
         onChange={(e) => setFormData({...formData, to: e.target.value})}
       />
       <input
         type="date"
         className="w-full p-2 border rounded"
         value={formData.date}
         onChange={(e) => setFormData({...formData, date: e.target.value})}
       />
       <input
         type="number"
         placeholder="Weight (kg)"
         className="w-full p-2 border rounded"
         value={formData.weight}
         onChange={(e) => setFormData({...formData, weight: e.target.value})}
       />
       
       <div className="space-y-2">
         <button 
           type="button"
           className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded"
         >
           Search Favourite List
         </button>
         <button 
           type="button"
           className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded"
         >
           Search Exchange
         </button>
       </div>
     </form>
   </div>
 );
};

export default SearchForm;