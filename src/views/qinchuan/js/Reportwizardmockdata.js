// js/Reportwizardmockdata.js
// 一键生成可研报告 三步表单的配置数据。
// 字段/接口命名尽量保留了老项目里的语义（dataIndex、codeNum 等），
// 方便后续直接对接你现有的参数接口，不用重新设计字段名。

export const PACKAGE_TYPE = {
    default: 1, // 集中式
    distributedDefault: 4, // 分散式
    baseDefault: 2, // 基地型
  }
  
  // ---------------- 第一步：项目基本信息 ----------------
  
  export const storageOptions = [
    { label: '自建', value: 1 },
    { label: '租借', value: 2 },
    { label: '不配置', value: 3 },
  ]
  
  export const capacityProportionOptions = [
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
    { label: '30%', value: 30 },
  ]
  
  export const storageHoursOptions = [
    { label: '2小时', value: 2 },
    { label: '4小时', value: 4 },
  ]
  
  // 场区坐标：去掉手动录入，只保留"上传文件"和新增的"引用项目数据"
  export const pointOptions = [
    { label: '上传文件', value: 'upload' },
    { label: '引用项目数据', value: 'reference' },
  ]
  
  // 风机点位 / 升压站点位：三选一，都不支持手动录入坐标
  export const fanLocationOptions = [
    { label: '上传文件', value: 'upload' },
    { label: '引用项目数据', value: 'reference' },
    { label: '自动布机', value: 'auto' },
  ]
  
  export const boosterLocationOptions = [
    { label: '上传文件', value: 'upload' },
    { label: '引用项目数据', value: 'reference' },
    { label: '系统自动选址', value: 'auto' },
  ]
  
  export const hubTypeOptions = [
    { label: '倾向', value: 0 },
    { label: '指定', value: 1 },
  ]
  
  // 倾向轮毂高度可选值（后端可按机型动态下发，这里先给一版静态兜底）
  export const preferHubHeightOptions = [
    { label: '90m', value: 90 },
    { label: '100m', value: 100 },
    { label: '115m', value: 115 },
    { label: '120m', value: 120 },
    { label: '140m', value: 140 },
    { label: '160m', value: 160 },
  ]
  
  // 场区坐标 = 引用项目数据 时展示的占位文件名（真实数据由接口返回后替换）
  export const mockReferenceFile = {
    point: { label: '项目场区范围', value: '项目场区范围.kml' },
  }
  
  // ---------------- 第二步：项目建设条件 ----------------
  // 统一模式：每个板块只有"引用项目 / 暂无"两个选项，选"引用项目"时展示一个只读的引用信息框。
  
  export const voltageLevelOptionsByMode = {
    [PACKAGE_TYPE.default]: [
      { label: '220 kV', value: 220 },
      { label: '110 kV', value: 110 },
    ],
    [PACKAGE_TYPE.baseDefault]: [{ label: '220 kV', value: 220 }],
    [PACKAGE_TYPE.distributedDefault]: [
      { label: '35 kV', value: 35 },
      { label: '10 kV', value: 10 },
    ],
  }
  
  export const referenceToggleOptions = [
    { label: '引用项目', value: 1 },
    { label: '暂无', value: 0 },
  ]
  
  // 每一块"引用项目"选中后展示的只读字段结构（label/value 数组），
  // 真实数据接口就绪后按 key 替换 rows 里的 value 即可。
  export const stepTwoReferenceBlocks = {
    windTower: {
      title: '测风塔数据',
      key: 'isAnemometerTowerData',
      rows: [
        { label: '引用测风塔', value: '#00395.txt' },
        { label: '', value: '#00396.txt' },
      ],
    },
    geological: {
      title: '地质勘查报告',
      key: 'isGeologicalSurveyReport',
      rows: [{ label: '引用地质库', value: 'DZ098767909876', link: true }],
    },
    topographic: {
      title: '地形图',
      key: 'isTopographicMap',
      rows: [{ label: '引用地质库', value: 'DZ098767909876', link: true }],
    },
    system: {
      title: '接入系统报告',
      key: 'isSystemReport',
      rows: [
        { label: '引用电网库', value: 'DW098767909876', link: true },
        { label: '接入站', value: 'XXXXX站' },
        { label: '接入站位置', value: '106.987898,36.987' },
        { label: '接入方式', value: '架空线路' },
      ],
    },
  }
  
  // 高级参数设置里同样"上传"改"引用项目"的几块
  export const stepTwoAdvancedBlocks = {
    weather: { title: '气象站相关数据', key: 'isWeatherStationData', rows: [{ label: '引用气象站', value: 'XXX气象站数据.xlsx' }] },
    avoid: { title: '避让区域', key: 'isAvoidAreasData', rows: [{ label: '引用避让区域', value: '避让区域数据集(3组)' }] },
    deployable: { title: '可布机区域', key: 'isCanDeployableAreaData', rows: [{ label: '引用可布机区域', value: 'XXXX.shp' }] },
    eia: { title: '环评报告', key: 'isEiaReport', rows: [{ label: '引用环保库', value: 'HB098767909876', link: true }] },
    water: { title: '水保报告', key: 'isWaterConservationReport', rows: [{ label: '引用水保库', value: 'SB098767909876', link: true }] },
    mesoscale: { title: '中尺度数据', key: 'isMesoscaleFile', rows: [{ label: '引用中尺度数据', value: '98.813978_36.614381_ERA5.txt' }] },
  }
  
  export const cableLayingMethodOptions = [
    { label: '架空线路', value: 0 },
    { label: '电缆铺设', value: 1 },
  ]
  
  export const iceThicknessOptions = [
    { label: '10mm', value: 10 },
    { label: '15mm', value: 15 },
    { label: '20mm', value: 20 },
  ]
  
  export const powerGridOptions = [
    { label: 'a级', value: 0 },
    { label: 'b级', value: 1 },
    { label: 'c级', value: 2 },
  ]
  
  // ---------------- 第三步：项目投资设置 ----------------
  // 完整保留老项目 dataSource 的分组/字段结构（类型、单位、默认值、最小/最大值、后端字段码），
  // 只是把展示逻辑从 EditTable 换成我们自己的 CostTable。
  
  export const costTableDataSource = [
    { name: '风机单价', dataIndex: 'windTurbineUnitPrice', unit: '元/kW', default: 1300, min: 1000, max: 2000, type: '设备相关', codeNum: '000005' },
    { name: '塔筒单价', dataIndex: 'towerBarrelUnitPrice', unit: '元/t', default: 8500, min: 5000, max: 15000, type: '设备相关', codeNum: '000006' },
    { name: '混塔塔筒单价', dataIndex: 'mixTowerBarrelUnitPrice', unit: '元/kW', default: 800, min: 500, max: 1200, type: '设备相关', codeNum: '000022' },
    { name: '主变单价', dataIndex: 'mainTransformerUnitPrice', unit: '元/MVA', default: 50000, min: 47000, max: 55000, type: '设备相关', codeNum: '000009' },
    { name: '箱变单价', dataIndex: 'boxTransformerUnitPrice', unit: '元/kVA', default: 95, min: 90, max: 110, type: '设备相关', codeNum: '000010' },
    { name: '无功率补偿装置SVG单价', dataIndex: 'svgUnitPrice', unit: '元/Mvar', default: 70000, min: 66000, max: 77000, type: '设备相关', codeNum: '000011' },
    { name: '送出工程总费用', dataIndex: 'sendOutTotalPrice', unit: '万元', default: 0, min: 0, max: 15000, type: '设备相关', desc: '系统确认升压站位置后自动计算，若调整价格则以调整值为准' },
    { name: '储能设备费', dataIndex: 'energyStorageDeviceFee', unit: '万元/MWh', default: 70, min: 60, max: 80, type: '设备相关', codeNum: '000012' },
    { name: '项目资金比例', dataIndex: 'fundingRatio', unit: '%', default: 20, min: 20, max: 100, type: '资金及费率', codeNum: '000001' },
    { name: '长期贷款利率', dataIndex: 'longLoanRate', unit: '%', default: 3.95, min: 0, max: 20, type: '资金及费率', codeNum: '000002' },
    { name: '短期贷款利率', dataIndex: 'shortLoanRate', unit: '%', default: 3.55, min: 0, max: 20, type: '资金及费率', codeNum: '000003' },
    { name: '基本预备费费率', dataIndex: 'basicContingencyRate', unit: '%', default: 2, min: 1, max: 3, type: '预备费', codeNum: '000004' },
    { name: '上网电价（含税）', dataIndex: 'feedInTariff', unit: '元/kWh', default: '系统自动取费', min: 0.001, max: 2, type: '发电上网' },
    { name: '限电比例', dataIndex: 'powerRationingRatio', unit: '%', default: 0, min: 0, max: 50, type: '发电上网' },
  ]
  
  // codeNum -> 动态参数接口的字段映射说明（对接后端 getThreeStepDynamicParam 时用）
  export const costTableCodeNumField = 'codeNum'