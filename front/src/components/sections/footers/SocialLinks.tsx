// front/src/components/footers/SocialLinks.tsx

import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const SocialLinks: React.FC = () => {
  return (
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
  );
};

export default SocialLinks;
