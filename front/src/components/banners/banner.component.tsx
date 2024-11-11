// ./front/src/components/banners/banner.component.tsx
import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web/build/player/lottie_light.min';
import deliveryAnimation from '@/public/animations/sendeliver-text.json';

const Banner: React.FC = () => {
 const container = useRef<HTMLDivElement>(null);
 const anim = useRef<AnimationItem | null>(null);

 useEffect(() => {
   if (container.current && !anim.current) {
     anim.current = lottie.loadAnimation({
       container: container.current,
       renderer: 'svg',
       loop: true,
       autoplay: true,
       animationData: deliveryAnimation,
       rendererSettings: {
         progressiveLoad: true,
         hideOnTransparent: false,
         className: 'lottie-svg'
       }
     });

     // Optimalizácia výkonu
     anim.current.setSubframe(false);
   }

   return () => {
     if (anim.current) {
       anim.current.destroy();
       anim.current = null;
     }
   };
 }, []);

 return (
   <div className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
     <div className="container mx-auto px-4 py-12">
       <div className="grid md:grid-cols-2 gap-8 items-center">
         <div className="space-y-4">
           <h1 className="text-4xl font-bold">
             Jednoduché a rýchle prepojenie dopravy
           </h1>
           <p className="text-lg opacity-90">
             Nájdite najvhodnejších prepravcov alebo zákazky pre vaše vozidlá.
             S pomocou AI asistenta je to ešte jednoduchšie!
           </p>
         </div>
         
         <div className="relative h-48 md:h-64 overflow-hidden">
           <div 
             ref={container} 
             className="absolute inset-0 scale-125"
             aria-hidden="true"
           />
         </div>
       </div>
     </div>
     
     {/* Dekoratívne prvky */}
     <div 
       className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white dark:to-gray-900" 
       aria-hidden="true"
     />
     <div 
       className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500" 
       aria-hidden="true"
     />
   </div>
 );
};

export default Banner;