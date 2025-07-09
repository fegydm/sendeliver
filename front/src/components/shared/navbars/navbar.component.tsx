// File: front/src/components/shared/navbars/navbar.component.tsx
// Last action: Refactored to use AuthContext and new BEM styles.

import { useState, FC } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import NavbarHamburger from "./NavbarHamburger";
import NavbarLogo from "./NavbarLogo";
import NavbarName from "./NavbarName";
import NavbarDots from "./NavbarDots";
import NavbarAvatar from "./NavbarAvatar";
import NavbarLogin from "./NavbarLogin";
import NavbarRegister from "./NavbarRegister";
import NavbarLanguage from "./NavbarLanguage";
import NavbarDarkmode from "./NavbarDarkmode";
import LoginModal from "@/components/shared/modals/LoginModal";
import RegisterModal from "@/components/shared/modals/RegisterModal";
import AvatarModal from "@/components/shared/modals/AvatarModal";

import "./navbar.component.css";

type ModalType = "login" | "register" | "avatar" | null;

const Navbar: FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleModalClose = () => setActiveModal(null);
  const handleModalOpen = (modalType: ModalType) => setActiveModal(modalType);

  return (
    <header className="navbar">
      <nav className="navbar__container">
        <div className="navbar__group navbar__group--left">
          <div className="navbar__hamburger">
            <NavbarHamburger onLoginClick={() => handleModalOpen("login")} onRegisterClick={() => handleModalOpen("register")} />
          </div>
          <div className="navbar__logo">
            <NavbarLogo />
          </div>
          <div className="navbar__name">
            <NavbarName />
          </div>
        </div>

        <div className="navbar__group navbar__group--right">
          <div className="navbar__language">
            <NavbarLanguage />
          </div>
          <div className="navbar__darkmode">
            <NavbarDarkmode isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
          </div>
          <div className="navbar__session">
            {isAuthenticated ? (
              <NavbarAvatar user={user} onClick={() => handleModalOpen("avatar")} />
            ) : (
              <div className="navbar__auth-actions">
                <NavbarLogin onLoginClick={() => handleModalOpen("login")} />
                <NavbarRegister onRegisterClick={() => handleModalOpen("register")} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modals are managed here */}
      <LoginModal isOpen={activeModal === "login"} onClose={handleModalClose} isDarkMode={isDarkMode} />
      <RegisterModal isOpen={activeModal === "register"} onClose={handleModalClose} />
      <AvatarModal isOpen={activeModal === "avatar"} onClose={handleModalClose} onLogout={logout} />
    </header>
  );
};

export default Navbar;