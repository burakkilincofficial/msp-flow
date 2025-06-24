import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import ConnectionGuide from './components/ConnectionGuide';
import FlowRuleImporter from './components/FlowRuleImporter';
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
  const [appReady, setAppReady] = useState(false);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' veya 'importer'

  // App başlatma
  useEffect(() => {
    console.log('MSP Flow Designer başlatılıyor...');
    console.log('React version:', React.version);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Kısa bir delay ile app'i ready yap
    const timer = setTimeout(() => {
      setAppReady(true);
      console.log('App hazır!');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true);
    try {
      console.log('XML dosyası yükleniyor:', file.name);
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
      console.log('XML export başlatılıyor...');
      const processor = new XmlProcessor();
      let xmlContent = processor.generateXml(flowData);
      
      // XML'i formatla
      xmlContent = processor.formatXml(xmlContent);
      
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deactivation_flow_formatted.xml';
      a.click();
      
      URL.revokeObjectURL(url);
      console.log('XML export tamamlandı (formatlanmış)');
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

  // App henüz ready değilse basit loading göster
  if (!appReady) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3>MSP Flow Designer</h3>
          <p>Yükleniyor...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <FlowProvider value={contextValue}>
        <div className="app">
          <Header />
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'canvas' ? 'active' : ''}`}
              onClick={() => setActiveTab('canvas')}
            >
              📊 Flow Canvas
            </button>
            <button 
              className={`tab-button ${activeTab === 'importer' ? 'active' : ''}`}
              onClick={() => setActiveTab('importer')}
            >
              📥 Flow Rule İçe Aktarma
            </button>
          </div>

          {activeTab === 'canvas' ? (
            <>
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
              
              <ConnectionGuide />
            </>
          ) : (
            <div className="importer-content">
              <FlowRuleImporter />
            </div>
          )}
          
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