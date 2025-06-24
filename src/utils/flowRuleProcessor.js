export class FlowRuleProcessor {
  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  /**
   * Flow rule verilerini XML formatına dönüştürür
   * @param {Array} flowRuleData - Veritabanından gelen flow rule verileri
   * @param {Object} options - Dönüştürme seçenekleri
   * @returns {string} XML string
   */
  convertToXml(flowRuleData, options = {}) {
    const {
      orderTypeId = 101,
      productTypeId = 1,
      customerTypeRef = 2,
      processName = 'DeactivationFlow'
    } = options;

    // Benzersiz process'leri ve bağlantıları çıkar
    const processMap = this.buildProcessMap(flowRuleData);
    const flowConnections = this.buildFlowConnections(flowRuleData);

    return this.generateFlowXml(processMap, flowConnections, {
      orderTypeId,
      productTypeId,
      customerTypeRef,
      processName
    });
  }

  /**
   * Flow rule verilerinden process haritası oluşturur
   */
  buildProcessMap(flowRuleData) {
    const processMap = new Map();
    
    flowRuleData.forEach(rule => {
      const processId = rule.NPROCESS_ID;
      
      if (!processMap.has(processId)) {
        processMap.set(processId, {
          id: processId,
          description: rule.VPROCESS_DESC,
          channels: new Set(),
          applications: new Set(),
          applicationModules: new Set(),
          flowStatuses: {
            current: new Set(),
            success: new Set(),
            failed: new Set()
          },
          successProcesses: new Set(),
          failedProcesses: new Set(),
          rules: []
        });
      }

      const process = processMap.get(processId);
      
      // Kanal, uygulama ve modül bilgilerini topla
      process.channels.add(rule.NCHANNEL_REF);
      process.applications.add(rule.NAPPLICATION_REF);
      process.applicationModules.add(rule.NAPPLICATION_MODULE_REF);
      
      // Flow status bilgilerini topla
      process.flowStatuses.current.add(rule.NCURRENT_FLOW_STATUS_REF);
      process.flowStatuses.success.add(rule.NSUCCESS_FLOW_STATUS_REF);
      process.flowStatuses.failed.add(rule.NFAILED_FLOW_STATUS_REF);
      
      // Başarılı ve başarısız process'leri ekle
      if (rule.NSUCCESS_PROCESS_ID) {
        process.successProcesses.add(rule.NSUCCESS_PROCESS_ID);
      }
      if (rule.NFAILED_PROCESS_ID) {
        process.failedProcesses.add(rule.NFAILED_PROCESS_ID);
      }
      
      // Orijinal rule'u sakla
      process.rules.push(rule);
    });

    return processMap;
  }

  /**
   * Process'ler arası bağlantıları oluşturur
   */
  buildFlowConnections(flowRuleData) {
    const connections = [];
    const processConnections = new Map();

    flowRuleData.forEach(rule => {
      const sourceId = rule.NPROCESS_ID;
      const successTargetId = rule.NSUCCESS_PROCESS_ID;
      const failedTargetId = rule.NFAILED_PROCESS_ID;

      // Başarılı bağlantılar
      if (successTargetId && successTargetId !== sourceId) {
        const key = `${sourceId}-${successTargetId}-success`;
        if (!processConnections.has(key)) {
          processConnections.set(key, {
            source: sourceId,
            target: successTargetId,
            type: 'success',
            condition: this.buildCondition(rule, 'success'),
            channels: new Set([rule.NCHANNEL_REF]),
            applications: new Set([rule.NAPPLICATION_REF]),
            applicationModules: new Set([rule.NAPPLICATION_MODULE_REF])
          });
        } else {
          const conn = processConnections.get(key);
          conn.channels.add(rule.NCHANNEL_REF);
          conn.applications.add(rule.NAPPLICATION_REF);
          conn.applicationModules.add(rule.NAPPLICATION_MODULE_REF);
        }
      }

      // Başarısız bağlantılar
      if (failedTargetId && failedTargetId !== sourceId) {
        const key = `${sourceId}-${failedTargetId}-failed`;
        if (!processConnections.has(key)) {
          processConnections.set(key, {
            source: sourceId,
            target: failedTargetId,
            type: 'failed',
            condition: this.buildCondition(rule, 'failed'),
            channels: new Set([rule.NCHANNEL_REF]),
            applications: new Set([rule.NAPPLICATION_REF]),
            applicationModules: new Set([rule.NAPPLICATION_MODULE_REF])
          });
        } else {
          const conn = processConnections.get(key);
          conn.channels.add(rule.NCHANNEL_REF);
          conn.applications.add(rule.NAPPLICATION_REF);
          conn.applicationModules.add(rule.NAPPLICATION_MODULE_REF);
        }
      }
    });

    return Array.from(processConnections.values());
  }

  /**
   * Bağlantı koşullarını oluşturur
   */
  buildCondition(rule, type) {
    const conditions = [];
    
    // Kanal koşulu
    if (rule.NCHANNEL_REF) {
      conditions.push(`channelRef == ${rule.NCHANNEL_REF}`);
    }
    
    // Uygulama koşulu
    if (rule.NAPPLICATION_REF) {
      conditions.push(`applicationRef == ${rule.NAPPLICATION_REF}`);
    }
    
    // Uygulama modülü koşulu
    if (rule.NAPPLICATION_MODULE_REF) {
      conditions.push(`applicationModuleRef == ${rule.NAPPLICATION_MODULE_REF}`);
    }
    
    // Flow status koşulu
    if (type === 'success') {
      conditions.push(`flowStatus == ${rule.NSUCCESS_FLOW_STATUS_REF}`);
    } else if (type === 'failed') {
      conditions.push(`flowStatus == ${rule.NFAILED_FLOW_STATUS_REF}`);
    }

    return conditions.length > 0 ? conditions.join(' && ') : 'true';
  }

  /**
   * XML formatında flow definition oluşturur
   */
  generateFlowXml(processMap, connections, metadata) {
    const xml = [];
    
    xml.push('<?xml version="1.0" encoding="UTF-8"?>');
    xml.push(`<process name="${metadata.processName}" version="1.0" orderTypeId="${metadata.orderTypeId}">`);
    xml.push('  <logic>');

    // Başlangıç process'ini bul (genellikle ID 1)
    const startProcess = processMap.get(1);
    if (startProcess) {
      this.generateProcessXml(xml, startProcess, processMap, connections, '    ', new Set());
    }

    xml.push('  </logic>');
    xml.push('</process>');

    return xml.join('\n');
  }

  /**
   * Tek bir process için XML oluşturur
   */
  generateProcessXml(xml, process, processMap, connections, indent, visited) {
    if (visited.has(process.id)) {
      return; // Döngüyü önle
    }
    visited.add(process.id);

    // Process tipi belirle
    const processType = this.getProcessType(process);
    
    if (processType === 'invoke') {
      xml.push(`${indent}<invoke`);
      xml.push(`${indent}  stepId="${process.id}"`);
      xml.push(`${indent}  stepDescription="${this.escapeXml(process.description)}"`);
      xml.push(`${indent}  flowStatus="${Array.from(process.flowStatuses.current).join(',')}"`);
      xml.push(`${indent}  successFlowStatus="${Array.from(process.flowStatuses.success).join(',')}"`);
      xml.push(`${indent}  failFlowStatus="${Array.from(process.flowStatuses.failed).join(',')}"`);
      xml.push(`${indent}  interaction="true">`);

      // Kanallar için koşullar
      const channelsArray = Array.from(process.channels);
      if (channelsArray.length > 1) {
        channelsArray.forEach(channel => {
          xml.push(`${indent}  <if condition="channelRef == ${channel}">`);
          this.generateSuccessFailureHandling(xml, process, processMap, connections, indent + '    ', visited);
          xml.push(`${indent}  </if>`);
        });
      } else {
        this.generateSuccessFailureHandling(xml, process, processMap, connections, indent + '  ', visited);
      }

      xml.push(`${indent}</invoke>`);
    } else if (processType === 'condition') {
      // Koşullu process'ler için if yapısı
      const condition = this.buildProcessCondition(process);
      xml.push(`${indent}<if condition="${condition}">`);
      this.generateSuccessFailureHandling(xml, process, processMap, connections, indent + '  ', visited);
      xml.push(`${indent}</if>`);
    }
  }

  /**
   * Başarı ve başarısızlık durumlarını yönetir
   */
  generateSuccessFailureHandling(xml, process, processMap, connections, indent, visited) {
    // Başarılı process'leri bul
    const successConnections = connections.filter(conn => 
      conn.source === process.id && conn.type === 'success'
    );

    // Başarısızlık process'lerini bul
    const failedConnections = connections.filter(conn => 
      conn.source === process.id && conn.type === 'failed'
    );

    // Başarılı durumlar
    successConnections.forEach(conn => {
      const targetProcess = processMap.get(conn.target);
      if (targetProcess && !visited.has(targetProcess.id)) {
        xml.push(`${indent}<!-- Success path to: ${targetProcess.description} -->`);
        this.generateProcessXml(xml, targetProcess, processMap, connections, indent, new Set(visited));
      }
    });

    // Başarısızlık durumları
    if (failedConnections.length > 0) {
      xml.push(`${indent}<exception idCondition="FLOW_EXCEPTION">`);
      failedConnections.forEach(conn => {
        const targetProcess = processMap.get(conn.target);
        if (targetProcess && !visited.has(targetProcess.id)) {
          xml.push(`${indent}  <!-- Failure path to: ${targetProcess.description} -->`);
          this.generateProcessXml(xml, targetProcess, processMap, connections, indent + '  ', new Set(visited));
        }
      });
      xml.push(`${indent}</exception>`);
    }
  }

  /**
   * Process tipini belirler
   */
  getProcessType(process) {
    const description = process.description.toLowerCase();
    
    if (description.includes('onay') || description.includes('approval') || 
        description.includes('validation') || description.includes('validasyon')) {
      return 'condition';
    }
    
    return 'invoke';
  }

  /**
   * Process için koşul oluşturur
   */
  buildProcessCondition(process) {
    const conditions = [];
    
    // Kanal koşulları
    const channels = Array.from(process.channels);
    if (channels.length === 1) {
      conditions.push(`channelRef == ${channels[0]}`);
    } else if (channels.length > 1) {
      conditions.push(`channelRef in (${channels.join(',')})`);
    }
    
    return conditions.length > 0 ? conditions.join(' && ') : 'true';
  }

  /**
   * XML karakterlerini escape eder
   */
  escapeXml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Flow rule verilerini React Flow formatına dönüştürür
   */
  convertToReactFlow(flowRuleData, options = {}) {
    const processMap = this.buildProcessMap(flowRuleData);
    const connections = this.buildFlowConnections(flowRuleData);
    
    const nodes = [];
    const edges = [];
    
    let x = 100;
    let y = 100;
    
    // Process'leri node'lara dönüştür
    processMap.forEach((process, processId) => {
      const nodeType = this.getProcessType(process) === 'condition' ? 'condition' : 'step';
      
      nodes.push({
        id: `process-${processId}`,
        type: nodeType,
        position: { x, y },
        data: {
          label: process.description,
          elementType: nodeType === 'condition' ? 'if' : 'invoke',
          stepId: processId.toString(),
          stepDescription: process.description,
          flowStatus: Array.from(process.flowStatuses.current).join(','),
          successFlowStatus: Array.from(process.flowStatuses.success).join(','),
          failFlowStatus: Array.from(process.flowStatuses.failed).join(','),
          channels: Array.from(process.channels),
          applications: Array.from(process.applications),
          applicationModules: Array.from(process.applicationModules),
          attributes: {
            processId,
            channels: Array.from(process.channels).join(','),
            applications: Array.from(process.applications).join(','),
            applicationModules: Array.from(process.applicationModules).join(',')
          }
        }
      });
      
      // Konumları güncelle (grid layout)
      x += 300;
      if (x > 900) {
        x = 100;
        y += 200;
      }
    });
    
    // Bağlantıları edge'lere dönüştür
    connections.forEach((conn, index) => {
      edges.push({
        id: `edge-${conn.source}-${conn.target}-${index}`,
        source: `process-${conn.source}`,
        target: `process-${conn.target}`,
        type: 'smoothstep',
        label: conn.type === 'success' ? 'Başarılı' : 'Başarısız',
        style: {
          stroke: conn.type === 'success' ? '#22c55e' : '#ef4444',
          strokeWidth: 2
        },
        data: {
          condition: conn.condition,
          channels: Array.from(conn.channels),
          applications: Array.from(conn.applications),
          applicationModules: Array.from(conn.applicationModules)
        }
      });
    });
    
    return {
      nodes,
      edges,
      metadata: {
        processName: options.processName || 'DeactivationFlow',
        orderTypeId: options.orderTypeId || 101,
        productTypeId: options.productTypeId || 1,
        customerTypeRef: options.customerTypeRef || 2
      }
    };
  }
}

export default FlowRuleProcessor; 