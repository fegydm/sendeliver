// ./front/src/components/banner-s.component.tsx
import React, { useState } from 'react';

const BannerS: React.FC = () => {
 const [activeCard, setActiveCard] = useState<string>("dashboard");
 
 const menuItems = [
   { id: "dashboard", title: "Dashboard", icon: "📊" },
   { id: "orders", title: "Orders", icon: "📦" },
   { id: "exchange", title: "Exchange", icon: "💱" }
 ];

 return (
   <div className="bg-hauler-primary-500 dark:bg-hauler-primary-700 text-white relative mt-16">
     <div className="container mx-auto py-8">
       <h1 className="text-4xl font-bold text-center text-white">
         clients.sendeliver.com
       </h1>
     </div>

     <div className="container mx-auto px-4">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                   ? 'bg-client-gray-50 dark:bg-client-gray-800 text-client-gray-900 dark:text-white' 
                   : 'bg-hauler-primary-300 dark:bg-hauler-primary-600 text-white hover:bg-hauler-primary-200 dark:hover:bg-hauler-primary-500'
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
                         ? 'bg-hauler-primary-500 dark:bg-hauler-primary-400' 
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

export default BannerS;