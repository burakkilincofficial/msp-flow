import React, { useState } from 'react';
import { useFlow } from '../context/FlowContext';
import { XmlProcessor } from '../utils/xmlProcessor';
import '../styles/XmlPreview.css';

// Basit SVG icon'lar
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const FormatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4,7 4,4 20,4 20,7"></polyline>
    <line x1="9" y1="20" x2="15" y2="20"></line>
    <line x1="12" y1="4" x2="12" y2="20"></line>
  </svg>
);

const XmlPreview = () => {
  const { xmlContent, setXmlContent } = useFlow();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  const handleCopy = async () => {
    if (xmlContent) {
      try {
        await navigator.clipboard.writeText(xmlContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Kopyalama başarısız:', err);
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFormatXml = async () => {
    if (!xmlContent) return;
    
    setIsFormatting(true);
    try {
      const processor = new XmlProcessor();
      const formattedXml = processor.formatXml(xmlContent);
      setXmlContent(formattedXml);
      console.log('XML başarıyla formatlandı');
    } catch (error) {
      console.error('XML formatting error:', error);
      alert('XML formatlanırken hata oluştu: ' + error.message);
    } finally {
      setIsFormatting(false);
    }
  };

  if (!xmlContent) {
    return (
      <div className="xml-preview empty">
        <p>XML içeriği yok</p>
        <small>Bir XML dosyası yükleyin</small>
      </div>
    );
  }

  const displayContent = isExpanded 
    ? xmlContent 
    : xmlContent.substring(0, 300) + (xmlContent.length > 300 ? '...' : '');

  return (
    <div className="xml-preview">
      <div className="preview-header">
        <h5>XML İçeriği</h5>
        <div className="preview-actions">
          <button 
            className="action-btn"
            onClick={handleFormatXml}
            disabled={isFormatting}
            title="XML'i Formatla"
          >
            <FormatIcon />
            {isFormatting ? 'Formatlanıyor...' : 'Formatla'}
          </button>
          <button 
            className="action-btn"
            onClick={toggleExpand}
            title={isExpanded ? 'Daralt' : 'Genişlet'}
          >
            {isExpanded ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          <button 
            className="action-btn"
            onClick={handleCopy}
            title="Kopyala"
          >
            <CopyIcon />
            {copied && <span className="copied-indicator">✓</span>}
          </button>
        </div>
      </div>
      
      <div className={`xml-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <pre>{displayContent}</pre>
      </div>
      
      <div className="preview-info">
        <small>
          {xmlContent.length} karakter
          {!isExpanded && xmlContent.length > 300 && ' (kısaltılmış)'}
        </small>
      </div>
    </div>
  );
};

export default XmlPreview; 