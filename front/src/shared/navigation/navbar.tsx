// File: src/shared/navigation/navbar.tsx
// Last change: Added hamburger menu and fixed TypeScript error for LoginModal onNavigateToRegister prop

import { useState, FC, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { components } from "@/constants/colors/components";
import type { DotsArray, TopRowType, BottomRowType } from "@/types/dots";
import NavbarLogo from "./logo.navbar";
import NavbarName from "./name.navbar";
import NavbarLanguage from "./language.navbar";
import NavbarDarkmode from "./darkmode.navbar";
import NavbarDots from "./dots.navbar";
import NavbarAvatar from "./avatar.navbar";
import NavbarUserInfo from "./user-info.navbar";
import NavbarLogin from "./login.navbar";
import NavbarRegister from "./register.navbar";
import NavbarBreadcrumb from "./breadcrumb.navbar";
import NavbarHamburger from "./hamburger.navbar";
import AvatarModal from "@/shared/modals/avatar.modal";
import DotsModal from "@/shared/modals/dots.modal";
import AboutModal from "@/shared/modals/about.modal";
import ConfirmLogoutModal from "@/shared/modals/confirm-logout.modal";
import DemoWelcomeModal from "@/shared/modals/demo-welcome.modal";
import RegisterModal from "@/shared/modals/register.modal";
import LoginModal from "@/shared/modals/login.modal";
import "./navbar.css";

type ModalType = "avatar" | "dots" | "about" | "confirmLogout" | "demoWelcome" | "login" | "register" | null;

const ZODIAC_SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};

