// ./front/src/components/dark-mode-toggle.component.js
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeToggle = ({ isDarkMode, onToggle }) => (
 <button
   onClick={onToggle}
   className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
   aria-label="Toggle dark mode"
 >
   {isDarkMode ? (
     <Sun className="w-6 h-6 text-gray-600 dark:text-gray-300" />
   ) : (
     <Moon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
   )}
 </button>
);

export default DarkModeToggle;