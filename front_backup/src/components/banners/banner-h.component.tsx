// ./front/src/components/banner-h.component.tsx
import React, { useState } from 'react';

const BannerH: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string>("dashboard");
  
  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: "📊" },
    { id: "fleet", title: "Fleet", icon: "🚛" },
    { id: "people", title: "People", icon: "👥" },
    { id: "logbook", title: "Logbook", icon: "📓" },
    { id: "exchange", title: "Exchange", icon: "💱" }
  ];

  return (
    <div className="bg-client-primary-500 dark:bg-client-primary-700 text-white relative mt-16"> {/* Pridaný margin-top pre nav menu */}
      <div className="container mx-auto py-8"> {/* Zväčšený padding */}
        <h1 className="text-4xl font-bold text-center text-white">
          carriers.sendeliver.com
        </h1>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {menuItems.map((item) => {
            const isActive = activeCard === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => setActiveCard(item.id)}
                className="group cursor-pointer"
              >
                <div className={`
                  rounded-t-md p-3
                  transition-all duration-300 ease-in-out
                  hover:scale-105
                  ${isActive 
                    ? 'bg-hauler-gray-50 dark:bg-hauler-gray-800 text-hauler-gray-900 dark:text-white' 
                    : 'bg-client-primary-300 dark:bg-client-primary-600 text-white hover:bg-client-primary-200 dark:hover:bg-client-primary-500'
                  }
                `}>
                  <div className="flex flex-col items-center">
                    <div className="text-xl mb-1">
                      {item.icon}
                    </div>
                    <div className="relative">
                      <h2 className="text-base font-semibold">
                        {item.title}
                      </h2>
                      <div className={`
                        absolute -bottom-1 left-1/2 w-0 h-0.5 
                        group-hover:w-full group-hover:left-0 
                        transition-all duration-300 ease-out
                        ${isActive 
                          ? 'bg-client-primary-500 dark:bg-client-primary-400' 
                          : 'bg-white'
                        }
                      `} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BannerH;