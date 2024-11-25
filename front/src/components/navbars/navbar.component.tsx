// ./front/src/components/navbars/navbar.component.tsx
import { useState, FC, useCallback } from "react";
import NavLeftGroup from "@navbars/nav-left-group.component";
import NavCenterGroup from "@navbars/nav-center-group.component";
import NavRightGroup from "@navbars/nav-right-group.component";
import AboutModal from "@modals/about-modal.component";
import LoginModal from "@modals/login-modal.component";
import RegisterModal from "@modals/register-modal.component";
import DotsModal from "@modals/dots-modal.component";
import AvatarModal from "@modals/avatar-modal.component";
import { components } from "@constants/colors/components";
import type { TopRowType, BottomRowType, DotsArray } from "../../types/dots";

type ModalType = 'about' | 'login' | 'register' | 'dots' | 'avatar' | null;

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  // Navigation states
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Dots states
  const [topDots, setTopDots] = useState<DotsArray>([
    components.dots.inactive,
    components.dots.inactive,
    components.dots.inactive,
  ]);
  const [bottomDots, setBottomDots] = useState<DotsArray>([
    components.dots.inactive,
    components.dots.inactive,
    components.dots.inactive,
  ]);

  // Modal handlers
  const handleModalOpen = useCallback((modalType: ModalType) => {
    setActiveModal(modalType);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Handler pre breadcrumbs
  const handleBreadcrumbsToggle = useCallback(() => {
    setShowBreadcrumbs(prev => !prev);
  }, []);

  // Handler pre zmenu dots
  const handleDotsSelectionChange = useCallback((top: TopRowType, bottom: BottomRowType) => {
    const newTopDots: DotsArray = Array(3).fill(components.dots.inactive);
    const newBottomDots: DotsArray = Array(3).fill(components.dots.inactive);

    if (top) {
      const index = ["client", "forwarder", "carrier"].indexOf(top);
      if (index !== -1) {
        newTopDots[index] = components.dots[top];
      }
    }

    if (bottom) {
      const index = ["anonymous", "cookies", "registered"].indexOf(bottom);
      if (index !== -1) {
        newBottomDots[index] = components.dots[bottom];
      }
    }

    setTopDots(newTopDots);
    setBottomDots(newBottomDots);
  }, []);

  return (
    <header className="sticky top-0 z-navbar">
      <nav className="bg-navbar-light-bg dark:bg-navbar-dark-bg shadow-navbar 
                    border-b border-navbar-light-border dark:border-navbar-dark-border">
        <div className="max-w-content mx-auto px-4">
          <div className="h-navbar flex items-center">
            {/* Left Group */}
            <div className="flex-1">
              <NavLeftGroup
                showBreadcrumbs={showBreadcrumbs}
                onBreadcrumbsToggle={handleBreadcrumbsToggle}
                onShowAbout={() => handleModalOpen('about')}
                onLoginClick={() => handleModalOpen('login')}
                onRegisterClick={() => handleModalOpen('register')}
              />
            </div>

            {/* Center Group */}
            <div className="flex-1 flex justify-center">
              <NavCenterGroup 
                onAvatarClick={() => handleModalOpen('avatar')}
                onDotsClick={() => handleModalOpen('dots')}
                onLoginClick={() => handleModalOpen('login')}
                onRegisterClick={() => handleModalOpen('register')}
                topDots={topDots}
                bottomDots={bottomDots}
              />
            </div>

            {/* Right Group */}
            <div className="flex-1 flex justify-end">
              <NavRightGroup
                isDarkMode={isDarkMode}
                onToggleDarkMode={onToggleDarkMode}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AboutModal 
        isOpen={activeModal === 'about'}
        onClose={handleModalClose}
      />
      <LoginModal 
        isOpen={activeModal === 'login'}
        onClose={handleModalClose}
      />
      <RegisterModal 
        isOpen={activeModal === 'register'}
        onClose={handleModalClose}
      />
      <DotsModal 
        isOpen={activeModal === 'dots'}
        onClose={handleModalClose}
        initialTopDots={topDots}
        initialBottomDots={bottomDots}
        onSelectionChange={handleDotsSelectionChange}
      />
      <AvatarModal 
        isOpen={activeModal === 'avatar'}
        onClose={handleModalClose}
      />
    </header>
  );
};

export default Navigation;