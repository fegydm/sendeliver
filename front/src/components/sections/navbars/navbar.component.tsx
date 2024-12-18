// ./front/src/components/navbars/navbar.component.tsx
import { useState, FC } from "react";
import NavbarBreadcrumb from "./NavbarBreadcrumb";
import NavbarDarkmode from "./NavbarDarkmode";
import NavbarDots from "./NavbarDots";
import NavbarHamburger from "./NavbarHamburger";
import NavbarLanguage from "./NavbarLanguage";
import NavbarLogin from "./NavbarLogin";
import NavbarLogo from "./NavbarLogo";
import NavbarName from "./NavbarName";
import NavbarRegister from "./NavbarRegister";
import NavbarAvatar from "./NavbarAvatar";
import AboutModal from "@/components/modals/about-modal.component";
import LoginModal from "@/components/modals/login.modal";
import RegisterModal from "@/components/modals/register-modal.component";
import DotsModal from "@/components/modals/dots-modal.component";
import AvatarModal from "@/components/modals/avatar.modal";
import { components } from "@/constants/colors/components";
import type { TopRowType, BottomRowType, DotsArray } from "@/types/dots";

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
      const index = ["anonymous", "cookies", "registered"].indexOf(bottom);
      if (index !== -1) newBottomDots[index] = components.dots[bottom];
    }

    setTopDots(newTopDots);
    setBottomDots(newBottomDots);
  };

  return (
    <header className="navbar">
      <NavbarHamburger
        onLoginClick={() => handleModalOpen("login")}
        onRegisterClick={() => handleModalOpen("register")}
        onShowAbout={() => handleModalOpen("about")}
      />
      <NavbarLogo />
      <NavbarBreadcrumb
        onBreadcrumbsToggle={handleBreadcrumbsToggle}
        showBreadcrumbs={showBreadcrumbs}
      />
      <NavbarName onShowAbout={() => handleModalOpen("about")} />
      <NavbarAvatar onClick={() => handleModalOpen("avatar")} />
      <NavbarDots
        topDots={topDots}
        bottomDots={bottomDots}
        onClick={() => handleModalOpen("dots")}
      />
      <NavbarLogin onLoginClick={() => handleModalOpen("login")} />
      <NavbarRegister onRegisterClick={() => handleModalOpen("register")} />
      <NavbarLanguage />
      <NavbarDarkmode
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
      />

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