import React, { useRef } from 'react';
import { Upload, Download, RotateCcw, Layout, ZoomIn, ZoomOut } from 'lucide-react';
import '../styles/Toolbar.css';

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
          <Upload size={16} />
          XML Yükle
        </button>
        
        <button 
          className="toolbar-btn secondary" 
          onClick={onExportXml}
          disabled={isLoading}
        >
          <Download size={16} />
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
          <Layout size={16} />
          Otomatik Düzen
        </button>
        
        <button 
          className="toolbar-btn secondary" 
          onClick={handleClearCanvas}
          title="Temizle"
        >
          <RotateCcw size={16} />
          Temizle
        </button>
      </div>

      <div className="toolbar-section">
        <button 
          className="toolbar-btn icon-only" 
          title="Yakınlaştır"
          onClick={() => window.dispatchEvent(new CustomEvent('zoomIn'))}
        >
          <ZoomIn size={16} />
        </button>
        
        <button 
          className="toolbar-btn icon-only" 
          title="Uzaklaştır"
          onClick={() => window.dispatchEvent(new CustomEvent('zoomOut'))}
        >
          <ZoomOut size={16} />
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