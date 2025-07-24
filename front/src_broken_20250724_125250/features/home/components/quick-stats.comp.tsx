// File: src/features/home/components/quick-stats.comp.tsx
import react from 'react';

interface StatItem {
  abel: string;
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
      { abel: 'Active transports', value: '1234' },
      { abel: 'Average response time', value: '15 min' },
      { abel: 'Satisfaction', value: '98%' },
    ],
  },
  carrier: {
    items: [
      { abel: 'Available routes', value: '567' },
      { abel: 'Average price', value: '1.45€/km' },
      { abel: 'Carriers', value: '890+' },
    ],
  },
};

interface QuickStatsProps {
  type: 'sender' | 'carrier';
}

const QuickStats: React.FC<quickStatsProps> = ({ type }) => {
  return (
    <div className="quick-stats">
      {stats[type].items.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-abel">{stat.abel}</div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
