// ./front/src/components/footers/page-footer.component.tsx
import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const PageFooter: React.FC = () => {
  const [language, setLanguage] = useState<"sk" | "en">("sk");

  const handleLanguageChange = (lang: "sk" | "en") => {
    setLanguage(lang);
    // Implementuj ďalšiu logiku na zmenu jazyka
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-6">
      <div className="container mx-auto px-4">
        {/* Odkazy */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <ul className="flex gap-4 mb-4 md:mb-0">
            <li>
              <a href="/about" className="hover:underline">
                O nás
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Kontakt
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline">
                Podmienky používania
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:underline">
                GDPR
              </a>
            </li>
          </ul>

          {/* Jazykový prepínač */}
          <div className="flex items-center gap-2">
            <span>Jazyk:</span>
            <button
              onClick={() => handleLanguageChange("sk")}
              className={`px-3 py-1 rounded ${
                language === "sk"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              SK
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1 rounded ${
                language === "en"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Sociálne siete */}
        <div className="flex justify-center gap-4 mb-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-500"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-400"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-pink-500"
          >
            <FaInstagram size={24} />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm">
          © {new Date().getFullYear()} Sendeliver. Všetky práva vyhradené.
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
