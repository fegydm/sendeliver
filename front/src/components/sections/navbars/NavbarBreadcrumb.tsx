// ./front/src/components/navbars/NavbarBreadcrumb.tsx
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
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, path };
    });
  };

  const segments = getPathSegments();

  return (
    <div className="navbar-breadcrumb">
      <div className="navbar-breadcrumb-container">
        <div className="navbar-breadcrumb-items">
          {/* Home link */}
          <div className="navbar-breadcrumb-item">
            <span className="breadcrumb-separator">{"<"}</span>
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
          </div>

          {/* Path segments */}
          {segments.map((segment, index) => (
            <div key={segment.path} className="navbar-breadcrumb-item">
              <span className="breadcrumb-separator">/</span>
              {index === segments.length - 1 ? (
                <span className="breadcrumb-current">{segment.label}</span>
              ) : (
                <Link to={segment.path} className="breadcrumb-link">
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
