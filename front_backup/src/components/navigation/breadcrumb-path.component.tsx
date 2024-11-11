// ./front/src/components/navigation/breadcrumb-path.component.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbSegment {
 label: string;
 path: string;
}

const BreadcrumbPath: React.FC = () => {
 const location = useLocation();

 const getPathSegments = (): BreadcrumbSegment[] => {
   const segments = location.pathname.split('/').filter(Boolean);
   return segments.map((segment, index) => {
     const path = '/' + segments.slice(0, index + 1).join('/');
     return {
       label: segment,
       path,
     };
   });
 };

 const segments = getPathSegments();

 return (
   <div className="absolute top-[62px] left-1/2 -translate-x-[3px] text-xs">
     <div className="text-hauler-gray-400 dark:text-hauler-gray-500 flex items-center space-x-1">
       <span>--&gt;</span>
       <span>..</span>
       <Link 
         to="/"
         className="hover:text-hauler-gray-600 dark:hover:text-hauler-gray-300
                  transition-colors"
       >
         (home)
       </Link>
       {segments.map((segment) => (
         <React.Fragment key={segment.path}>
           <ChevronRight size={12} />
           <Link
             to={segment.path}
             className="hover:text-hauler-gray-600 dark:hover:text-hauler-gray-300
                      transition-colors"
           >
             {segment.label}
           </Link>
         </React.Fragment>
       ))}
     </div>
   </div>
 );
};

export default BreadcrumbPath;