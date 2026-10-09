
  // 读取文件为文本
const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e.target.error);
      reader.readAsText(file);
    });
  };
  
  // 核心解析逻辑
  const parseWTGXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // 解析根节点
    const root = xmlDoc.documentElement;
    
    // 主结构解析
    const result = {
      formatVersion: root.getAttribute('FormatVersion'),
      description: root.getAttribute('Description'),
      rotorDiameter: parseFloat(root.getAttribute('RotorDiameter')),
      suggestedHeights: parseSuggestedHeights(root),
      performance: parsePerformanceTable(root)
    };    
    return result;
  };
  
  // 解析建议高度
  const parseSuggestedHeights = (root) => {
    const heights = Array.from(root.querySelector('SuggestedHeights').children);
    return heights.map(el => parseFloat(el.textContent));
  };
  
  // 解析性能表
  const parsePerformanceTable = (root) => {
    const perfTable = root.querySelector('PerformanceTable');
    const dataTable = perfTable.querySelector('DataTable');
  
    return {
      airDensity: parseFloat(perfTable.getAttribute('AirDensity')),
      maximumNoiseLevel: parseFloat(perfTable.getAttribute('MaximumNoiseLevel')),
      startStopStrategy: parseStartStopStrategy(perfTable),
      dataTable: parseDataPoints(dataTable)
    };
  };
  
  // 解析启停策略
  const parseStartStopStrategy = (perfTable) => {
    const strategy = perfTable.querySelector('StartStopStrategy');
    return {
      lowSpeedCutOut: parseFloat(strategy.getAttribute('LowSpeedCutOut')),
      lowSpeedCutIn: parseFloat(strategy.getAttribute('LowSpeedCutIn')),
      highSpeedCutIn: parseFloat(strategy.getAttribute('HighSpeedCutIn')),
      highSpeedCutOut: parseFloat(strategy.getAttribute('HighSpeedCutOut'))
    };
  };
  
  // 解析数据点
  const parseDataPoints = (dataTable) => {
    return Array.from(dataTable.children).map(point => ({
      windSpeed: parseFloat(point.getAttribute('WindSpeed')),
      powerOutput: parseFloat(point.getAttribute('PowerOutput')),
      thrustCoEfficient: parseFloat(point.getAttribute('ThrustCoEfficient'))
    }));
  };
  export{
    readFileAsText,
    parseWTGXML
  }