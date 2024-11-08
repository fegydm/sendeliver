// ./front/src/components/navigation/nav-center-group.component.tsx
import React from 'react';

interface NavCenterGroupProps {
 onAvatarClick: () => void;
 onLoginClick: () => void;
 onRegisterClick: () => void;
}

const NavCenterGroup: React.FC<NavCenterGroupProps> = ({
 onAvatarClick,
 onLoginClick,
 onRegisterClick
}) => {
 return (
   <>
     {/* 6 bodiek */}
     <div className="absolute left-[calc(50%-6rem)] top-1/2 -translate-y-1/2 hidden min-[620px]:block">
       <div className="grid grid-rows-2 grid-cols-3 gap-1">
         <div className="w-2 h-2 rounded-full bg-pink-500" />
         <div className="w-2 h-2 rounded-full bg-blue-500" />
         <div className="w-2 h-2 rounded-full bg-green-500" />
         <div className="w-2 h-2 rounded-full bg-purple-500" />
         <div className="w-2 h-2 rounded-full bg-yellow-500" />
         <div className="w-2 h-2 rounded-full bg-red-500" />
       </div>
     </div>

     {/* Avatar */}
     <div 
       onClick={onAvatarClick}
       className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 
                 cursor-pointer transition-transform hover:scale-110"
     >
       <div className="w-10 h-10 rounded-full bg-hauler-gray-200 dark:bg-hauler-gray-700 
                     flex items-center justify-center">
         <span className="text-sm font-medium">A</span>
       </div>
     </div>

     {/* Login/register */}
     <div className="absolute left-[calc(50%+1.5rem)] top-1/2 -translate-y-1/2 hidden min-[820px]:block">
       <div className="flex items-center space-x-3">
         <button 
           onClick={onLoginClick}
           className="px-3 py-2 rounded-lg hover:bg-hauler-gray-200 
                   dark:hover:bg-hauler-gray-800 transition-colors whitespace-nowrap"
         >
           Log In
         </button>
         <button 
           onClick={onRegisterClick}
           className="px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 
                   text-white transition-colors whitespace-nowrap"
         >
           Create account
         </button>
       </div>
     </div>
   </>
 );
};

export default NavCenterGroup;