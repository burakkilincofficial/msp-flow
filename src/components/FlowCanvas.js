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
  const reactFlowInstance = useReactFlow();

  // FlowData değiştiğinde nodes ve edges'i güncelle
  useEffect(() => {
    if (flowData && flowData.nodes && flowData.edges) {
      console.log('FlowData güncelleniyor:', flowData);
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
      
      // FitView'i güvenli bir şekilde çağır
      setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.1 });
        } catch (error) {
          console.warn('FitView hatası:', error);
        }
      }, 200);
    }
  }, [flowData, setNodes, setEdges, reactFlowInstance]);

  // Bağlantı oluşturma
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Node seçimi
  const onNodeClick = useCallback((event, node) => {
    console.log('Node seçildi:', node);
    setSelectedElement(node);
  }, [setSelectedElement]);

  // Loading durumu
  if (!flowData) {
    return (
      <div className="flow-canvas">
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>MSP Flow Designer</h2>
            <p>XML dosyanızı yükleyerek başlayın</p>
            <div className="empty-state-actions">
              <button 
                className="btn primary"
                onClick={() => {
                  const input = document.querySelector('input[type="file"]');
                  if (input) input.click();
                }}
              >
                XML Dosyası Yükle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
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
    </div>
  );
};

export default FlowCanvas; 