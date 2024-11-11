// ./front/src/components/navigation.component.tsx
import React, { useState } from 'react';
import NavLeftGroup from './navigation/nav-left-group.component';
import NavCenterGroup from './navigation/nav-center-group.component';
import NavRightGroup from './navigation/nav-right-group.component';
import MobileMenu from './navigation/mobile-menu.component';
import BreadcrumbPath from './navigation/breadcrumb-path.component';
import AboutModal from './modals/about-modal.component';
import LoginModal from './modals/login-modal.component';
import RegisterModal from './modals/register-modal.component';
import AvatarModal from './modals/avatar-modal.component';

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16
                    bg-hauler-gray-100 dark:bg-hauler-gray-900 
                    text-hauler-gray-900 dark:text-white 
                    shadow-medium min-w-[320px]">
        <div className="h-full relative">
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

          <MobileMenu 
            isOpen={isMenuOpen}
            onLoginClick={() => setShowLoginModal(true)}
            onRegisterClick={() => setShowRegisterModal(true)}
          />

          {showBreadcrumbs && <BreadcrumbPath />}
        </div>
      </nav>

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