// front/src/components/footers/FooterMenu.tsx

import React from "react";

const FooterMenu: React.FC = () => {
  return (
    <ul className="flex gap-4 text-sm">
      <li>
        <a href="/about" className="hover:underline">
          About
        </a>
      </li>
      <li>
        <a href="/contact" className="hover:underline">
          Contact
        </a>
      </li>
      <li>
        <a href="/terms" className="hover:underline">
          Terms of Use
        </a>
      </li>
      <li>
        <a href="/privacy" className="hover:underline">
          GDPR
        </a>
      </li>
    </ul>
  );
};

export default FooterMenu;
