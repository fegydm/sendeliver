// ./front/src/components/navbars/navbar.component.tsx
import { useState, FC } from "react";
import NavLeftGroup from "./nav-left-group.component";
import NavCenterGroup from "./nav-center-group.component";
import NavRightGroup from "./nav-right-group.component";
import NavHamburger from "./nav-hamburger.component";
import NavBreadcrumb from "./nav-breadcrumb.component";
import AboutModal from "../modals/about-modal.component";
import LoginModal from "../modals/login-modal.component";
import RegisterModal from "../modals/register-modal.component";
import AvatarModal from "../modals/avatar-modal.component";

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-navbar">
        <nav className="bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-navbar">
          <div className="max-w-content mx-auto h-navbar px-4">
            <div className="relative flex items-center justify-between h-full">
              {/* Left Group */}
              <div className="relative z-navside">
                <NavLeftGroup
                  isMenuOpen={isMenuOpen}
                  showBreadcrumbs={showBreadcrumbs}
                  onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                  onBreadcrumbsToggle={() =>
                    setShowBreadcrumbs(!showBreadcrumbs)
                  }
                  onShowAbout={() => setShowAboutModal(true)}
                />
              </div>

              {/* Center Group - ZACHOVANÉ PRESNÉ ZAROVNANIE */}
              <div className="relative z-navcenter">
                <NavCenterGroup
                  onAvatarClick={() => setShowAvatarModal(true)}
                  onLoginClick={() => setShowLoginModal(true)}
                  onRegisterClick={() => setShowRegisterModal(true)}
                />
              </div>

              {/* Right Group */}
              <div className="relative z-navside">
                <NavRightGroup
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={onToggleDarkMode}
                />
              </div>

              {/* Hamburger */}
              <div className="relative z-navside">
                <NavHamburger
                  isOpen={isMenuOpen}
                  onLoginClick={() => setShowLoginModal(true)}
                  onRegisterClick={() => setShowRegisterModal(true)}
                  className="hidden max-lg:block"
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="absolute top-navbar left-0 right-0 z-dropdown shadow-dropdown">
            <div className="w-full bg-navbar-light-bg dark:bg-navbar-dark-bg">
              <div className="max-w-content mx-auto relative">
                <div
                  className="absolute -top-2 w-3 h-3 bg-navbar-light-bg dark:bg-navbar-dark-bg transform rotate-45"
                  style={{
                    left: "var(--chevron-position, var(--spacing-chevron))",
                  }}
                />
                <div className="relative py-2 px-4">
                  <NavBreadcrumb />
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
      <AvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
      />
    </>
  );
};

export default Navigation;
