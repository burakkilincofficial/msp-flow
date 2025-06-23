export class XmlProcessor {
  constructor() {
    this.parser = new DOMParser();
    this.serializer = new XMLSerializer();
  }

  async parseXml(xmlText) {
    try {
      const xmlDoc = this.parser.parseFromString(xmlText, 'text/xml');
      
      // Parse hatalarını kontrol et
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error(`XML parsing failed: ${parseError[0].textContent}`);
      }
      
      return this.processXmlToFlow(xmlDoc);
    } catch (error) {
      throw new Error(`XML processing failed: ${error.message}`);
    }
  }

  processXmlToFlow(xmlDoc) {
    const processElement = xmlDoc.getElementsByTagName('process')[0];
    if (!processElement) {
      throw new Error('Invalid XML structure: missing process element');
    }

    const logicElement = processElement.getElementsByTagName('logic')[0];
    if (!logicElement) {
      throw new Error('Invalid XML structure: missing logic element');
    }

    const nodes = [];
    const edges = [];
    let nodeId = 0;
    let x = 100;
    let y = 100;

    const processXmlElement = (element, parentId = null, level = 0) => {
      const elementId = `node-${nodeId++}`;
      let nodeType = 'default';
      let nodeData = {
        label: 'Unnamed Element',
        elementType: 'unknown',
        attributes: {}
      };

      const tagName = element.tagName.toLowerCase();
      
      // Element tipine göre node ayarları
      switch (tagName) {
        case 'if':
          nodeType = 'condition';
          nodeData = {
            label: 'IF Koşulu',
            elementType: 'if',
            condition: element.getAttribute('condition') || '',
            attributes: this.getElementAttributes(element)
          };
          break;
          
        case 'elseif':
          nodeType = 'condition';
          nodeData = {
            label: 'ELSE IF Koşulu',
            elementType: 'elseif',
            condition: element.getAttribute('condition') || '',
            attributes: this.getElementAttributes(element)
          };
          break;
          
        case 'else':
          nodeType = 'condition';
          nodeData = {
            label: 'ELSE',
            elementType: 'else',
            attributes: this.getElementAttributes(element)
          };
          break;
          
        case 'foreach':
          nodeType = 'loop';
          nodeData = {
            label: 'ForEach Döngüsü',
            elementType: 'foreach',
            attributes: this.getElementAttributes(element)
          };
          break;
          
        case 'invoke':
          nodeType = 'step';
          nodeData = {
            label: element.getAttribute('stepDescription') || 'Adım',
            elementType: 'invoke',
            stepId: element.getAttribute('stepId') || '',
            stepDescription: element.getAttribute('stepDescription') || '',
            flowStatus: element.getAttribute('flowStatus') || '',
            successFlowStatus: element.getAttribute('successFlowStatus') || '',
            failFlowStatus: element.getAttribute('failFlowStatus') || '',
            interaction: element.getAttribute('interaction') || '',
            exceptions: this.parseExceptions(element),
            attributes: this.getElementAttributes(element)
          };
          break;
      }

      // Node'u ekle
      nodes.push({
        id: elementId,
        type: nodeType,
        position: { x: x + (level * 300), y: y },
        data: nodeData
      });

      // Parent ile bağlantı oluştur
      if (parentId) {
        edges.push({
          id: `edge-${parentId}-${elementId}`,
          source: parentId,
          target: elementId,
          type: 'smoothstep'
        });
      }

      y += 100;

      // Child elementleri işle
      const children = Array.from(element.children);
      children.forEach(child => {
        processXmlElement(child, elementId, level + 1);
      });

      return elementId;
    };

    // Logic element içindeki tüm child elementleri işle
    const logicChildren = Array.from(logicElement.children);
    logicChildren.forEach(child => {
      processXmlElement(child, null, 0);
    });

    return {
      nodes,
      edges,
      metadata: {
        processName: processElement.getAttribute('name') || 'Unnamed Process',
        version: processElement.getAttribute('version') || '1.0'
      }
    };
  }

  getElementAttributes(element) {
    const attributes = {};
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  }

  parseExceptions(element) {
    const exceptions = [];
    const exceptionElements = element.getElementsByTagName('exception');
    
    for (let i = 0; i < exceptionElements.length; i++) {
      const exceptionEl = exceptionElements[i];
      exceptions.push({
        idCondition: exceptionEl.getAttribute('idCondition') || '',
        stepId: exceptionEl.getAttribute('stepId') || '',
        flowStatus: exceptionEl.getAttribute('flowStatus') || '',
        description: exceptionEl.textContent || ''
      });
    }
    
    return exceptions;
  }

  generateXml(flowData) {
    try {
      // XML document oluştur
      const xmlDoc = document.implementation.createDocument('', '', null);
      
      // Root process elementi oluştur
      const processElement = xmlDoc.createElement('process');
      processElement.setAttribute('name', flowData.metadata?.processName || 'DeactivationProcess');
      processElement.setAttribute('version', flowData.metadata?.version || '1.0');
      
      // Logic elementi oluştur
      const logicElement = xmlDoc.createElement('logic');
      
      // Nodes'ları XML elementlerine dönüştür
      const rootNodes = flowData.nodes.filter(node => 
        !flowData.edges.some(edge => edge.target === node.id)
      );
      
      rootNodes.forEach(node => {
        const xmlElement = this.nodeToXmlElement(xmlDoc, node, flowData);
        if (xmlElement) {
          logicElement.appendChild(xmlElement);
        }
      });
      
      processElement.appendChild(logicElement);
      xmlDoc.appendChild(processElement);
      
      // XML string'e dönüştür
      let xmlString = this.serializer.serializeToString(xmlDoc);
      
      // XML declaration ekle
      if (!xmlString.startsWith('<?xml')) {
        xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
      }
      
      return xmlString;
    } catch (error) {
      throw new Error(`XML generation failed: ${error.message}`);
    }
  }

  nodeToXmlElement(xmlDoc, node, flowData) {
    const { data } = node;
    let element;
    
    switch (data.elementType) {
      case 'if':
        element = xmlDoc.createElement('if');
        if (data.condition) {
          element.setAttribute('condition', data.condition);
        }
        break;
        
      case 'elseif':
        element = xmlDoc.createElement('elseif');
        if (data.condition) {
          element.setAttribute('condition', data.condition);
        }
        break;
        
      case 'else':
        element = xmlDoc.createElement('else');
        break;
        
      case 'foreach':
        element = xmlDoc.createElement('foreach');
        break;
        
      case 'invoke':
        element = xmlDoc.createElement('invoke');
        if (data.stepId) element.setAttribute('stepId', data.stepId);
        if (data.stepDescription) element.setAttribute('stepDescription', data.stepDescription);
        if (data.flowStatus) element.setAttribute('flowStatus', data.flowStatus);
        if (data.successFlowStatus) element.setAttribute('successFlowStatus', data.successFlowStatus);
        if (data.failFlowStatus) element.setAttribute('failFlowStatus', data.failFlowStatus);
        if (data.interaction) element.setAttribute('interaction', data.interaction);
        
        // Exception'ları ekle
        if (data.exceptions && data.exceptions.length > 0) {
          data.exceptions.forEach(exception => {
            const exceptionEl = xmlDoc.createElement('exception');
            if (exception.idCondition) exceptionEl.setAttribute('idCondition', exception.idCondition);
            if (exception.stepId) exceptionEl.setAttribute('stepId', exception.stepId);
            if (exception.flowStatus) exceptionEl.setAttribute('flowStatus', exception.flowStatus);
            if (exception.description) exceptionEl.textContent = exception.description;
            element.appendChild(exceptionEl);
          });
        }
        break;
        
      default:
        return null;
    }
    
    // Diğer attributeleri ekle
    if (data.attributes) {
      Object.entries(data.attributes).forEach(([key, value]) => {
        if (value && !element.hasAttribute(key)) {
          element.setAttribute(key, value);
        }
      });
    }
    
    // Child elementleri ekle
    const childEdges = flowData.edges.filter(edge => edge.source === node.id);
    childEdges.forEach(edge => {
      const childNode = flowData.nodes.find(n => n.id === edge.target);
      if (childNode) {
        const childElement = this.nodeToXmlElement(xmlDoc, childNode, flowData);
        if (childElement) {
          element.appendChild(childElement);
        }
      }
    });
    
    return element;
  }

  /**
   * XML içeriğini güzel formatlayarak düzenler
   * @param {string} xmlString - Formatlanacak XML string
   * @returns {string} - Formatlanmış XML string
   */
  formatXml(xmlString) {
    try {
      // XML'i parse et
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      
      // Parse error kontrolü
      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        throw new Error('XML parse hatası: ' + parserError[0].textContent);
      }

      // XMLSerializer ile string'e çevir
      const serializer = new XMLSerializer();
      let formattedXml = serializer.serializeToString(xmlDoc);

      // Manuel formatting - indentation ekle
      formattedXml = this.addIndentation(formattedXml);
      
      return formattedXml;
    } catch (error) {
      console.error('XML formatting error:', error);
      // Eğer parse edilemezse, basit string formatting yap
      return this.simpleFormatXml(xmlString);
    }
  }

  /**
   * XML'e indentation ekler
   * @param {string} xml - Formatlanacak XML
   * @returns {string} - Indentationlı XML
   */
  addIndentation(xml) {
    const PADDING = '  '; // 2 space indentation
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\n$2$3');
    
    let pad = 0;
    return formatted.split('\n').map(line => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = PADDING.repeat(pad);
      pad += indent;
      return padding + line;
    }).join('\n');
  }

  /**
   * Basit XML formatting (fallback)
   * @param {string} xml - Formatlanacak XML
   * @returns {string} - Formatlanmış XML
   */
  simpleFormatXml(xml) {
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\n$2$3');
    
    let pad = 0;
    return formatted.split('\n').map(line => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/) && pad > 0) {
        pad -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      
      const padding = '  '.repeat(pad);
      pad += indent;
      return padding + line.trim();
    }).filter(line => line.length > 0).join('\n');
  }
}

export default XmlProcessor; 