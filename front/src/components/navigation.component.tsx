// ./front/src/components/navigation.component.tsx
import React, { useState } from "react";
import NavLeftGroup from "./navigation/nav-left-group.component";
import NavCenterGroup from "./navigation/nav-center-group.component";
import NavRightGroup from "./navigation/nav-right-group.component";
import NavHamburger from "./navigation/nav-hamburger.component";
import NavBreadcrumb from "./navigation/nav-breadcrumb.component";
import AboutModal from "./modals/about-modal.component";
import LoginModal from "./modals/login-modal.component";
import RegisterModal from "./modals/register-modal.component";
import AvatarModal from "./modals/avatar-modal.component";

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="h-navbar bg-gray-100 dark:bg-gray-900 shadow-medium backdrop-blur-sm">
          <div className="container mx-auto px-container h-full">
            <div className="flex h-full items-center justify-between">
              <NavLeftGroup
                isMenuOpen={isMenuOpen}
                showBreadcrumbs={showBreadcrumbs}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                onBreadcrumbsToggle={() => setShowBreadcrumbs(!showBreadcrumbs)}
                onShowAbout={() => setShowAboutModal(true)}
              />

              <NavCenterGroup
                onAvatarClick={() => setShowAvatarModal(true)}
                onLoginClick={() => setShowLoginModal(true)}
                onRegisterClick={() => setShowRegisterModal(true)}
              />

              <NavRightGroup
                isDarkMode={isDarkMode}
                onToggleDarkMode={onToggleDarkMode}
              />

              <NavHamburger
                isOpen={isMenuOpen}
                onLoginClick={() => setShowLoginModal(true)}
                onRegisterClick={() => setShowRegisterModal(true)}
              />
            </div>
          </div>
        </nav>

        {showBreadcrumbs && (
          <div className="bg-gray-100 dark:bg-gray-900 shadow-inner-soft">
            <div className="container mx-auto px-container">
              <div className="text-xs">
                <NavBreadcrumb />
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
