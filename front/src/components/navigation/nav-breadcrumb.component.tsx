// ./front/src/components/navigation/nav-breadcrumb.component.tsx
<<<<<<< HEAD
import React from "react";
import { FaChevronRight } from "react-icons/fa";
=======

import React from "react";
import { ChevronRight } from "lucide-react";
>>>>>>> 5430219 (up css)
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
    <div>
      <div>
        <span>--&gt;</span>
        <span>..</span>
        <Link to="/"> (home) </Link>
        {segments.map((segment) => (
          <React.Fragment key={segment.path}>
<<<<<<< HEAD
            <FaChevronRight />
=======
            <ChevronRight />
>>>>>>> 5430219 (up css)
            <Link to={segment.path}>{segment.label}</Link>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbPath;
