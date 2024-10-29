// ./front/src/components/Banner.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';

const Banner = () => {
 return (
   <div className="w-full bg-black py-12 relative">
     <Player
       autoplay
       loop
       src="/animations/sendeliver-text.json"
       className="w-full h-32"
     />
     <div className="absolute -bottom-6 left-0 right-0 flex justify-center space-x-4">
       <Link 
         to="/clients"
         className="px-8 py-3 bg-[#FF00FF] text-white rounded-lg transform hover:scale-105 transition-all"
       >
         Clients
       </Link>
       <Link 
         to="/carriers"
         className="px-8 py-3 bg-[#74cc04] text-white rounded-lg transform hover:scale-105 transition-all"
       >
         Carriers
       </Link>
     </div>
   </div>
 );
};

export default Banner;