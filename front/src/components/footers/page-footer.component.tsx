// front/src/components/footers/page-footer.component.tsx
import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import ColorPaletteModal from "@components/modals/color-palette-modal.component";
import { Switch } from "@components/ui/switch";

const PageFooter: React.FC = () => {
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);

  const toggleColorPalette = () => {
    setIsColorPaletteOpen((prevState) => !prevState);
  };

  return (
    <footer className="relative w-full bg-footer-light dark:bg-footer-dark text-footer-light dark:text-footer-dark py-4">
      <div className="max-w-content mx-auto px-container">
        {/* Switcher Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Switch
              defaultValue={false}
              onChange={(value) => console.log(`Switcher value: ${value}`)}
            />
            <span className="text-sm font-medium">Custom Switcher</span>
          </div>
          <div className="flex justify-center w-full">
            <div className="flex gap-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-social-facebook hover:opacity-80"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-social-twitter hover:opacity-80"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-social-linkedin hover:opacity-80"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-social-instagram hover:opacity-80"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          {/* Color Palette Link */}
          <div>
            <button
              className="text-sm hover:underline"
              onClick={toggleColorPalette}
            >
              Tailwind Color Palette
            </button>
            <ColorPaletteModal
              isOpen={isColorPaletteOpen}
              onClose={toggleColorPalette}
            />
          </div>

          {/* Copyright */}
          <div className="text-xs">
            © {new Date().getFullYear()} Sendeliver. All rights reserved.
          </div>

          {/* Menu */}
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
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
