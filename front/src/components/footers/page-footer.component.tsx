// ./front/src/components/footers/page-footer.component.tsx
import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const PageFooter: React.FC = () => {
  const [languageMode, setLanguageMode] = useState<boolean>(false);

  const toggleLanguageMode = () => {
    setLanguageMode((prevMode) => !prevMode);
    console.log(`Language Mode: ${languageMode ? "No" : "Yes"}`);
  };

  return (
    <footer className="relative w-full bg-footer-light dark:bg-footer-dark text-footer-light dark:text-footer-dark py-6">
      <div className="max-w-content mx-auto px-container flex flex-col gap-6">
        {/* Language Mode Switch */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-4 bg-footer-light dark:bg-footer-dark px-4 py-2 rounded-lg shadow">
          <span className="text-sm font-medium">Language Mode:</span>
          <button
            onClick={toggleLanguageMode}
            className={`relative w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors ${
              languageMode ? "bg-blue-500" : "bg-gray-300"
            }`}
            aria-label="Toggle Language Mode"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                languageMode ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm">{languageMode ? "Yes" : "No"}</span>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-6 mt-12">
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

        {/* Menu */}
        <ul className="flex justify-end gap-4 text-sm mt-6">
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

        {/* Copyright */}
        <div className="text-center text-xs mt-6">
          © {new Date().getFullYear()} Sendeliver. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
