// File: front/src/components/shared/navbars/navbar.component.tsx
// Last action: Correctly wired props for the dual-purpose AvatarModal.

import { useState, FC, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import NavbarUserInfo from "./NavbarUserInfo";
import NavbarLogin from "./NavbarLogin";
import NavbarRegister from "./NavbarRegister";
import NavbarBreadcrumb from "./NavbarBreadcrumb";
import AvatarModal from "@/components/shared/modals/AvatarModal";
import DotsModal from "@/components/shared/modals/DotsModal";
import AboutModal from "@/components/shared/modals/AboutModal";
import ConfirmLogoutModal from "@/components/shared/modals/ConfirmLogoutModal";
import "./navbar.component.css";

type ModalType = "avatar" | "dots" | "about" | "confirmLogout" | null;

const Navbar: FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, isAuthenticated, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  
  const initialDotsState: DotsArray = [components.dots.inactive, components.dots.inactive, components.dots.inactive];
  const [topDots, setTopDots] = useState<DotsArray>(initialDotsState);
  const [bottomDots, setBottomDots] = useState<DotsArray>(initialDotsState);

  const [cookiesAllowed, setCookiesAllowed] = useState(true);

  const handleModalClose = () => setActiveModal(null);
  const handleModalOpen = (modalType: ModalType) => setActiveModal(modalType);
  const handleBreadcrumbsToggle = () => setShowBreadcrumbs(prev => !prev);

  const handleLogout = () => {
    handleModalClose();
    logout();
  };

  useEffect(() => {
    const newBottomDots: DotsArray = [...initialDotsState];
    if (isAuthenticated) {
      newBottomDots[2] = components.dots.registered;
    } else if (cookiesAllowed) {
      newBottomDots[1] = components.dots.cookies;
    } else {
      newBottomDots[0] = components.dots.anonymous;
    }
    setBottomDots(newBottomDots);
  }, [isAuthenticated, cookiesAllowed]);

  useEffect(() => {
    const newTopDots: DotsArray = [...initialDotsState];
    const topKeys: TopRowType[] = ["client", "forwarder", "carrier"];
    
    const selectedRole = user?.selectedRole;

    if (selectedRole) {
      const topIndex = topKeys.indexOf(selectedRole);
      if (topIndex !== -1) newTopDots[topIndex] = components.dots[selectedRole];
    } else {
      const path = location.pathname;
      if (path.includes("/sender") || path.includes("/client")) {
        newTopDots[0] = components.dots.client;
      } else if (path.includes("/hauler") || path.includes("/carrier")) {
        newTopDots[2] = components.dots.carrier;
      }
    }
    setTopDots(newTopDots);
  }, [location.pathname, user?.selectedRole]);
  
  const handleDotsSelectionChange = async (top: TopRowType | null, bottom: BottomRowType | null) => {
    if (top && isAuthenticated && user && updateUserRole) {
      try {
        await updateUserRole(top);
      } catch (error) {
        console.error("Failed to save user role:", error);
      }
    }
    
    if (isAuthenticated && user && (bottom === 'anonymous' || bottom === 'cookies')) {
      handleModalOpen('confirmLogout');
    }
  };

  const handleNavigateToRegister = () => {
    handleModalClose();
    navigate("/register");
  };
  
  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <div className="navbar__group navbar__group--left">
          <NavbarLogo onBreadcrumbToggle={handleBreadcrumbsToggle} showBreadcrumbs={showBreadcrumbs} />
          <NavbarName onShowAbout={() => handleModalOpen("about")} />
        </div>

        <div className="navbar__group navbar__group--center">
          <NavbarDots topDots={topDots} bottomDots={bottomDots} onClick={() => handleModalOpen("dots")} />
          <NavbarAvatar 
            onUserClick={() => handleModalOpen("avatar")}
            onGuestClick={() => handleModalOpen("avatar")}
            cookiesAllowed={cookiesAllowed}
          />
          
          {isAuthenticated && user ? (
            <NavbarUserInfo user={user} />
          ) : (
            <>
              <NavbarLogin />
              <NavbarRegister />
            </>
          )}
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
      <AvatarModal 
        isOpen={activeModal === "avatar"} 
        onClose={handleModalClose} 
        onLogout={handleLogout}
        isGuestMode={!isAuthenticated}
        cookiesAllowed={cookiesAllowed}
      />
      <DotsModal 
        isOpen={activeModal === "dots"} 
        onClose={handleModalClose} 
        initialTopDots={topDots} 
        initialBottomDots={bottomDots} 
        onSelectionChange={handleDotsSelectionChange}
      />
      <ConfirmLogoutModal 
        isOpen={activeModal === 'confirmLogout'}
        onClose={handleModalClose}
        onConfirm={handleLogout}
      />
    </header>
  );
};

export default Navbar;
