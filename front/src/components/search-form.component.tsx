// ./front/src/components/search-form.component.tsx
import React from 'react';

interface TransportData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

interface SearchFormProps {
  type: 'client' | 'carrier';
  data: TransportData;
  onUpdate: (newData: Partial<TransportData>) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ type, data, onUpdate }) => {
  const isClient = type === 'client';
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Miesto nakládky' : 'Aktuálna poloha'}
          </label>
          <input
            type="text"
            value={data.pickupLocation}
            onChange={(e) => onUpdate({ pickupLocation: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Miesto vykládky' : 'Cieľová oblasť'}
          </label>
          <input
            type="text"
            value={data.deliveryLocation}
            onChange={(e) => onUpdate({ deliveryLocation: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Čas nakládky' : 'Čas dostupnosti'}
          </label>
          <input
            type="datetime-local"
            value={data.pickupTime}
            onChange={(e) => onUpdate({ pickupTime: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Čas vykládky' : 'Koniec dostupnosti'}
          </label>
          <input
            type="datetime-local"
            value={data.deliveryTime}
            onChange={(e) => onUpdate({ deliveryTime: e.target.value })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Hmotnosť (kg)' : 'Max. nosnosť (kg)'}
          </label>
          <input
            type="number"
            value={data.weight}
            onChange={(e) => onUpdate({ weight: Number(e.target.value) })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
            step="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isClient ? 'Počet paliet' : 'Max. počet paliet'}
          </label>
          <input
            type="number"
            value={data.palletCount}
            onChange={(e) => onUpdate({ palletCount: Number(e.target.value) })}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            min="0"
            max="33"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchForm;