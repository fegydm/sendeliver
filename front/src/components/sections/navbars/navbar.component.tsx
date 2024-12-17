// ./front/src/components/navbars/navbar.component.tsx
import { useState, FC, useCallback } from "react";
import NavLeftGroup from "@/components/sections/navbars/NavbarGroupLeft";
import NavCenterGroup from "@/components/sections/navbars/NavbarGroupCenter";
import NavRightGroup from "@/components/sections/navbars/NavbarGroupRight";
import AboutModal from "@/components/modals/about-modal.component";
import LoginModal from "@/components/modals/login.modal";
import RegisterModal from "@/components/modals/register-modal.component";
import DotsModal from "@/components/modals/dots-modal.component";
import AvatarModal from "@/components/modals/avatar.modal";
import { components } from "@/constants/colors/components";
import type { TopRowType, BottomRowType, DotsArray } from "../../../types/dots";
import "@/styles/components/_navbar.css"; // Import custom CSS

type ModalType = "about" | "login" | "register" | "dots" | "avatar" | null;

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navigation: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [topDots, setTopDots] = useState<DotsArray>(
    Array(3).fill(components.dots.inactive)
  );
  const [bottomDots, setBottomDots] = useState<DotsArray>(
    Array(3).fill(components.dots.inactive)
  );

  const handleModalOpen = useCallback((modalType: ModalType) => {
    setActiveModal(modalType);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleBreadcrumbsToggle = useCallback(() => {
    setShowBreadcrumbs((prev) => !prev);
  }, []);

  const handleDotsSelectionChange = useCallback(
    (top: TopRowType, bottom: BottomRowType) => {
      const newTopDots = Array(3).fill(components.dots.inactive);
      const newBottomDots = Array(3).fill(components.dots.inactive);

      if (top) {
        const index = ["client", "forwarder", "carrier"].indexOf(top);
        if (index !== -1) newTopDots[index] = components.dots[top];
      }
      if (bottom) {
        const index = ["anonymous", "cookies", "registered"].indexOf(bottom);
        if (index !== -1) newBottomDots[index] = components.dots[bottom];
      }

      setTopDots(newTopDots);
      setBottomDots(newBottomDots);
    },
    []
  );

  return (
    <header className="navbar-header">
      <nav className={`navbar ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="navbar-container">
          <div className="navbar-group left">
            <NavLeftGroup
              showBreadcrumbs={showBreadcrumbs}
              onBreadcrumbsToggle={handleBreadcrumbsToggle}
              onShowAbout={() => handleModalOpen("about")}
              onLoginClick={() => handleModalOpen("login")}
              onRegisterClick={() => handleModalOpen("register")}
            />
          </div>

          <div className="navbar-group center">
            <NavCenterGroup
              onAvatarClick={() => handleModalOpen("avatar")}
              onDotsClick={() => handleModalOpen("dots")}
              onLoginClick={() => handleModalOpen("login")}
              onRegisterClick={() => handleModalOpen("register")}
              topDots={topDots}
              bottomDots={bottomDots}
            />
          </div>

          <div className="navbar-group right">
            <NavRightGroup
              isDarkMode={isDarkMode}
              onToggleDarkMode={onToggleDarkMode}
            />
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AboutModal isOpen={activeModal === "about"} onClose={handleModalClose} />
      <LoginModal isOpen={activeModal === "login"} onClose={handleModalClose} />
      <RegisterModal
        isOpen={activeModal === "register"}
        onClose={handleModalClose}
      />
      <DotsModal
        isOpen={activeModal === "dots"}
        onClose={handleModalClose}
        initialTopDots={topDots}
        initialBottomDots={bottomDots}
        onSelectionChange={handleDotsSelectionChange}
      />
      <AvatarModal
        isOpen={activeModal === "avatar"}
        onClose={handleModalClose}
      />
    </header>
  );
};

export default Navigation;
