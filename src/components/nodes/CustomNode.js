import React from 'react';
import { Handle, Position } from 'reactflow';
import '../../styles/CustomNode.css';

// Basit SVG icon'lar - performans için
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22,4 12,14.01 9,11.01"></polyline>
  </svg>
);

const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16,18 22,12 16,6"></polyline>
    <polyline points="8,6 2,12 8,18"></polyline>
  </svg>
);

const CustomNode = ({ data, selected }) => {
  const getNodeIcon = () => {
    switch (data.elementType) {
      case 'if':
      case 'elseif':
      case 'else':
        return <GitBranchIcon />;
      case 'foreach':
        return <RotateIcon />;
      case 'invoke':
        return <PlayIcon />;
      default:
        return <CodeIcon />;
    }
  };

  const getNodeClass = () => {
    let baseClass = 'custom-node';
    if (selected) baseClass += ' selected';
    
    switch (data.elementType) {
      case 'if':
      case 'elseif':
      case 'else':
        return `${baseClass} condition-node`;
      case 'foreach':
        return `${baseClass} loop-node`;
      case 'invoke':
        return `${baseClass} step-node`;
      default:
        return `${baseClass} default-node`;
    }
  };

  const renderElementDetails = () => {
    switch (data.elementType) {
      case 'if':
      case 'elseif':
        return (
          <div className="node-details">
            <div className="condition-text" title={data.condition}>
              {data.condition ? data.condition.substring(0, 50) + '...' : 'Koşul belirtilmemiş'}
            </div>
          </div>
        );
      
      case 'invoke':
        return (
          <div className="node-details">
            {data.stepId && (
              <div className="step-id">Step ID: {data.stepId}</div>
            )}
            {data.flowStatus && (
              <div className="flow-status">Status: {data.flowStatus}</div>
            )}
            {data.interaction && (
              <div className="interaction">
                <AlertIcon />
                {data.interaction}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={getNodeClass()}>
      <Handle
        type="target"
        position={Position.Top}
        className="node-handle"
      />
      
      <div className="node-header">
        <div className="node-icon">
          {getNodeIcon()}
        </div>
        <div className="node-title">
          {data.label}
        </div>
      </div>
      
      {renderElementDetails()}
      
      {selected && (
        <div className="selection-indicator">
          <CheckIcon />
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="node-handle"
      />
    </div>
  );
};

export default CustomNode; 