// ./front/src/components/navbars/NavbarBreadcrumb.tsx
import { FC } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarBreadcrumbProps {
  onBreadcrumbsToggle: () => void;
  showBreadcrumbs: boolean;
}

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const NavbarBreadcrumb: FC<NavbarBreadcrumbProps> = ({
  onBreadcrumbsToggle,
  showBreadcrumbs,
}) => {
  const location = useLocation();

  const getPathSegments = (): BreadcrumbSegment[] => {
    const segments = location.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      path: "/" + segments.slice(0, index + 1).join("/"),
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
    }));
  };

  const segments = getPathSegments();

  return (
    <div className="navbar-breadcrumb">
      {/* Toggle Button */}
      <button
        className={`navbar-breadcrumb-toggle ${showBreadcrumbs ? "active" : ""}`}
        onClick={onBreadcrumbsToggle}
        aria-label="Toggle breadcrumbs"
      >
        {showBreadcrumbs ? "▲" : "▼"}
      </button>

      {/* Breadcrumb Navigation */}
      {showBreadcrumbs && (
        <nav className="navbar-breadcrumb-navigation">
          <div className="navbar-breadcrumb-items">
            {/* Home Link */}
            <div className="navbar-breadcrumb-item">
              <Link to="/" className="navbar-breadcrumb-link">
                Home
              </Link>
            </div>

            {/* Path Segments */}
            {segments.map((segment, index) => (
              <div key={segment.path} className="navbar-breadcrumb-item">
                <span className="navbar-breadcrumb-separator">/</span>
                {index === segments.length - 1 ? (
                  <span className="navbar-breadcrumb-current">
                    {segment.label}
                  </span>
                ) : (
                  <Link to={segment.path} className="navbar-breadcrumb-link">
                    {segment.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default NavbarBreadcrumb;