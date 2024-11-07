// ./front/src/components/icon-sun.component.tsx

import { Sun, Moon } from 'lucide-react';

// Lucide verzia
export const LucideIcons = () => (
 <div className="flex gap-4">
   <Sun className="w-6 h-6 text-gray-600" />
   <Moon className="w-6 h-6 text-gray-600" />
 </div>
);

// Custom SVG verzia
export const CustomIcons = () => (
 <div className="flex gap-4">
   <svg 
     width="24" 
     height="24" 
     viewBox="0 0 24 24" 
     fill="none"
     className="text-gray-600"
   >
     <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
     <path 
       d="M12 3V5M12 19V21M3 12H5M19 12H21M5.6 5.6L7 7M17 17L18.4 18.4M5.6 18.4L7 17M17 7L18.4 5.6" 
       stroke="currentColor" 
       strokeWidth="2" 
       strokeLinecap="round"
     />
   </svg>

   <svg 
     width="24" 
     height="24" 
     viewBox="0 0 24 24" 
     fill="none"
     className="text-gray-600"
   >
     <path
       d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     />
   </svg>
 </div>
);

// Porovnanie oboch
const ThemeIcons = () => {
 return (
   <div className="space-y-4">
     <div>
       <h3 className="text-sm font-medium text-gray-500 mb-2">Lucide Icons:</h3>
       <LucideIcons />
     </div>
     <div>
       <h3 className="text-sm font-medium text-gray-500 mb-2">Custom SVG Icons:</h3>
       <CustomIcons />
     </div>
   </div>
 );
};

export default ThemeIcons;