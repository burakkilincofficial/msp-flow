import React, { useState, useEffect } from 'react';
import { useFlow } from '../context/FlowContext';
import '../styles/ElementProperties.css';

const ElementProperties = ({ selectedElement }) => {
  const { setFlowData } = useFlow();
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (selectedElement) {
      setProperties(selectedElement.data);
    } else {
      setProperties({});
    }
  }, [selectedElement]);

  const handlePropertyChange = (key, value) => {
    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);
    
    // FlowData'yı güncelle
    if (selectedElement) {
      setFlowData(prevData => {
        if (!prevData) return prevData;
        
        const updatedNodes = prevData.nodes.map(node => 
          node.id === selectedElement.id 
            ? { ...node, data: updatedProperties }
            : node
        );
        
        return { ...prevData, nodes: updatedNodes };
      });
    }
  };

  if (!selectedElement) {
    return (
      <div className="element-properties empty">
        <p>Element seçilmedi</p>
        <small>Düzenlemek için bir element seçin</small>
      </div>
    );
  }

  const renderPropertyField = (key, value, type = 'text') => (
    <div className="property-field" key={key}>
      <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
      {type === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => handlePropertyChange(key, e.target.value)}
          placeholder={`${key} girin...`}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => handlePropertyChange(key, e.target.value)}
          placeholder={`${key} girin...`}
        />
      )}
    </div>
  );

  return (
    <div className="element-properties">
      <div className="element-header">
        <h4>{properties.label || 'Element'}</h4>
        <span className="element-type">{properties.elementType}</span>
      </div>

      <div className="properties-form">
        {properties.elementType === 'if' || properties.elementType === 'elseif' ? (
          <>
            {renderPropertyField('label', properties.label)}
            {renderPropertyField('condition', properties.condition, 'textarea')}
          </>
        ) : properties.elementType === 'invoke' ? (
          <>
            {renderPropertyField('stepDescription', properties.stepDescription)}
            {renderPropertyField('stepId', properties.stepId)}
            {renderPropertyField('flowStatus', properties.flowStatus)}
            {renderPropertyField('successFlowStatus', properties.successFlowStatus)}
            {renderPropertyField('failFlowStatus', properties.failFlowStatus)}
            {renderPropertyField('interaction', properties.interaction)}
          </>
        ) : properties.elementType === 'foreach' ? (
          <>
            {renderPropertyField('label', properties.label)}
          </>
        ) : (
          <>
            {renderPropertyField('label', properties.label)}
          </>
        )}
      </div>

      {properties.attributes && (
        <div className="raw-attributes">
          <h5>Ham Veriler</h5>
          <pre>{JSON.stringify(properties.attributes, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ElementProperties; 