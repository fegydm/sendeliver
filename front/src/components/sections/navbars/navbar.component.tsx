// File: front/src/components/navbars/navbar.component.tsx
// Last change: Fixed typo in handleDotsSelectionChange

import { useState, FC } from "react";
import NavbarHamburger from "./NavbarHamburger";
import NavbarLogo from "./NavbarLogo";
import NavbarBreadcrumb from "./NavbarBreadcrumb";
import NavbarName from "./NavbarName";
import NavbarDots from "./NavbarDots";
import NavbarAvatar from "./NavbarAvatar";
import NavbarLogin from "./NavbarLogin";
import NavbarRegister from "./NavbarRegister";
import NavbarLanguage from "./NavbarLanguage";
import NavbarDarkmode from "./NavbarDarkmode";
import AboutModal from "@/components/modals/AboutModal";
import DotsModal from "@/components/modals/dots-modal.component";
import AvatarModal from "@/components/modals/avatar.modal";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/register-modal.component";
import { components } from "@/constants/colors/components";
import type { TopRowType, BottomRowType, DotsArray } from "@/types/dots";

import "./navbar.component.css";

type ModalType = "about" | "login" | "register" | "dots" | "avatar" | null;

interface NavigationProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Navbar: FC<NavigationProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [topDots, setTopDots] = useState<DotsArray>(
    Array(3).fill(components.dots.inactive)
  );
  const [bottomDots, setBottomDots] = useState<DotsArray>(
    Array(3).fill(components.dots.inactive)
  );

  const handleBreadcrumbsToggle = () => {
    setShowBreadcrumbs((prev) => !prev);
  };

  const handleModalOpen = (modalType: ModalType) => {
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleDotsSelectionChange = (top: TopRowType, bottom: BottomRowType) => {
    const newTopDots = Array(3).fill(components.dots.inactive);
    const newBottomDots = Array(3).fill(components.dots.inactive);

    if (top) {
      const index = ["client", "forwarder", "carrier"].indexOf(top);
      if (index !== -1) newTopDots[index] = components.dots[top];
    }
    if (bottom) {
      const index = ["anonymous", "cookies", "registered"].indexOf(bottom); // Fixed typo: 'custom' → 'bottom'
      if (index !== -1) newBottomDots[index] = components.dots[bottom];
    }

    setTopDots(newTopDots);
    setBottomDots(newBottomDots);
  };

  return (
    <header className="navbar">
      <nav className="navbar__primary" aria-label="Primary Navigation">
        <div className="navbar__hamburger">
          <NavbarHamburger
            onLoginClick={() => handleModalOpen("login")}
            onRegisterClick={() => handleModalOpen("register")}
            onShowAbout={() => handleModalOpen("about")}
          />
        </div>
        <div className="navbar__logo">
          <NavbarLogo />
        </div>
        <div className="navbar__name">
          <NavbarName onShowAbout={() => handleModalOpen("about")} />
        </div>
        <div className="navbar__dots">
          <NavbarDots
            topDots={topDots}
            bottomDots={bottomDots}
            onClick={() => handleModalOpen("dots")}
          />
        </div>
        <div className="navbar__avatar">
          <NavbarAvatar onClick={() => handleModalOpen("avatar")} />
        </div>
        <div className="navbar__auth">
          <NavbarLogin onLoginClick={() => handleModalOpen("login")} />
          <NavbarRegister onRegisterClick={() => handleModalOpen("register")} />
        </div>
        <div className="navbar__language">
          <NavbarLanguage />
        </div>
        <div className="navbar__darkmode">
          <NavbarDarkmode
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </div>
      </nav>
      <nav className="navbar__breadcrumbs" aria-label="Breadcrumb Navigation">
        <NavbarBreadcrumb
          onBreadcrumbsToggle={handleBreadcrumbsToggle}
          showBreadcrumbs={showBreadcrumbs}
        />
      </nav>

      {/* Modals */}
      <AboutModal isOpen={activeModal === "about"} onClose={handleModalClose} />
      <LoginModal isOpen={activeModal === "login"} onClose={handleModalClose} />
      <RegisterModal
        isOpen={activeModal === "register"}
        onClose={handleModalClose}
      />
      <AvatarModal
        isOpen={activeModal === "avatar"}
        onClose={handleModalClose}
      />
      <DotsModal
        isOpen={activeModal === "dots"}
        onClose={handleModalClose}
        initialTopDots={topDots}
        initialBottomDots={bottomDots}
        onSelectionChange={handleDotsSelectionChange}
      />
    </header>
  );
};

export default Navbar;