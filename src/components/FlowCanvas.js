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
      console.log('Otomatik Düzen - Dikey Sıralama');
      setNodes((currentNodes) => {
        // Basit dikey sıralama - alt alta düz
        const layoutedNodes = currentNodes.map((node, index) => {
          return {
            ...node,
            position: {
              x: 200, // Tüm node'lar aynı x pozisyonunda (dikey çizgi)
              y: 60 + (index * 120), // Her node 120px aşağıda
            },
          };
        });
        
        // Layout sonrası fitView
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({ padding: 0.1, maxZoom: 1.2 });
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

    const handleSmartFormat = () => {
      console.log('Akıllı formatla tetiklendi');
      setNodes((currentNodes) => {
        // Bağlantı tabanlı hiyerarşik düzen - JSON ağacı gibi
        const nodeMap = new Map(currentNodes.map(node => [node.id, node]));
        const connections = edges.reduce((acc, edge) => {
          if (!acc[edge.source]) acc[edge.source] = [];
          acc[edge.source].push(edge.target);
          return acc;
        }, {});

        // Root node'ları bul (giriş bağlantısı olmayan)
        const hasIncoming = new Set(edges.map(edge => edge.target));
        const rootNodes = currentNodes.filter(node => !hasIncoming.has(node.id));
        
        const positioned = new Set();
        const layoutedNodes = [...currentNodes];
        
        // Hiyerarşik seviye tabanlı düzen (JSON tree benzeri)
        const processLevel = (nodeIds, level, startY = 50) => {
          if (nodeIds.length === 0) return startY;
          
          let currentY = startY;
          const levelHeight = 200; // Seviyeler arası yükseklik
          
          nodeIds.forEach((nodeId, index) => {
            if (positioned.has(nodeId)) return;
            
            const node = nodeMap.get(nodeId);
            if (node) {
              const nodeIndex = layoutedNodes.findIndex(n => n.id === nodeId);
              if (nodeIndex !== -1) {
                layoutedNodes[nodeIndex] = {
                  ...layoutedNodes[nodeIndex],
                  position: {
                    x: 50 + (level * 400), // Seviye derinliği 400px aralıklarla
                    y: currentY
                  }
                };
                positioned.add(nodeId);
                
                // Alt seviyeyi işle
                const children = connections[nodeId] || [];
                if (children.length > 0) {
                  currentY = processLevel(children, level + 1, currentY + 80);
                } else {
                  currentY += levelHeight;
                }
              }
            }
          });
          
          return currentY;
        };

        // Root node'lardan başla
        if (rootNodes.length > 0) {
          processLevel(rootNodes.map(n => n.id), 0, 50);
        } else {
          // Eğer root yoksa, JSON object benzeri grid düzeni
          layoutedNodes.forEach((node, index) => {
            const itemsPerColumn = 5; // Her sütunda 5 item
            const col = Math.floor(index / itemsPerColumn);
            const row = index % itemsPerColumn;
            
            layoutedNodes[index] = {
              ...node,
              position: {
                x: 50 + (col * 350), // Sütunlar 350px aralıklarla
                y: 50 + (row * 180), // Satırlar 180px aralıklarla
              }
            };
          });
        }
        
        // Konumlandırılmamış node'ları alt kısma yerleştir
        const unpositioned = currentNodes.filter(node => !positioned.has(node.id));
        unpositioned.forEach((node, index) => {
          const nodeIndex = layoutedNodes.findIndex(n => n.id === node.id);
          if (nodeIndex !== -1) {
            layoutedNodes[nodeIndex] = {
              ...layoutedNodes[nodeIndex],
              position: {
                x: 50 + (index % 4) * 300,
                y: 800 + Math.floor(index / 4) * 180
              }
            };
          }
        });
        
        // Layout sonrası fitView
        setTimeout(() => {
          try {
            reactFlowInstance.fitView({ padding: 0.1, maxZoom: 1.2 });
          } catch (error) {
            console.warn('Smart format fitView hatası:', error);
          }
        }, 150);
        
        return layoutedNodes;
      });
    };

    // Event listener'ları ekle
    window.addEventListener('autoLayout', handleAutoLayout);
    window.addEventListener('smartFormat', handleSmartFormat);
    window.addEventListener('zoomIn', handleZoomIn);
    window.addEventListener('zoomOut', handleZoomOut);

    // Cleanup
    return () => {
      window.removeEventListener('autoLayout', handleAutoLayout);
      window.removeEventListener('smartFormat', handleSmartFormat);
      window.removeEventListener('zoomIn', handleZoomIn);
      window.removeEventListener('zoomOut', handleZoomOut);
    };
  }, [setNodes, reactFlowInstance]);



  // Node tıklama olayı - zoom'u ve default davranışları engelle
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    event.preventDefault();
    console.log('Node seçildi:', node);
    setSelectedElement(node);
  }, [setSelectedElement]);

  // Pane tıklama olayı - node dışı alanlar için
  const onPaneClick = useCallback(() => {
    setSelectedElement(null);
  }, [setSelectedElement]);

  // Bağlantı oluşturma
  const onConnect = useCallback(
    (params) => {
      const newEdge = addEdge({
        ...params,
        type: 'straight', // Düz çizgi
        style: { stroke: '#667eea', strokeWidth: 2 }
      }, edges);
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
        onPaneClick={onPaneClick}
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
        selectNodesOnDrag={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        connectionMode="loose"
        snapToGrid={false}
        snapGrid={[15, 15]}
        connectionLineType="straight"
        connectionLineStyle={{ stroke: '#667eea', strokeWidth: 2 }}
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