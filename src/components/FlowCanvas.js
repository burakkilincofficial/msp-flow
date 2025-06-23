import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
} from 'reactflow';
import { useFlow } from '../context/FlowContext';
import CustomNode from './nodes/CustomNode';
import '../styles/FlowCanvas.css';

const nodeTypes = {
  condition: CustomNode,
  step: CustomNode,
  loop: CustomNode,
  default: CustomNode,
};

const FlowCanvas = () => {
  const { flowData, selectedElement, setSelectedElement } = useFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // FlowData değiştiğinde nodes ve edges'i güncelle
  useEffect(() => {
    if (flowData) {
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
      
      // Kısa bir delay ile fitView çağır
      setTimeout(() => {
        fitView({ padding: 0.1 });
      }, 100);
    }
  }, [flowData, setNodes, setEdges, fitView]);

  // Bağlantı oluşturma
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Node seçimi
  const onNodeClick = useCallback((event, node) => {
    setSelectedElement(node);
  }, [setSelectedElement]);

  // Auto layout event listener
  useEffect(() => {
    const handleAutoLayout = () => {
      // Basit bir otomatik düzenleme algoritması
      const layoutedNodes = nodes.map((node, index) => ({
        ...node,
        position: {
          x: (index % 3) * 300 + 100,
          y: Math.floor(index / 3) * 150 + 100,
        },
      }));
      setNodes(layoutedNodes);
      
      setTimeout(() => {
        fitView({ padding: 0.1 });
      }, 100);
    };

    const handleZoomIn = () => zoomIn();
    const handleZoomOut = () => zoomOut();

    window.addEventListener('autoLayout', handleAutoLayout);
    window.addEventListener('zoomIn', handleZoomIn);
    window.addEventListener('zoomOut', handleZoomOut);

    return () => {
      window.removeEventListener('autoLayout', handleAutoLayout);
      window.removeEventListener('zoomIn', handleZoomIn);
      window.removeEventListener('zoomOut', handleZoomOut);
    };
  }, [nodes, setNodes, fitView, zoomIn, zoomOut]);

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'condition': return '#10b981';
              case 'step': return '#3b82f6';
              case 'loop': return '#f59e0b';
              default: return '#6b7280';
            }
          }}
          nodeStrokeWidth={3}
          pannable
          zoomable
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      
      {!flowData && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>Akışınızı Tasarlamaya Başlayın</h2>
            <p>XML dosyanızı yükleyerek veya yeni bir akış oluşturarak başlayabilirsiniz</p>
            <div className="empty-state-actions">
              <button 
                className="btn primary"
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                XML Dosyası Yükle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas; 