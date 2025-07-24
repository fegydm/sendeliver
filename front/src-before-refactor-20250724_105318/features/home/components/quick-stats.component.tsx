// ./front/src/components/sections/stats/quick-stats.component.tsx
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
      { label: 'Active transports', value: '1234' },
      { label: 'Average response time', value: '15 min' },
      { label: 'Satisfaction', value: '98%' },
    ],
  },
  carrier: {
    items: [
      { label: 'Available routes', value: '567' },
      { label: 'Average price', value: '1.45€/km' },
      { label: 'Carriers', value: '890+' },
    ],
  },
};

interface QuickStatsProps {
  type: 'sender' | 'carrier';
}

const QuickStats: React.FC<QuickStatsProps> = ({ type }) => {
  return (
    <div className="quick-stats">
      {stats[type].items.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
