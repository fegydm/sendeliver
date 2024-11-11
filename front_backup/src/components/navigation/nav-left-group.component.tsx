// ./front/src/components/navigation/nav-left-group.component.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavLeftGroupProps {
  isMenuOpen: boolean;
  showBreadcrumbs: boolean;
  onMenuToggle: () => void;
  onBreadcrumbsToggle: () => void;
  onShowAbout: () => void;
}

const NavLeftGroup: React.FC<NavLeftGroupProps> = ({
  isMenuOpen,
  showBreadcrumbs,
  onMenuToggle,
  onBreadcrumbsToggle,
  onShowAbout,
}) => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center space-x-4">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-hauler-gray-200 dark:hover:bg-hauler-gray-800
                 transition-colors hidden max-[820px]:block"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="relative">
        <Link 
          to="/" 
          className="group" 
          onClick={(e) => {
            e.preventDefault();
            onBreadcrumbsToggle();
          }}
        >
          <img
            src="/favicon.ico"
            alt="Logo"
            className="w-6 h-6 transition-transform transform group-hover:scale-110"
          />
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <ChevronDown 
              size={16} 
              className={`transition-transform ${showBreadcrumbs ? 'rotate-180' : ''}`} 
            />
          </div>
        </Link>
      </div>

      <span 
        onClick={onShowAbout}
        className="hidden min-[620px]:block text-lg font-semibold cursor-pointer relative group"
      >
        SenDeliver
        <span className="absolute left-1/2 bottom-0 h-[2px] bg-current w-0 
                     group-hover:w-full group-hover:left-0 
                     transition-all duration-300" />
      </span>
    </div>
  );
};

export default NavLeftGroup;