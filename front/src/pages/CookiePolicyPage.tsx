// File: front/src/pages/CookiePolicyPage.tsx
// Last action: Converted from Tailwind CSS to inline styles for compatibility.

import React from 'react';

const CookiePolicyPage: React.FC = () => {
  // --- Štýly nahradzujúce Tailwind CSS ---
  const containerStyle: React.CSSProperties = {
    maxWidth: '48rem', // max-w-4xl
    margin: '0 auto', // mx-auto
    padding: '3rem 1rem', // py-12 px-4
    color: '#2d3748', // text-gray-800
    fontFamily: 'sans-serif',
  };

  const h1Style: React.CSSProperties = {
    fontSize: '2.25rem', // text-4xl
    fontWeight: 'bold', // font-bold
    marginBottom: '1.5rem', // mb-6
  };
  
  const h2Style: React.CSSProperties = {
    fontSize: '1.5rem', // text-2xl
    fontWeight: 'bold', // font-bold
    marginTop: '2rem', // mt-8
    marginBottom: '1rem', // mb-4
  };

  const pStyle: React.CSSProperties = {
    marginBottom: '1.5rem', // mb-6
    lineHeight: '1.6',
  };
  
  const pSubtleStyle: React.CSSProperties = {
    marginBottom: '1rem', // mb-4
    color: '#4a5568',
  };

  const listStyle: React.CSSProperties = {
    listStyleType: 'disc', // list-disc
    listStylePosition: 'inside', // list-inside
    marginBottom: '1.5rem', // mb-6
  };

  const listItemStyle: React.CSSProperties = {
    marginBottom: '0.5rem', // space-y-2
  };

  return (
    <div style={containerStyle}>
      <h1 style={h1Style}>Cookie Policy</h1>
      <p style={pSubtleStyle}>Last updated: July 17, 2025</p>

      <p style={pStyle}>
        This Cookie Policy explains how SenDeliver ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
      </p>

      <h2 style={h2Style}>What are cookies?</h2>
      <p style={pStyle}>
        A cookie is a small data file that is placed on your device. We use a single, functional cookie for our demo experience. This cookie helps us remember your preferences (like your chosen guest avatar) between visits, but only if you provide consent.
      </p>

      <h2 style={h2Style}>The Cookie We Use</h2>
      <ul style={listStyle}>
        <li style={listItemStyle}>
          <strong>guestAvatar:</strong> This is a functional cookie used to store your selected guest avatar for our demo. It helps create a more personalized, continuous experience. Its lifespan is 30 days.
        </li>
      </ul>

      <h2 style={h2Style}>Your Choices</h2>
      <p style={pStyle}>
        You have the right to decide whether to accept or reject this cookie. You can exercise your preferences by clicking on the appropriate options in the consent modal that appears when you first visit our site. If you choose not to accept, your demo settings will not be saved, but you can still fully explore the platform.
      </p>
    </div>
  );
};

export default CookiePolicyPage;
