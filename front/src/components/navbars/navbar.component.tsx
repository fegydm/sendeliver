import React, { useState } from "react";
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
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50">
        <nav
          className={`h-navbar ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          } shadow-medium backdrop-blur-sm w-full`}
        >
          <div
            className={`max-w-content mx-auto h-full flex items-center justify-between px-4 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            }`}
          >
            {/* Left Group */}
            <div className="flex items-center">
              <NavLeftGroup
                isMenuOpen={isMenuOpen}
                showBreadcrumbs={showBreadcrumbs}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                onBreadcrumbsToggle={() => setShowBreadcrumbs(!showBreadcrumbs)}
                onShowAbout={() => setShowAboutModal(true)}
              />
            </div>

            {/* Center Group */}
            <div className="flex items-center">
              <NavCenterGroup
                onAvatarClick={() => setShowAvatarModal(true)}
                onLoginClick={() => setShowLoginModal(true)}
                onRegisterClick={() => setShowRegisterModal(true)}
              />
            </div>

            {/* Right Group */}
            <div className="flex items-center">
              <NavRightGroup
                isDarkMode={isDarkMode}
                onToggleDarkMode={onToggleDarkMode}
              />
            </div>

            {/* Hamburger */}
            <NavHamburger
              isOpen={isMenuOpen}
              onLoginClick={() => setShowLoginModal(true)}
              onRegisterClick={() => setShowRegisterModal(true)}
            />
          </div>
        </nav>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div
            className={`${
              isDarkMode ? "bg-gray-700" : "bg-gray-200"
            } shadow-inner-soft`}
          >
            <div className="max-w-content mx-auto px-4">
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
