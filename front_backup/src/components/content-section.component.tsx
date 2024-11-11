// ./front/src/components/content-section.component.tsx
import React, { ReactNode } from 'react';
import { Package2, Truck } from 'lucide-react';
import QuickStats from './quick-stats.component';

interface ContentSectionProps {
  type: 'sender' | 'carrier';
  isActive: boolean;
  showStats: boolean;
  children: ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ 
  type, 
  isActive, 
  showStats, 
  children 
}) => {
  const getSectionClasses = () => {
    const baseClasses = "relative w-full space-y-4 p-6 transition-all duration-300";
    
    if (isActive) {
      return `${baseClasses} rounded-lg ${
        type === 'sender' 
          ? 'bg-primaryClient/30 dark:bg-primaryClient/50' 
          : 'bg-primaryCarrier/30 dark:bg-primaryCarrier/50'
      }`;
    }
    
    return `${baseClasses} ${
      type === 'sender'
        ? 'bg-primaryClient/20 text-black dark:bg-primaryClient/40 dark:text-white'
        : 'bg-primaryCarrier/20 text-black dark:bg-primaryCarrier/40 dark:text-white'
    }`;
  };

  const Icon = type === 'sender' ? Package2 : Truck;
  const title = type === 'sender' ? 'Odosielateľ' : 'Prepravca';
  const description = type === 'sender' 
    ? 'Zadajte detaily vašej zásielky alebo použite AI asistenta pre rýchle spracovanie'
    : 'Nájdite vhodné zásielky pre vaše vozidlá alebo ponúknite voľnú kapacitu';

  return (
    <section className={getSectionClasses()}>
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