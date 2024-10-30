// ./front/src/components/content-section.component.js
import React, { useState } from 'react';
import { Package2, Truck } from 'lucide-react';
import QuickStats from './quick-stats.component';

const ContentSection = ({ 
  type, 
  isActive, 
  showStats, 
  onFocus, 
  children 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getSectionClasses = () => {
    const baseClasses = "relative w-full md:w-1/2 space-y-4 p-6 transition-all duration-300 cursor-pointer";
    
    if (isActive) {
      return `${baseClasses} scale-105 shadow-xl rounded-lg ${
        type === 'sender' 
          ? 'bg-primaryClient/30 dark:bg-primaryClient/50' 
          : 'bg-primaryCarrier/30 dark:bg-primaryCarrier/50'
      }`;
    }
    
    return `${baseClasses} ${
      isHovered ? 'scale-102 shadow-lg' : ''
    } ${
      isActive === false
        ? 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-500 scale-95'
        : type === 'sender'
        ? 'bg-primaryClient/20 text-black dark:bg-primaryClient/40 dark:text-white'
        : 'bg-primaryCarrier/20 text-black dark:bg-primaryCarrier/40 dark:text-white'
    }`;
  };

  const Icon = type === 'sender' ? Package2 : Truck;
  const title = type === 'sender' ? 'Odosielateľ' : 'Prepravca';
  const description = type === 'sender' 
    ? 'Hľadáš spoľahlivú prepravu pre tvoj náklad?'
    : 'Hľadáš náklad pre tvoje vozidlá?';

  return (
    <section
      className={getSectionClasses()}
      onClick={() => onFocus(type)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <Icon className="w-6 h-6 mr-2" />
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>

      {showStats && isActive && <QuickStats type={type} />}
      
      {children}
    </section>
  );
};

export default ContentSection;