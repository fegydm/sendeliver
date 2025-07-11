// File: front/src/components/shared/navbars/navbar.component.tsx
// Last action: Integrated authentication state to hide/show login elements properly

import { useState, FC } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { components } from "@/constants/colors/components";
import type { DotsArray, TopRowType, BottomRowType } from "@/types/dots";
import NavbarLogo from "./NavbarLogo";
import NavbarName from "./NavbarName";
import NavbarLanguage from "./NavbarLanguage";
import NavbarDarkmode from "./NavbarDarkmode";
import NavbarDots from "./NavbarDots";
import NavbarAvatar from "./NavbarAvatar";
import NavbarLogin from "./NavbarLogin";
import NavbarRegister from "./NavbarRegister";
import NavbarBreadcrumb from "./NavbarBreadcrumb";
import LoginModal from "@/components/shared/modals/LoginModal";
import RegisterModal from "@/components/shared/modals/RegisterModal";
import AvatarModal from "@/components/shared/modals/AvatarModal";
import DotsModal from "@/components/shared/modals/DotsModal";
import AboutModal from "@/components/shared/modals/AboutModal";
import "./navbar.component.css";

type ModalType = "login" | "register" | "avatar" | "dots" | "about" | null;

const Navbar: FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { logout, isAuthenticated } = useAuth(); // Removed loading as it's not needed here
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  
  const initialDotsState: DotsArray = [components.dots.inactive, components.dots.inactive, components.dots.inactive];
  const [topDots, setTopDots] = useState<DotsArray>(initialDotsState);
  const [bottomDots, setBottomDots] = useState<DotsArray>(initialDotsState);

  const handleModalClose = () => setActiveModal(null);
  const handleModalOpen = (modalType: ModalType) => setActiveModal(modalType);
  const handleBreadcrumbsToggle = () => setShowBreadcrumbs(prev => !prev);

  const handleDotsSelectionChange = (top: TopRowType, bottom: BottomRowType) => {
    const newTopDots: DotsArray = Array(3).fill(components.dots.inactive);
    const newBottomDots: DotsArray = Array(3).fill(components.dots.inactive);
    const topKeys: TopRowType[] = ["client", "forwarder", "carrier"];
    const bottomKeys: BottomRowType[] = ["anonymous", "cookies", "registered"];
    if (top) {
      const topIndex = topKeys.indexOf(top);
      if (topIndex !== -1) newTopDots[topIndex] = components.dots[top];
    }
    if (bottom) {
      const bottomIndex = bottomKeys.indexOf(bottom);
      if (bottomIndex !== -1) newBottomDots[bottomIndex] = components.dots[bottom];
    }
    setTopDots(newTopDots);
    setBottomDots(newBottomDots);
  };

  const handleNavigateToRegister = () => {
    handleModalClose();
    setTimeout(() => handleModalOpen('register'), 150);
  };

  // Close login modal after successful authentication
  if (isAuthenticated && activeModal === 'login') {
    handleModalClose();
  }
  
  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <div className="navbar__group navbar__group--left">
          <NavbarLogo onBreadcrumbToggle={handleBreadcrumbsToggle} showBreadcrumbs={showBreadcrumbs} />
          <NavbarName onShowAbout={() => handleModalOpen("about")} />
        </div>

        <div className="navbar__group navbar__group--center">
          <NavbarDots topDots={topDots} bottomDots={bottomDots} onClick={() => handleModalOpen("dots")} />
          <NavbarAvatar onGuestClick={() => handleModalOpen("login")} onUserClick={() => handleModalOpen("avatar")} />
          
          {/* Login/Register components handle their own authentication checks */}
          <NavbarLogin onLoginClick={() => handleModalOpen("login")} />
          <NavbarRegister onRegisterClick={() => handleModalOpen("register")} />
        </div>

        <div className="navbar__group navbar__group--right">
          <NavbarLanguage />
          <NavbarDarkmode isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        </div>
      </div>
      
      {showBreadcrumbs && (
        <div className="navbar__breadcrumb-container">
          <NavbarBreadcrumb />
        </div>
      )}

      <AboutModal isOpen={activeModal === "about"} onClose={handleModalClose} onNavigateToRegister={handleNavigateToRegister} />
      <LoginModal isOpen={activeModal === "login"} onClose={handleModalClose} />
      <RegisterModal isOpen={activeModal === "register"} onClose={handleModalClose} />
      <AvatarModal isOpen={activeModal === "avatar"} onClose={handleModalClose} onLogout={logout} />
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