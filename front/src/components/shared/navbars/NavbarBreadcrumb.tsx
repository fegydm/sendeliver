// File: front/src/components/shared/navbars/NavbarBreadcrumb.tsx
// Last action: Refactored to BEM methodology.

import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavbarBreadcrumb.css";

interface NavbarBreadcrumbProps {
  onBreadcrumbsToggle: () => void;
  showBreadcrumbs: boolean;
}

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const NavbarBreadcrumb: FC<NavbarBreadcrumbProps> = ({ onBreadcrumbsToggle, showBreadcrumbs }) => {
  const location = useLocation();

  const getPathSegments = (): BreadcrumbSegment[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      path: `/${segments.slice(0, index + 1).join("/")}`,
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
    }));
  };

  const segments = getPathSegments();

  return (
    <div className="breadcrumb">
      <button
        className={`breadcrumb__toggle ${showBreadcrumbs ? "breadcrumb__toggle--active" : ""}`}
        onClick={onBreadcrumbsToggle}
        aria-label="Toggle breadcrumbs"
      >
        ▼
      </button>

      {showBreadcrumbs && (
        <nav className="breadcrumb__nav" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link to="/" className="breadcrumb__link">
                Home
              </Link>
            </li>

            {segments.map((segment, index) => (
              <li key={segment.path} className="breadcrumb__item">
                <span className="breadcrumb__separator">/</span>
                {index === segments.length - 1 ? (
                  <span className="breadcrumb__current-page" aria-current="page">
                    {segment.label}
                  </span>
                ) : (
                  <Link to={segment.path} className="breadcrumb__link">
                    {segment.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
};

export default NavbarBreadcrumb;