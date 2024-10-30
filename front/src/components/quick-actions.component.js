// ./front/src/components/quick-actions.component.js
import React from 'react';
import { Motion, Package2, Truck } from 'lucide-react';

const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <button className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
        <Motion className="w-6 h-6 mr-2 text-blue-500" />
        <span>Sledovať zásielku</span>
      </button>
      <button className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
        <Package2 className="w-6 h-6 mr-2 text-green-500" />
        <span>Rýchla kalkulácia</span>
      </button>
      <button className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
        <Truck className="w-6 h-6 mr-2 text-purple-500" />
        <span>Nájsť vozidlo</span>
      </button>
    </div>
  );
};

export default QuickActions;