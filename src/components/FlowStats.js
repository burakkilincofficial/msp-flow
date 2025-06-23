import React from 'react';
import '../styles/FlowStats.css';

const FlowStats = ({ flowData }) => {
  if (!flowData) {
    return (
      <div className="flow-stats empty">
        <p>Akış yüklenmedi</p>
      </div>
    );
  }

  const { nodes = [] } = flowData;
  
  const stats = {
    total: nodes.length,
    conditions: nodes.filter(n => n.data.elementType === 'if' || n.data.elementType === 'elseif').length,
    steps: nodes.filter(n => n.data.elementType === 'invoke').length,
    loops: nodes.filter(n => n.data.elementType === 'foreach').length,
  };

  return (
    <div className="flow-stats">
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Toplam Element</div>
        </div>
        
        <div className="stat-card condition">
          <div className="stat-value">{stats.conditions}</div>
          <div className="stat-label">Koşul</div>
        </div>
        
        <div className="stat-card step">
          <div className="stat-value">{stats.steps}</div>
          <div className="stat-label">Adım</div>
        </div>
        
        <div className="stat-card loop">
          <div className="stat-value">{stats.loops}</div>
          <div className="stat-label">Döngü</div>
        </div>
      </div>
      
      <div className="process-info">
        <div className="info-item">
          <strong>Process:</strong> {flowData.processName || 'Unnamed'}
        </div>
        <div className="info-item">
          <strong>Version:</strong> {flowData.version || '1.0'}
        </div>
      </div>
    </div>
  );
};

export default FlowStats; 