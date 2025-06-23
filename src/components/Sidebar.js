import React from 'react';
import { useFlow } from '../context/FlowContext';
import ElementProperties from './ElementProperties';
import FlowStats from './FlowStats';
import XmlPreview from './XmlPreview';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { flowData, selectedElement } = useFlow();

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>📊 Akış İstatistikleri</h3>
        <FlowStats flowData={flowData} />
      </div>

      <div className="sidebar-section">
        <h3>🔧 Element Özellikleri</h3>
        <ElementProperties selectedElement={selectedElement} />
      </div>

      <div className="sidebar-section">
        <h3>🔍 XML Önizleme</h3>
        <XmlPreview />
      </div>
    </div>
  );
};

export default Sidebar; 