// ./front/src/components/navbars/navbar.component.tsx
import { useState, FC } from "react";
import NavLeftGroup from "./nav-left-group.component";
import NavCenterGroup from "./nav-center-group.component";
import NavRightGroup from "./nav-right-group.component";

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);

  return (
    <header className="sticky top-0 z-navbar">
      <nav className="bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-navbar">
        {/* Main container with config width */}
        <div className="max-w-content mx-auto px-4">
          {/* Inner container for flex alignment */}
          <div className="h-navbar flex items-center">
            {/* Layout groups with flex-basis for better space distribution */}
            <div className="flex-1">
              <NavLeftGroup
                showBreadcrumbs={showBreadcrumbs}
                onBreadcrumbsToggle={() => setShowBreadcrumbs(!showBreadcrumbs)}
                onShowAbout={() => console.log("About modal opened")}
              />
            </div>

            <div className="flex-1 flex justify-center">
              <NavCenterGroup />
            </div>

            <div className="flex-1 flex justify-end">
              <NavRightGroup
                isDarkMode={isDarkMode}
                onToggleDarkMode={onToggleDarkMode}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
