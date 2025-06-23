import React from 'react';
import '../styles/Header.css';

// Turkcell Logo SVG
const TurkcellLogo = () => (
  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="32" rx="4" fill="#FFD900"/>
    <text x="60" y="20" textAnchor="middle" fill="#000" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">
      Turkcell
    </text>
  </svg>
);

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <TurkcellLogo />
          <div className="header-title">
            <h1>MSP Flow Designer</h1>
            <p>XML Akış Tasarımcısı</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-info">
            <span className="version">v1.0.0</span>
            <span className="environment">Production</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 