const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const Navbar: FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout, isAuthenticated, updateUserRole, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(false);
  
  const initialDotsState: DotsArray = [components.dots.inactive, components.dots.inactive, components.dots.inactive];
  const [topDots, setTopDots] = useState<DotsArray>(initialDotsState);
  const [bottomDots, setBottomDots] = useState<DotsArray>(initialDotsState);

  const [cookiesAllowed, setCookiesAllowed] = useState(false);
  const [guestAvatar, setGuestAvatar] = useState<string>(ZODIAC_SIGNS[0]);
  const [explicitTopRole, setExplicitTopRole] = useState<TopRowType | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      setCookiesAllowed(true);
      return;
    } else if (consent === null) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) handleModalOpen('demoWelcome');
      }, 5000);
      return () => clearTimeout(timer);
    }
    return;
  }, [isAuthenticated]);

  const handleModalClose = () => setActiveModal(null);
  const handleModalOpen = (modalType: ModalType) => setActiveModal(modalType);
  const handleBreadcrumbsToggle = () => setShowBreadcrumbs(prev => !prev);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setCookiesAllowed(true);
    handleModalClose();
  };

  const handleDeclineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setCookiesAllowed(false);
    handleModalClose();
  };

  const handleAcceptAndRegister = () => {
    handleAcceptCookies();
    handleModalOpen('register');
  };

  const handleNavigateToPolicy = () => {
    handleModalClose();
    navigate('/cookie-policy');
  };

  const handleNavigateToRegister = () => {
    handleModalClose();
    handleModalOpen('register');
  };

  useEffect(() => {
    if (!isAuthenticated && cookiesAllowed) {
      const savedGuestAvatar = getCookie('guestAvatar');
      if (savedGuestAvatar && ZODIAC_SIGNS.includes(savedGuestAvatar)) {
        setGuestAvatar(savedGuestAvatar);
      }
      const savedGuestRole = getCookie('guestRole') as TopRowType;
      if (savedGuestRole) {
        setExplicitTopRole(savedGuestRole);
      }
    }
  }, [isAuthenticated, cookiesAllowed]);

  const handleLogout = () => {
    handleModalClose();
    logout();
  };
  
  const handleAvatarSave = async (avatarId: string) => {
    if (!isAuthenticated) {
      if (cookiesAllowed) {
        setCookie('guestAvatar', avatarId, 30);
        setGuestAvatar(avatarId);
      }
    } else if (user && updateUserAvatar) {
      try {
        const avatarUrl = `/avatars/zodiac/${avatarId}.png`;
        await updateUserAvatar(avatarUrl);
      } catch (error) {
        console.error("Failed to save user avatar:", error);
      }
    }
    handleModalClose();
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
    const roleToDisplay = isAuthenticated ? user?.selectedRole : explicitTopRole;

    if (roleToDisplay) {
      const topIndex = topKeys.indexOf(roleToDisplay);
      if (topIndex !== -1) newTopDots[topIndex] = components.dots[roleToDisplay];
    } else {
      const path = location.pathname;
      if (path.includes("/sender") || path.includes("/client")) {
        newTopDots[0] = components.dots.client;
      } else if (path.includes("/hauler") || path.includes("/carrier")) {
        newTopDots[2] = components.dots.carrier;
      }
    }
    setTopDots(newTopDots);
  }, [location.pathname, user?.selectedRole, explicitTopRole, isAuthenticated]);
  
  const handleDotsSelectionChange = async (top: TopRowType | null, bottom: BottomRowType | null) => {
    handleModalClose();
    if (top) {
      setExplicitTopRole(top);
      if (isAuthenticated && user && updateUserRole) {
        await updateUserRole(top);
      } else if (!isAuthenticated && cookiesAllowed) {
        setCookie('guestRole', top, 30);
      }
    }
    if (bottom) {
      if (bottom === 'registered') handleModalOpen('register');
      if (bottom === 'cookies') handleModalOpen('demoWelcome');
      if (bottom === 'anonymous') handleDeclineCookies();
    }
  };
  
  return (
    <header className="navbar-wrapper">
      <div className="navbar">
        <div className="navbar__group navbar__group--left">
          {!isAuthenticated && (
            <NavbarHamburger 
              onLoginClick={() => handleModalOpen('login')}
              onRegisterClick={() => handleModalOpen('register')}
              onShowAbout={() => handleModalOpen('about')}
            />
          )}
          <NavbarLogo onBreadcrumbToggle={handleBreadcrumbsToggle} showBreadcrumbs={showBreadcrumbs} />
          <NavbarName onShowAbout={() => handleModalOpen("about")} />
        </div>
        <div className="navbar__group navbar__group--center">
          <NavbarDots topDots={topDots} bottomDots={bottomDots} onClick={() => handleModalOpen("dots")} />
          <NavbarAvatar 
            onUserClick={() => handleModalOpen("avatar")}
            onGuestClick={() => handleModalOpen("avatar")}
            cookiesAllowed={cookiesAllowed}
            guestAvatar={guestAvatar}
          />
          {isAuthenticated && user ? (
            <NavbarUserInfo user={user} />
          ) : (
            <>
              <NavbarLogin onOpen={() => handleModalOpen('login')} />
              <NavbarRegister onOpen={() => handleModalOpen('register')} />
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
      <AboutModal isOpen={activeModal === "about"} onClose={handleModalClose} onNavigateToRegister={() => handleModalOpen('register')} />
      <AvatarModal 
        isOpen={activeModal === "avatar"} 
        onClose={handleModalClose} 
        onLogout={handleLogout}
        onSave={handleAvatarSave}
        isGuestMode={!isAuthenticated}
        cookiesAllowed={cookiesAllowed}
        initialAvatar={!isAuthenticated ? guestAvatar : user?.imageUrl}
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
      <DemoWelcomeModal 
        isOpen={activeModal === 'demoWelcome'}
        onAccept={handleAcceptCookies}
        onDecline={handleDeclineCookies}
        onAcceptAndRegister={handleAcceptAndRegister}
        onNavigateToPolicy={handleNavigateToPolicy}
      />
      <LoginModal 
        isOpen={activeModal === 'login'}
        onClose={handleModalClose}
        onNavigateToRegister={handleNavigateToRegister}
      />
      <RegisterModal 
        isOpen={activeModal === 'register'}
        onClose={handleModalClose}
      />
    </header>
  );
};

export default Navbar;