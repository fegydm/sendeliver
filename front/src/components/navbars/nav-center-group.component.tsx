// ./front/src/components/navbars/nav-center-group.component.tsx
import { type FC, useState } from "react";
import Cookies from "js-cookie";
import AvatarModal from "../modals/avatar-modal.component";
import LoginModal from "../modals/login-modal.component";
import RegisterModal from "../modals/register-modal.component";
import DotsModal from "../modals/dots-modal.component";

type TopRowType = "client" | "forwarder" | "carrier" | null;
type BottomRowType = "anonymous" | "cookies" | "registered" | null;

const DOTS_COOKIE_NAME = "user_dots_settings";
const DEFAULT_COLOR = "#808080";

const NavCenterGroup: FC = () => {
  const [activeModal, setActiveModal] = useState<
    "avatar" | "dots" | "login" | "register" | null
  >(null);

  // Inicializácia z cookies alebo default hodnoty
  const [topDots, setTopDots] = useState<string[]>(() => {
    const savedSettings = Cookies.get(DOTS_COOKIE_NAME);
    if (savedSettings) {
      const { top } = JSON.parse(savedSettings);
      return top;
    }
    return [DEFAULT_COLOR, DEFAULT_COLOR, DEFAULT_COLOR];
  });

  const [bottomDots, setBottomDots] = useState<string[]>(() => {
    const savedSettings = Cookies.get(DOTS_COOKIE_NAME);
    if (savedSettings) {
      const { bottom } = JSON.parse(savedSettings);
      return bottom;
    }
    return [DEFAULT_COLOR, DEFAULT_COLOR, DEFAULT_COLOR];
  });

  const handleModalClose = () => setActiveModal(null);

  const colorMap = {
    client: "#FF00FF",
    forwarder: "#87CEEB",
    carrier: "#4CC417",
    anonymous: "#FF0000",
    cookies: "#FFA500",
    registered: "#008000",
  } as const;

  const saveToStorage = (top: string[], bottom: string[]) => {
    Cookies.set(DOTS_COOKIE_NAME, JSON.stringify({ top, bottom }), {
      expires: 30,
    }); // vyprší za 30 dní
  };

  const handleDotsSelection = (top: TopRowType, bottom: BottomRowType) => {
    let newTopDots = [...topDots];
    let newBottomDots = [...bottomDots];

    // Update top row colors
    if (top) {
      const index = ["client", "forwarder", "carrier"].indexOf(top);
      if (index !== -1 && top in colorMap) {
        newTopDots = newTopDots.map((_, i) =>
          i === index ? colorMap[top] : DEFAULT_COLOR
        );
        setTopDots(newTopDots);
      }
    }

    // Update bottom row colors
    if (bottom) {
      const index = ["anonymous", "cookies", "registered"].indexOf(bottom);
      if (index !== -1 && bottom in colorMap) {
        newBottomDots = newBottomDots.map((_, i) =>
          i === index ? colorMap[bottom] : DEFAULT_COLOR
        );
        setBottomDots(newBottomDots);
      }
    }

    // Save to cookies
    saveToStorage(newTopDots, newBottomDots);
  };

  return (
    <div className="relative flex justify-center items-center w-full h-navbar">
      <div className="relative h-full">
        {/* Avatar - vertikálne centrovaný v navbare */}
        <button
          onClick={() => setActiveModal("avatar")}
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   h-[calc(var(--navbar-height)*0.9)] aspect-square rounded-full 
                   bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
                   hover:opacity-80 transition-opacity"
          aria-label="Open avatar menu"
        >
          <span className="text-base font-medium">A</span>
        </button>

        {/* 6 dots */}
        <button
          onClick={() => setActiveModal("dots")}
          className="absolute right-[60px] top-1/2 -translate-y-1/2"
        >
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {topDots.map((color, index) => (
                <div
                  key={`top-${index}`}
                  className="w-1.5 h-1.5 rounded-full transition-colors duration-modal"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              {bottomDots.map((color, index) => (
                <div
                  key={`bottom-${index}`}
                  className="w-1.5 h-1.5 rounded-full transition-colors duration-modal"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </button>

        {/* Login/Register container */}
        <div className="absolute left-[60px] top-1/2 -translate-y-1/2 hidden lg:flex items-center space-x-4">
          <button
            onClick={() => setActiveModal("login")}
            className="group relative"
          >
            <span className="text-base font-semibold whitespace-nowrap">
              Log&nbsp;In
            </span>
            <span className="absolute left-1/2 right-1/2 bottom-0 h-0.5 bg-current transition-all duration-300 group-hover:left-0 group-hover:right-0" />
          </button>

          <button
            onClick={() => setActiveModal("register")}
            className="px-4 py-1.5 rounded-md bg-navbar-light-button-bg dark:bg-navbar-dark-button-bg text-navbar-light-button-text dark:text-navbar-dark-button-text hover:bg-navbar-light-button-hover dark:hover:bg-navbar-dark-button-hover transition-colors text-sm font-medium whitespace-nowrap"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Modals */}
      <AvatarModal
        isOpen={activeModal === "avatar"}
        onClose={handleModalClose}
      />
      <DotsModal
        isOpen={activeModal === "dots"}
        onClose={handleModalClose}
        onSelectionChange={handleDotsSelection}
        initialTopDots={topDots} // Added required prop
        initialBottomDots={bottomDots} // Added required prop
      />
      <LoginModal isOpen={activeModal === "login"} onClose={handleModalClose} />
      <RegisterModal
        isOpen={activeModal === "register"}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default NavCenterGroup;
