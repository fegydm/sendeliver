// File: ./front/src/components/sections/footers/FooterMenu.tsx

import React from "react";

const FooterMenu: React.FC = () => {
    return (
        <div className="footer__menu">
            <a href="/about" className="footer__menu-item">About</a>
            <a href="/services" className="footer__menu-item">Services</a>
            <a href="/contact" className="footer__menu-item">Contact</a>
            <a href="/privacy" className="footer__menu-item">Privacy</a>
        </div>
    );
};

export default FooterMenu;
