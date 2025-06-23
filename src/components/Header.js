import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <h1>🎯 MSP Flow Designer</h1>
          <p>XML tabanlı iş akışlarını görsel olarak tasarlayın</p>
        </div>
        <div className="header-info">
          <span className="version">v1.0.0</span>
          <span className="powered-by">Turkcell için geliştirildi</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 