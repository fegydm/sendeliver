// ./front/src/components/Navigation.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = ({ authStatus }) => {
 const getStatusColor = () => {
   switch(authStatus) {
     case 'anonymous': return 'bg-red-500';
     case 'cookie': return 'bg-yellow-500';
     case 'authenticated': return 'bg-green-500';
     default: return 'bg-red-500';
   }
 }

 return (
   <nav className="bg-gray-200 p-4 flex items-center justify-between">
     <div className="flex items-center gap-2">
       <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
       <div className="space-x-2">
         <button className="text-gray-700 hover:text-gray-900">Login</button>
         <button className="text-gray-700 hover:text-gray-900">Register</button>
       </div>
     </div>
   </nav>
 );
};

export default Navigation;