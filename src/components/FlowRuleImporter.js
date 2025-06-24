import React, { useState } from 'react';
import FlowRuleProcessor from '../utils/flowRuleProcessor';
import { useFlow } from '../context/FlowContext';
import '../styles/FlowRuleImporter.css';

const FlowRuleImporter = () => {
  const [rawData, setRawData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [error, setError] = useState(null);
  const { setFlowData } = useFlow();

  // Örnek flow rule verileri
  const sampleData = `[
  {
    "NORDER_TYPE_ID": 101,
    "VPROCESS_DESC": "Talep Girişi",
    "NPROCESS_ID": 1,
    "NCUSTOMER_TYPE_REF": 2,
    "NCURRENT_FLOW_STATUS_REF": 1,
    "NSUCCESS_FLOW_STATUS_REF": 1,
    "NSUCCESS_PROCESS_ID": 313,
    "NFAILED_FLOW_STATUS_REF": 1,
    "NFAILED_PROCESS_ID": 1,
    "NCHANNEL_REF": 2,
    "NAPPLICATION_REF": 8,
    "NAPPLICATION_MODULE_REF": 11
  },
  {
    "NORDER_TYPE_ID": 101,
    "VPROCESS_DESC": "Abone İsteği Hat Açma Validasyon Adımı",
    "NPROCESS_ID": 313,
    "NCUSTOMER_TYPE_REF": 2,
    "NCURRENT_FLOW_STATUS_REF": 4,
    "NSUCCESS_FLOW_STATUS_REF": 5,
    "NSUCCESS_PROCESS_ID": 314,
    "NFAILED_FLOW_STATUS_REF": 4,
    "NFAILED_PROCESS_ID": 313,
    "NCHANNEL_REF": 2,
    "NAPPLICATION_REF": 8,
    "NAPPLICATION_MODULE_REF": 11
  },
  {
    "NORDER_TYPE_ID": 101,
    "VPROCESS_DESC": "Abone isteği Hat Açma İşlem Adımı",
    "NPROCESS_ID": 314,
    "NCUSTOMER_TYPE_REF": 2,
    "NCURRENT_FLOW_STATUS_REF": 5,
    "NSUCCESS_FLOW_STATUS_REF": 5,
    "NSUCCESS_PROCESS_ID": 1920,
    "NFAILED_FLOW_STATUS_REF": 5,
    "NFAILED_PROCESS_ID": 314,
    "NCHANNEL_REF": 9,
    "NAPPLICATION_REF": 14,
    "NAPPLICATION_MODULE_REF": 31
  },
  {
    "NORDER_TYPE_ID": 101,
    "VPROCESS_DESC": "Abone Isteği Acma Comet Bilgilendirme",
    "NPROCESS_ID": 1920,
    "NCUSTOMER_TYPE_REF": 2,
    "NCURRENT_FLOW_STATUS_REF": 5,
    "NSUCCESS_FLOW_STATUS_REF": 6,
    "NSUCCESS_PROCESS_ID": 1920,
    "NFAILED_FLOW_STATUS_REF": 5,
    "NFAILED_PROCESS_ID": 1920,
    "NCHANNEL_REF": 2,
    "NAPPLICATION_REF": 8,
    "NAPPLICATION_MODULE_REF": 11
  }
]`;

  const handleSampleData = () => {
    setRawData(sampleData);
  };

  const processFlowRules = async () => {
    if (!rawData.trim()) {
      setError('Lütfen flow rule verilerini girin');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingResult(null);

    try {
      // JSON formatında veriyi parse et
      let flowRuleData;
      try {
        flowRuleData = JSON.parse(rawData);
      } catch (parseError) {
        throw new Error('Geçersiz JSON formatı: ' + parseError.message);
      }

      if (!Array.isArray(flowRuleData)) {
        throw new Error('Veri bir dizi (array) olmalıdır');
      }

      const processor = new FlowRuleProcessor();
      
      // XML formatına dönüştür
      const xmlOutput = processor.convertToXml(flowRuleData, {
        orderTypeId: 101,
        productTypeId: 1,
        customerTypeRef: 2,
        processName: 'DeactivationFlow'
      });

      // React Flow formatına dönüştür  
      const reactFlowData = processor.convertToReactFlow(flowRuleData, {
        orderTypeId: 101,
        productTypeId: 1,
        customerTypeRef: 2,
        processName: 'DeactivationFlow'
      });

      // İstatistikleri hesapla
      const stats = {
        totalRules: flowRuleData.length,
        uniqueProcesses: new Set(flowRuleData.map(r => r.NPROCESS_ID)).size,
        uniqueChannels: new Set(flowRuleData.map(r => r.NCHANNEL_REF)).size,
        uniqueApplications: new Set(flowRuleData.map(r => r.NAPPLICATION_REF)).size,
        uniqueModules: new Set(flowRuleData.map(r => r.NAPPLICATION_MODULE_REF)).size
      };

      setProcessingResult({
        xml: xmlOutput,
        reactFlow: reactFlowData,
        stats,
        rawData: flowRuleData
      });

      // Flow Canvas'a gönder
      setFlowData(reactFlowData);

    } catch (err) {
      setError('İşlem hatası: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadXml = () => {
    if (!processingResult?.xml) return;
    
    const blob = new Blob([processingResult.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deactivation-flow.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyXmlToClipboard = async () => {
    if (!processingResult?.xml) return;
    
    try {
      await navigator.clipboard.writeText(processingResult.xml);
      alert('XML panoya kopyalandı!');
    } catch (err) {
      console.error('Panoya kopyalama hatası:', err);
    }
  };

  return (
    <div className="flow-rule-importer">
      <div className="importer-header">
        <h2>Flow Rule İçe Aktarma</h2>
        <p>Veritabanından aldığınız flow rule verilerini JSON formatında girin</p>
      </div>

      <div className="importer-content">
        <div className="input-section">
          <div className="input-header">
            <label htmlFor="rawData">Flow Rule Verileri (JSON)</label>
            <button 
              type="button" 
              onClick={handleSampleData}
              className="sample-button"
            >
              Örnek Veri Yükle
            </button>
          </div>
          
          <textarea
            id="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder={`Örnek format:
[
  {
    "NORDER_TYPE_ID": 101,
    "VPROCESS_DESC": "Talep Girişi",
    "NPROCESS_ID": 1,
    "NCUSTOMER_TYPE_REF": 2,
    ...
  }
]`}
            rows={12}
            className="data-input"
          />

          <div className="action-buttons">
            <button 
              onClick={processFlowRules}
              disabled={isProcessing || !rawData.trim()}
              className="process-button"
            >
              {isProcessing ? 'İşleniyor...' : 'Flow\'a Dönüştür'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <strong>Hata:</strong> {error}
            </div>
          )}
        </div>

        {processingResult && (
          <div className="results-section">
            <div className="stats-panel">
              <h3>İstatistikler</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Toplam Kural:</span>
                  <span className="stat-value">{processingResult.stats.totalRules}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Benzersiz Process:</span>
                  <span className="stat-value">{processingResult.stats.uniqueProcesses}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Benzersiz Kanal:</span>
                  <span className="stat-value">{processingResult.stats.uniqueChannels}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Benzersiz Uygulama:</span>
                  <span className="stat-value">{processingResult.stats.uniqueApplications}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Benzersiz Modül:</span>
                  <span className="stat-value">{processingResult.stats.uniqueModules}</span>
                </div>
              </div>
            </div>

            <div className="xml-output">
              <div className="output-header">
                <h3>Oluşturulan XML</h3>
                <div className="output-actions">
                  <button onClick={copyXmlToClipboard} className="copy-button">
                    📋 Kopyala
                  </button>
                  <button onClick={downloadXml} className="download-button">
                    💾 İndir
                  </button>
                </div>
              </div>
              
              <pre className="xml-preview">
                <code>{processingResult.xml}</code>
              </pre>
            </div>

            <div className="flow-info">
              <h3>Flow Bilgileri</h3>
              <div className="flow-stats">
                <p><strong>Node Sayısı:</strong> {processingResult.reactFlow.nodes.length}</p>
                <p><strong>Bağlantı Sayısı:</strong> {processingResult.reactFlow.edges.length}</p>
                <p><strong>Process Adı:</strong> {processingResult.reactFlow.metadata.processName}</p>
                <p><strong>Order Type ID:</strong> {processingResult.reactFlow.metadata.orderTypeId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowRuleImporter; 