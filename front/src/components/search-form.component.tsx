// ./front/src/components/search-form.component.tsx
import React, { useState } from 'react';

interface SearchFormProps {
  type: 'client' | 'carrier';
}

interface FormData {
  from: string;
  fromTime: string;
  to: string;
  toTime: string;
  date: string;
  weight: string;
  pallets: string;
}

const SearchForm: React.FC<SearchFormProps> = ({ type }) => {
  const [formData, setFormData] = useState<FormData>({
    from: '',
    fromTime: '',
    to: '',
    toTime: '',
    date: '',
    weight: '',
    pallets: ''
  });

  const bgColor = type === 'client' ? 'bg-[#FF00FF]/10' : 'bg-[#74cc04]/10';
  const borderColor = type === 'client' ? 'border-[#FF00FF]/20' : 'border-[#74cc04]/20';

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Tu pôjde logika odoslania dát
  };

  return (
    <div className={`p-6 ${bgColor} border-t-2 ${borderColor}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nakladka */}
          <div>
            <label className="block text-sm font-medium mb-1">Miesto nakládky</label>
            <input
              type="text"
              placeholder="Odkiaľ? *"
              required
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.from}
              onChange={handleChange('from')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Čas nakládky</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.fromTime}
              onChange={handleChange('fromTime')}
            />
          </div>

          {/* Vykladka */}
          <div>
            <label className="block text-sm font-medium mb-1">Miesto vykládky</label>
            <input
              type="text"
              placeholder="Kam?"
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.to}
              onChange={handleChange('to')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Čas vykládky</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.toTime}
              onChange={handleChange('toTime')}
            />
          </div>

          {/* Hmotnost a palety */}
          <div>
            <label className="block text-sm font-medium mb-1">Hmotnosť (kg)</label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.weight}
              onChange={handleChange('weight')}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Počet paliet</label>
            <input
              type="number"
              placeholder="0"
              className="w-full p-2 border rounded-md bg-white/90 dark:bg-gray-700 dark:border-gray-600"
              value={formData.pallets}
              onChange={handleChange('pallets')}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Hľadať v obľúbených
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Hľadať na burze
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;