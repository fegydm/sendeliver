// File: src/pages/test3/index.tsx
import React from 'react';
import SendDeliverAnimation from '@/lib/SendDeliverAnimation'; // Importuj komponentu S

const Test3Page: React.FC = () => {
  return (
    <div>
      <h1>Custom Animation Test</h1>
      <SendDeliverAnimation 
        width={900}
        height={200}
        fill="#ff00ff" // Nastav farbu výplne podľa potreby
        // stroke="black" // Ak chceš obrys
        // strokeWidth={2} // Ak chceš obrys
      />
    </div>
  );
};

export default Test3Page;