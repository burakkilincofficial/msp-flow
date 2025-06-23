import React, { useRef } from 'react';
import '../styles/Toolbar.css';

// Basit SVG icon'lar
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,5 17,10"></polyline>
    <line x1="12" y1="5" x2="12" y2="15"></line>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,15 17,10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1,4 1,10 7,10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);

const LayoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="15" x2="21" y2="15"></line>
    <line x1="3" y1="9" x2="5" y2="9"></line>
    <line x1="3" y1="15" x2="5" y2="15"></line>
  </svg>
);

const ZoomInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const ZoomOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);

const Toolbar = ({ onFileUpload, onExportXml, isLoading }) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/xml') {
      onFileUpload(file);
    } else {
      alert('Lütfen geçerli bir XML dosyası seçin');
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm('Tüm akış temizlenecek. Emin misiniz?')) {
      window.location.reload();
    }
  };

  const handleAutoLayout = () => {
    // Bu fonksiyon FlowCanvas'dan tetiklenecek
    window.dispatchEvent(new CustomEvent('autoLayout'));
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button 
          className="toolbar-btn primary" 
          onClick={handleFileClick}
          disabled={isLoading}
        >
          <UploadIcon />
          XML Yükle
        </button>
        
        <button 
          className="toolbar-btn secondary" 
          onClick={onExportXml}
          disabled={isLoading}
        >
          <DownloadIcon />
          XML İndir
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="toolbar-section">
        <button 
          className="toolbar-btn secondary" 
          onClick={handleAutoLayout}
          title="Otomatik Düzenle"
        >
          <LayoutIcon />
          Otomatik Düzen
        </button>
        
        <button 
          className="toolbar-btn secondary" 
          onClick={handleClearCanvas}
          title="Temizle"
        >
          <ResetIcon />
          Temizle
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          className="toolbar-btn icon-only" 
          title="Yakınlaştır"
          onClick={() => window.dispatchEvent(new CustomEvent('zoomIn'))}
        >
          <ZoomInIcon />
        </button>
        
        <button 
          className="toolbar-btn icon-only" 
          title="Uzaklaştır"
          onClick={() => window.dispatchEvent(new CustomEvent('zoomOut'))}
        >
          <ZoomOutIcon />
        </button>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner-small"></div>
          <span>İşleniyor...</span>
        </div>
      )}
    </div>
  );
};

export default Toolbar; 