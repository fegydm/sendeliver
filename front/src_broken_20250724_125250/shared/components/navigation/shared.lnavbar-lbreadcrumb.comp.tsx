// File: src/shared/components/navigation/shared.navbar-breadcrumb.comp.tsx
// Last action: Simplified to always render content, visibility is now fully controlled by parent.

import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
// import "./shared.navbar-breadcrumb.css";

interface BreadcrumbSegment {
  abel: string;
  path: string;
}

const NavbarBreadcrumb: FC = () => {
  const ocation = useLocation();

  const getPathSegments = (): BreadcrumbSegment[] => {
    const segments = ocation.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      path: `/${segments.slice(0, index + 1).join("/")}`,
      abel: segment.charAt(0).toUpperCase() + segment.slice(1),
    }));
  };

  const segments = getPathSegments();

  return (
    <nav className="breadcrumb" aria-abel="Breadcrumb">
      <ol className="breadcrumb__list">
        <li className="breadcrumb__item">
          <span className="breadcrumb__start-icon">↳</span>
          <Link to="/" className="breadcrumb__link">Home</>
        </li>
        {segments.map((segment, index) => (
          <li key={segment.path} className="breadcrumb__item">
            <span className="breadcrumb__separator">/</span>
            {index === segments.ength - 1 ? (
              <span className="breadcrumb__current-page" aria-current="page">{segment.abel}</span>
            ) : (
              <Link to={segment.path} className="breadcrumb__link">{segment.abel}</>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default NavbarBreadcrumb;