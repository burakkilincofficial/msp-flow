import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import { XmlProcessor } from './utils/xmlProcessor';
import { FlowProvider } from './context/FlowContext';
import 'reactflow/dist/style.css';
import './styles/App.css';

function App() {
  const [flowData, setFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [xmlContent, setXmlContent] = useState('');

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const processor = new XmlProcessor();
      const parsedData = await processor.parseXml(text);
      
      setFlowData(parsedData);
      setXmlContent(text);
    } catch (error) {
      console.error('XML parsing error:', error);
      alert('XML dosyası işlenirken hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportXml = useCallback(() => {
    if (!flowData) {
      alert('Dışa aktarılacak flow verisi bulunamadı!');
      return;
    }

    try {
      const processor = new XmlProcessor();
      const xmlContent = processor.generateXml(flowData);
      
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deactivation_flow.xml';
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('XML export error:', error);
      alert('XML dışa aktarma sırasında hata oluştu: ' + error.message);
    }
  }, [flowData]);

  const contextValue = {
    flowData,
    setFlowData,
    selectedElement,
    setSelectedElement,
    xmlContent,
    setXmlContent,
    isLoading,
    setIsLoading
  };

  return (
    <FlowProvider value={contextValue}>
      <div className="app">
        <Header />
        <Toolbar 
          onFileUpload={handleFileUpload}
          onExportXml={handleExportXml}
          isLoading={isLoading}
        />
        
        <div className="app-content">
          <Sidebar />
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>XML işleniyor...</p>
            </div>
          </div>
        )}
      </div>
    </FlowProvider>
  );
}

export default App; 