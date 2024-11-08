// ./front/src/components/breadcrumb-path.component.tsx
import React from 'react';
import { ChevronRight, ChevronUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const BreadcrumbPath: React.FC = () => {
  const location = useLocation();

  // Konvertuje cestu na segmenty
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
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                    bg-white dark:bg-hauler-gray-800 rounded-lg shadow-medium 
                    mt-2 py-2 px-4 z-40">
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
        <ChevronUp size={16} />
      </div>
      <div className="flex items-center space-x-2 whitespace-nowrap">
        <Link 
          to="/"
          className="text-hauler-gray-600 dark:text-hauler-gray-300 
                     hover:text-hauler-gray-900 dark:hover:text-white
                     transition-colors"
        >
          home
        </Link>
        {segments.map((segment, index) => (
          <React.Fragment key={segment.path}>
            <ChevronRight size={16} className="text-hauler-gray-400" />
            <Link
              to={segment.path}
              className="text-hauler-gray-600 dark:text-hauler-gray-300 
                         hover:text-hauler-gray-900 dark:hover:text-white
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