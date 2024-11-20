// ./front/src/components/navigation/nav-breadcrumb.component.tsx
import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const BreadcrumbPath: React.FC = () => {
  const location = useLocation();

  const getPathSegments = (): BreadcrumbSegment[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      return {
        label: segment,
        path,
      };
    });
  };

  const segments = getPathSegments();

  return (
    <div className="w-full bg-navbar-light-bg dark:bg-navbar-dark-bg">
      <div className="max-w-content mx-auto">
        <div className="relative px-4 py-2">
          {/* Main breadcrumb content */}
          <div className="flex items-center space-x-2 text-sm">
            {/* Root/Back navigation */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 dark:text-gray-400">--&gt;</span>
              <span className="text-gray-500 dark:text-gray-400">..</span>
              <Link
                to="/"
                className="text-navbar-light-text dark:text-navbar-dark-text hover:opacity-80 transition-opacity"
              >
                (home)
              </Link>
            </div>

            {/* Path segments */}
            {segments.map((segment) => (
              <React.Fragment key={segment.path}>
                <FaChevronRight
                  className="text-gray-400 dark:text-gray-500"
                  size={12}
                />
                <Link
                  to={segment.path}
                  className="text-navbar-light-text dark:text-navbar-dark-text hover:opacity-80 transition-opacity"
                >
                  {segment.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbPath;
