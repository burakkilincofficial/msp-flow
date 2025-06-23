import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  GitBranch, 
  Play, 
  RotateCw, 
  CheckCircle, 
  AlertCircle,
  Code 
} from 'lucide-react';
import '../../styles/CustomNode.css';

const CustomNode = ({ data, selected }) => {
  const getNodeIcon = () => {
    switch (data.elementType) {
      case 'if':
      case 'elseif':
      case 'else':
        return <GitBranch size={16} />;
      case 'foreach':
        return <RotateCw size={16} />;
      case 'invoke':
        return <Play size={16} />;
      default:
        return <Code size={16} />;
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
                <AlertCircle size={12} />
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
          <CheckCircle size={14} />
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