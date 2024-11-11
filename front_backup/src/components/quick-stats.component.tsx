import React from 'react';

interface StatItem {
  label: string;
  value: string;
}

interface Stats {
  [key: string]: {
    items: StatItem[];
  };
}

const stats: Stats = {
  sender: {
    items: [
      { label: 'Aktívnych prepráv', value: '1234' },
      { label: 'Priemerná odozva', value: '15 min' },
      { label: 'Spokojnosť', value: '98%' }
    ]
  },
  carrier: {
    items: [
      { label: 'Voľných trás', value: '567' },
      { label: 'Priemerná cena', value: '1.45€/km' },
      { label: 'Prepravcov', value: '890+' }
    ]
  }
};

interface QuickStatsProps {
  type: 'sender' | 'carrier';
}

const QuickStats: React.FC<QuickStatsProps> = ({ type }) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-6 animate-fadeIn">
      {stats[type].items.map((stat, index) => (
        <div key={index} className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
          <div className="font-bold">{stat.value}</div>
          <div className="text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
