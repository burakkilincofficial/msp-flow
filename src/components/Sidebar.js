import React from 'react';
import { useFlow } from '../context/FlowContext';
import ElementProperties from './ElementProperties';
import FlowStats from './FlowStats';
import XmlPreview from './XmlPreview';
import '../styles/Sidebar.css';

// Node ekleme için SVG iconlar
const GitBranchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="m18 9-6 6"></path>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21"></polygon>
  </svg>
);

const RotateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1,4 1,10 7,10"></polyline>
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
  </svg>
);

const Sidebar = () => {
  const { flowData, selectedElement, setFlowData } = useFlow();

  const addNode = (nodeType) => {
    const newNodeId = `node-${Date.now()}`;
    let nodeData = {};
    let nodeTypeClass = 'default';

    switch (nodeType) {
      case 'if':
        nodeTypeClass = 'condition';
        nodeData = {
          label: 'IF Koşulu',
          elementType: 'if',
          condition: '',
          attributes: {}
        };
        break;
      case 'invoke':
        nodeTypeClass = 'step';
        nodeData = {
          label: 'Yeni Adım',
          elementType: 'invoke',
          stepId: '',
          stepDescription: '',
          flowStatus: '',
          successFlowStatus: '',
          failFlowStatus: '',
          interaction: '',
          exceptions: [],
          attributes: {}
        };
        break;
      case 'foreach':
        nodeTypeClass = 'loop';
        nodeData = {
          label: 'ForEach Döngüsü',
          elementType: 'foreach',
          attributes: {}
        };
        break;
    }

    const newNode = {
      id: newNodeId,
      type: nodeTypeClass,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: nodeData
    };

    // FlowData yoksa yeni oluştur
    if (!flowData) {
      setFlowData({
        nodes: [newNode],
        edges: [],
        metadata: {
          processName: 'Yeni Flow',
          version: '1.0'
        }
      });
    } else {
      // Mevcut FlowData'ya ekle
      setFlowData(prevData => ({
        ...prevData,
        nodes: [...prevData.nodes, newNode]
      }));
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>➕ Node Ekle</h3>
        <div className="node-buttons">
          <button className="node-btn condition-btn" onClick={() => addNode('if')}>
            <GitBranchIcon />
            IF Koşulu
          </button>
          <button className="node-btn step-btn" onClick={() => addNode('invoke')}>
            <PlayIcon />
            INVOKE Adımı
          </button>
          <button className="node-btn loop-btn" onClick={() => addNode('foreach')}>
            <RotateIcon />
            ForEach Döngüsü
          </button>
        </div>
      </div>

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