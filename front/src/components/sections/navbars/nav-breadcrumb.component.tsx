// ./front/src/components/navbars/nav-breadcrumb.component.tsx
import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const NavBreadcrumb: FC = () => {
  const location = useLocation();

  const getPathSegments = (): BreadcrumbSegment[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1); // Capitalizácia prvého písmena
      return { label, path };
    });
  };

  const segments = getPathSegments();

  return (
    <div className="absolute z-[40] left-1/2 transform -translate-x-1/2"
         style={{ top: "calc(var(--navbar-height) - 1px)" }}>
      <div className="bg-banner-light-bg dark:bg-banner-dark-bg rounded-b-lg px-3 pb-2">
        <div className="flex items-center space-x-2 text-xs whitespace-nowrap pt-4">
          {/* Home link */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400">{"<"}</span>
            <Link
              to="/"
              className="text-navbar-light-text dark:text-navbar-dark-text 
                       hover:opacity-80 transition-opacity"
            >
              Home
            </Link>
          </div>

          {/* Path segments */}
          {segments.map((segment, index) => (
            <div key={segment.path} className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">/</span>
              {index === segments.length - 1 ? (
                <span className="text-navbar-light-text dark:text-navbar-dark-text font-medium">
                  {segment.label}
                </span>
              ) : (
                <Link
                  to={segment.path}
                  className="text-navbar-light-text dark:text-navbar-dark-text 
                           hover:opacity-80 transition-opacity"
                >
                  {segment.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavBreadcrumb;