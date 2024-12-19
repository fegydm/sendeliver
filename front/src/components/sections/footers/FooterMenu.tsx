// ./front/src/components/footers/FooterMenu.tsx

import React from "react";

const FooterMenu: React.FC = () => {
  return (
    <ul className="footer-menu">
      <li>
        <a href="/about">About</a>
      </li>
      <li>
        <a href="/contact">Contact</a>
      </li>
      <li>
        <a href="/terms">Terms of Use</a>
      </li>
      <li>
        <a href="/privacy">GDPR</a>
      </li>
    </ul>
  );
};

export default FooterMenu;
