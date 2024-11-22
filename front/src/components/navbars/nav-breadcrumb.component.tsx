// ./front/src/components/navbars/nav-breadcrumb.component.tsx
import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbSegment {
  label: string;
  path: string;
}

// Komponent pre vlastnú šípku
const BreadcrumbArrow: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-6 h-6 text-gray-400 dark:text-gray-500"
    width="24"
    height="24"
  >
    <path
      d="M7 10l5 5 5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BreadcrumbPath: FC = () => {
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
    <div className="flex items-center space-x-2 text-xs">
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
        <div key={segment.path} className="flex items-center space-x-2">
          {/* Vlastná šípka */}
          <BreadcrumbArrow />
          <Link
            to={segment.path}
            className="text-navbar-light-text dark:text-navbar-dark-text hover:opacity-80 transition-opacity"
          >
            {segment.label}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default BreadcrumbPath;
