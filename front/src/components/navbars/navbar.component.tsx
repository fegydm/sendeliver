import { useState, FC } from "react";
import NavLeftGroup from "./nav-left-group.component";
import NavCenterGroup from "./nav-center-group.component";
import NavRightGroup from "./nav-right-group.component";
import NavHamburger from "./nav-hamburger.component";
import NavBreadcrumb from "./nav-breadcrumb.component";

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);

  const handleAvatarClick = () => {
    console.log("Avatar clicked");
    // Sem pridaj logiku pre avatar
  };

  const handleLoginClick = () => {
    console.log("Login modal opened");
    // Sem pridaj logiku pre login modal
  };

  const handleRegisterClick = () => {
    console.log("Register modal opened");
    // Sem pridaj logiku pre register modal
  };

  return (
    <>
      <header className="sticky top-0 z-navbar">
        <nav className="bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-navbar">
          <div className="max-w-content mx-auto h-navbar px-4 relative flex items-center justify-between">
            {/* Left Group */}
            <NavLeftGroup
              isMenuOpen={isMenuOpen}
              showBreadcrumbs={showBreadcrumbs}
              onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
              onBreadcrumbsToggle={() => setShowBreadcrumbs(!showBreadcrumbs)}
              onShowAbout={() => console.log("About modal opened")}
            />

            {/* Center Group */}
            <NavCenterGroup
              onAvatarClick={handleAvatarClick}
              onLoginClick={handleLoginClick}
              onRegisterClick={handleRegisterClick}
            />

            {/* Right Group */}
            <NavRightGroup
              isDarkMode={isDarkMode}
              onToggleDarkMode={onToggleDarkMode}
            />

            {/* Hamburger Button */}
            <button
              className="lg:hidden p-2"
              aria-label="Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span>☰</span>
            </button>
          </div>
        </nav>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="absolute top-navbar left-0 right-0 z-dropdown">
            <div className="max-w-content mx-auto relative">
              <div className="flex items-center justify-center">
                <NavBreadcrumb />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hamburger Menu */}
      {isMenuOpen && (
        <NavHamburger
          isOpen={isMenuOpen}
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
          onShowAbout={() => console.log("About modal opened")}
        />
      )}
    </>
  );
};

export default Navigation;
