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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>Bir hata oluştu!</h1>
          <p>Uygulama yüklenirken bir sorun yaşandı.</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary>Hata Detayları</summary>
            <pre style={{ background: '#f1f1f1', padding: '10px', borderRadius: '4px' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [flowData, setFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [xmlContent, setXmlContent] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('MSP Flow Designer başlatılıyor...');
    console.log('React version:', React.version);
    console.log('Environment:', process.env.NODE_ENV);
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const processor = new XmlProcessor();
      const parsedData = await processor.parseXml(text);
      
      setFlowData(parsedData);
      setXmlContent(text);
      console.log('XML başarıyla yüklendi:', parsedData);
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App; 