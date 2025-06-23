import React, { useState } from 'react';
import '../styles/ConnectionGuide.css';

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);

const ConnectionGuide = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button 
        className="guide-toggle-btn"
        onClick={() => setIsVisible(true)}
        title="Bağlantı Kılavuzunu Göster"
      >
        <InfoIcon />
        Bağlantı Kılavuzu
      </button>
    );
  }

  return (
    <div className="connection-guide">
      <div className="guide-header">
        <div className="guide-title">
          <LinkIcon />
          Node Bağlantı Kılavuzu
        </div>
        <button 
          className="guide-close-btn"
          onClick={() => setIsVisible(false)}
          title="Kapat"
        >
          <CloseIcon />
        </button>
      </div>
      
      <div className="guide-content">
        <div className="guide-step">
          <div className="step-number">1</div>
          <div className="step-text">
            <strong>Node Ekle:</strong> Sidebar'dan istediğiniz node tipini seçin
          </div>
        </div>
        
        <div className="guide-step">
          <div className="step-number">2</div>
          <div className="step-text">
            <strong>Bağlantı Çek:</strong> Bir node'un <span className="highlight">ALT MAVİ NOKTASINDAN</span> (çıkış) diğer node'un <span className="highlight">ÜST MAVİ NOKTASINA</span> (giriş) MOUSE ile sürükleyin
          </div>
        </div>
        
        <div className="guide-step">
          <div className="step-number">3</div>
          <div className="step-text">
            <strong>Düzenle:</strong> Node'u seçip Element Özellikleri panelinden düzenleyin
          </div>
        </div>
        
        <div className="guide-step">
          <div className="step-number">4</div>
          <div className="step-text">
            <strong>Sil:</strong> Node/bağlantı seçip <kbd>Delete</kbd> veya <kbd>Backspace</kbd> tuşuna basın
          </div>
        </div>
      </div>
      
      <div className="guide-tips">
        <h4>💡 İpuçları:</h4>
        <ul>
          <li><kbd>Ctrl+Click</kbd> ile çoklu seçim yapabilirsiniz</li>
          <li>Node'ları sürükleyerek hareket ettirebilirsiniz</li>
          <li><strong>MAVİ NOKTALAR:</strong> Node'ların üzerine geldiğinizde yanıp söner ve büyür</li>
          <li><strong>ÜST NOKTA:</strong> Giriş bağlantısı (target handle)</li>
          <li><strong>ALT NOKTA:</strong> Çıkış bağlantısı (source handle)</li>
          <li>INVOKE node'larına exception ekleyebilirsiniz</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionGuide; 