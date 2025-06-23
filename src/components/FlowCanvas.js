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
  const { flowData, selectedElement, setSelectedElement, setFlowData } = useFlow();
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

  // Toolbar event listener'ları
  useEffect(() => {
    const handleAutoLayout = () => {
      console.log('Auto layout tetiklendi');
      setNodes((currentNodes) => {
        const layoutedNodes = currentNodes.map((node, index) => ({
          ...node,
          position: {
            x: (index % 3) * 300 + 100,
            y: Math.floor(index / 3) * 150 + 100,
          },
        }));
        
        // Layout sonrası fitView
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({ padding: 0.1 });
          } catch (error) {
            console.warn('Auto layout fitView hatası:', error);
          }
        }, 100);
        
        return layoutedNodes;
      });
    };

    const handleZoomIn = () => {
      console.log('Zoom in tetiklendi');
      try {
        reactFlowInstance.zoomIn();
      } catch (error) {
        console.warn('Zoom in hatası:', error);
      }
    };

    const handleZoomOut = () => {
      console.log('Zoom out tetiklendi');
      try {
        reactFlowInstance.zoomOut();
      } catch (error) {
        console.warn('Zoom out hatası:', error);
      }
    };

    // Event listener'ları ekle
    window.addEventListener('autoLayout', handleAutoLayout);
    window.addEventListener('zoomIn', handleZoomIn);
    window.addEventListener('zoomOut', handleZoomOut);

    // Cleanup
    return () => {
      window.removeEventListener('autoLayout', handleAutoLayout);
      window.removeEventListener('zoomIn', handleZoomIn);
      window.removeEventListener('zoomOut', handleZoomOut);
    };
  }, [setNodes, reactFlowInstance]);

  // Bağlantı oluşturma
  const onConnect = useCallback(
    (params) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
      
      // FlowData'yı güncelle
      if (flowData) {
        setFlowData(prevData => ({
          ...prevData,
          edges: newEdge
        }));
      }
    },
    [setEdges, edges, flowData, setFlowData]
  );

  // Bağlantı silme
  const onEdgesDelete = useCallback(
    (edgesToDelete) => {
      const updatedEdges = edges.filter(edge => 
        !edgesToDelete.some(deletedEdge => deletedEdge.id === edge.id)
      );
      setEdges(updatedEdges);
      
      // FlowData'yı güncelle
      if (flowData) {
        setFlowData(prevData => ({
          ...prevData,
          edges: updatedEdges
        }));
      }
    },
    [edges, setEdges, flowData, setFlowData]
  );

  // Node seçimi
  const onNodeClick = useCallback((event, node) => {
    console.log('Node seçildi:', node);
    setSelectedElement(node);
  }, [setSelectedElement]);

  // Node hareket ettirme
  const onNodeDragStop = useCallback((event, node) => {
    if (flowData) {
      setFlowData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(n => 
          n.id === node.id ? { ...n, position: node.position } : n
        )
      }));
    }
  }, [flowData, setFlowData]);

  // Node silme
  const onNodesDelete = useCallback((nodesToDelete) => {
    if (flowData) {
      const nodeIdsToDelete = nodesToDelete.map(node => node.id);
      
      // Node'ları ve bağlı edge'leri sil
      const updatedNodes = flowData.nodes.filter(node => 
        !nodeIdsToDelete.includes(node.id)
      );
      const updatedEdges = flowData.edges.filter(edge => 
        !nodeIdsToDelete.includes(edge.source) && !nodeIdsToDelete.includes(edge.target)
      );
      
      setFlowData(prevData => ({
        ...prevData,
        nodes: updatedNodes,
        edges: updatedEdges
      }));
      
      // Silinen node seçiliyse seçimi kaldır
      if (selectedElement && nodeIdsToDelete.includes(selectedElement.id)) {
        setSelectedElement(null);
      }
    }
  }, [flowData, setFlowData, selectedElement, setSelectedElement]);

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
        onEdgesDelete={onEdgesDelete}
        onNodesDelete={onNodesDelete}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        connectionMode="loose"
        snapToGrid={false}
        snapGrid={[15, 15]}
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#667eea', strokeWidth: 3 }}
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