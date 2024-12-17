// front/src/components/sections/footers/FooterSocial.tsx
import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const SOCIAL_LINKS = [
  {
    icon: FaFacebook,
    href: "https://facebook.com",
    label: "Facebook",
    className: "social-facebook",
  },
  {
    icon: FaTwitter,
    href: "https://twitter.com",
    label: "Twitter",
    className: "social-twitter",
  },
  {
    icon: FaLinkedin,
    href: "https://linkedin.com",
    label: "LinkedIn",
    className: "social-linkedin",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com",
    label: "Instagram",
    className: "social-instagram",
  },
] as const;

const SocialLinks: React.FC = () => {
  return (
    <div className="flex gap-6">
      {SOCIAL_LINKS.map(({ icon: Icon, href, label, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`social-icon ${className}`}
          aria-label={label}
        >
          <Icon size={24} />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
