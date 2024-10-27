import React from 'react';
import { Home, MessageCircle, Settings, HelpCircle, UserCircle } from 'lucide-react';

const UserState = {
 COOKIES_DISABLED: 'COOKIES_DISABLED', 
 COOKIES_ENABLED: 'COOKIES_ENABLED',
 LOGGED_IN: 'LOGGED_IN'
};

const Navigation = ({ 
 userState = UserState.COOKIES_DISABLED,
 userAvatar = null,
 username = '' 
}) => {
 const getIndicatorColors = (currentState, indicatorState) => {
   const baseClasses = "w-4 h-4 rounded-full mx-1 transition-colors duration-200";
   
   if (currentState === indicatorState) {
     switch (indicatorState) {
       case UserState.COOKIES_DISABLED:
         return `${baseClasses} bg-red-500`;
       case UserState.COOKIES_ENABLED:
         return `${baseClasses} bg-orange-500`;
       case UserState.LOGGED_IN:
         return `${baseClasses} bg-green-500`;
       default:
         return `${baseClasses} bg-gray-300`;
     }
   }
   return `${baseClasses} bg-gray-300`;
 };

 // State pre mobilné menu
 const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

 // Handler pre prepínanie mobilného menu
 const toggleMobileMenu = () => {
   setIsMobileMenuOpen(!isMobileMenuOpen);
 };

 return (
   <nav className="w-full bg-white shadow-md">
     <div className="max-w-7xl mx-auto px-4">
       <div className="flex justify-between items-center h-16">
         {/* Ľavá strana - indikátory a logo */}
         <div className="flex items-center">
           <div className="flex mr-6">
             <div 
               className={getIndicatorColors(userState, UserState.COOKIES_DISABLED)}
               title="Cookies nepovolené"
             />
             <div 
               className={getIndicatorColors(userState, UserState.COOKIES_ENABLED)}
               title="Cookies povolené"
             />
             <div 
               className={getIndicatorColors(userState, UserState.LOGGED_IN)}
               title="Prihlásený používateľ"
             />
           </div>
           
           <Home className="h-6 w-6 text-blue-600" />
           <span className="ml-2 text-xl font-semibold text-gray-800">SenDeliver</span>
         </div>
         
         {/* Hlavné menu */}
         <div className="hidden md:flex items-center space-x-8">
           <a href="/" className="text-gray-600 hover:text-blue-600 flex items-center">
             <Home className="h-5 w-5 mr-1" />
             Domov
           </a>
           <a href="/chat" className="text-gray-600 hover:text-blue-600 flex items-center">
             <MessageCircle className="h-5 w-5 mr-1" />
             Chat
           </a>
           <a href="/settings" className="text-gray-600 hover:text-blue-600 flex items-center">
             <Settings className="h-5 w-5 mr-1" />
             Nastavenia
           </a>
           <a href="/help" className="text-gray-600 hover:text-blue-600 flex items-center">
             <HelpCircle className="h-5 w-5 mr-1" />
             Pomoc
           </a>
         </div>

         {/* Pravá strana - prihlásenie/registrácia alebo profil */}
         <div className="flex items-center space-x-4">
           {userState === UserState.LOGGED_IN ? (
             // Profil prihláseného používateľa
             <div className="flex items-center space-x-3">
               <span className="text-gray-600">{username}</span>
               {userAvatar ? (
                 <img 
                   src={userAvatar} 
                   alt="Profile" 
                   className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                 />
               ) : (
                 <UserCircle className="w-10 h-10 text-gray-400" />
               )}
             </div>
           ) : (
             // Tlačidlá pre neprihlásených
             <div className="flex items-center space-x-4">
               <a 
                 href="/login" 
                 className="text-blue-600 hover:text-blue-700"
               >
                 Prihlásenie
               </a>
               <a 
                 href="/register" 
                 className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
               >
                 Registrácia
               </a>
             </div>
           )}
         </div>

         {/* Mobilné menu - hamburger */}
         <div className="md:hidden flex items-center">
           <button 
             onClick={toggleMobileMenu}
             className="text-gray-600 hover:text-blue-600 focus:outline-none"
           >
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
         </div>
       </div>
     </div>

     {/* Mobilné menu - obsah */}
     <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
       <div className="px-2 pt-2 pb-3 space-y-1">
         <a href="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Domov</a>
         <a href="/chat" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Chat</a>
         <a href="/settings" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Nastavenia</a>
         <a href="/help" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Pomoc</a>
         {userState !== UserState.LOGGED_IN && (
           <>
             <a href="/login" className="block px-3 py-2 text-blue-600 hover:text-blue-700">Prihlásenie</a>
             <a href="/register" className="block px-3 py-2 text-blue-600 hover:text-blue-700">Registrácia</a>
           </>
         )}
       </div>
     </div>
   </nav>
 );
};

export default Navigation;