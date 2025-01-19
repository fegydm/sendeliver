// ./front/src/components/navbars/NavbarLanguage.tsx
import { FC } from "react";

interface NavbarLanguageProps {
  onClick?: () => void;
}

const NavbarLanguage: FC<NavbarLanguageProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="navbar__language" aria-label="Change language">
      L {/* Visible text for the button */}
      <img
        src="/flags/4x3/optimized/gb.svg"
        alt="Change language"
        className="navbar-language-icon"
      />
    </button>
  );
};

export default NavbarLanguage;
