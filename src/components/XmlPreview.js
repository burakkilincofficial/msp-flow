import React, { useState } from 'react';
import { useFlow } from '../context/FlowContext';
import { Copy, Eye, EyeOff } from 'lucide-react';
import '../styles/XmlPreview.css';

const XmlPreview = () => {
  const { xmlContent } = useFlow();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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
            onClick={toggleExpand}
            title={isExpanded ? 'Daralt' : 'Genişlet'}
          >
            {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button 
            className="action-btn"
            onClick={handleCopy}
            title="Kopyala"
          >
            <Copy size={14} />
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