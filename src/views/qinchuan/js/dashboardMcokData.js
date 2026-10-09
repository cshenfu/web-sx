// 这些数据只用于页面联调。
// 接入接口时，直接把它们替换为接口返回值，组件本身不需要修改。

export const projectOverviewRows = [
  {
    key: 'pre-selection',
    stage: '初步遴选',
    color: '#9254de',
    wind: { value: 200, unit: 'MW' },
    solar: { value: 100, unit: 'MW' },
  },
  {
    key: 'reserved',
    stage: '已储备',
    color: '#E8059B',
    wind: { value: 300, unit: 'MW' },
    solar: { value: 160, unit: 'MW' },
  },
  {
    key: 'planning',
    stage: '规划中',
    color: '#fa8c16',
    wind: { value: 200, unit: 'MW' },
    solar: { value: 100, unit: 'MW' },
  },
  {
    key: 'construction',
    stage: '施工中',
    color: '#597ef7',
    wind: { value: 200, unit: 'MW' },
    solar: { value: 100, unit: 'MW' },
  },
  {
    key: 'operating',
    stage: '已投产',
    color: '#a0d911',
    wind: { value: 200, unit: 'MW' },
    solar: { value: 100, unit: 'MW' },
  },
]

export const annualTargetData = {
  year: '2026年',
  development: {
    label: '开发',
    target: 460,
    completed: 233,
    unit: 'MW',
  },
  commissioning: {
    label: '投产',
    target: 1680,
    completed: 840,
    unit: 'MW',
  },
}

export const progressWarningData = [
  {
    key: 'reserve',
    label: '储备',
    target: 300,
    actual: 260,
    unit: '万',
  },
  {
    key: 'project-initiation',
    label: '立项',
    target: 233,
    actual: 213,
    unit: '项',
  },
  {
    key: 'research-review',
    label: '科研审查',
    target: 233,
    actual: 233,
    unit: '项',
  },
  {
    key: 'investment-decision',
    label: '投资决策',
    target: 233,
    actual: 233,
    unit: '项',
  },
]

// 点击项目阶段后，父组件可以用这份假数据调用 MapGL.addExtrusion。
// cityValues 的 key 要和 GeoJSON properties.name 保持一致。
export const stageCityData = {
  'pre-selection': {
    '西安市': 70,
    '铜川市': 25,
    '宝鸡市': 50,
    '咸阳市': 42,
    '渭南市': 86,
    '延安市': 34,
    '汉中市': 64,
    '榆林市': 100,
    '安康市': 38,
    '商洛市': 20,
  },
  reserved: {
    '西安市': 35,
    '铜川市': 42,
    '宝鸡市': 56,
    '咸阳市': 68,
    '渭南市': 30,
    '延安市': 78,
    '汉中市': 46,
    '榆林市': 92,
    '安康市': 62,
    '商洛市': 24,
  },
  planning: {
    '西安市': 84,
    '铜川市': 36,
    '宝鸡市': 48,
    '咸阳市': 72,
    '渭南市': 55,
    '延安市': 44,
    '汉中市': 70,
    '榆林市': 100,
    '安康市': 30,
    '商洛市': 62,
  },
  construction: {
    '西安市': 60,
    '铜川市': 30,
    '宝鸡市': 42,
    '咸阳市': 75,
    '渭南市': 68,
    '延安市': 50,
    '汉中市': 33,
    '榆林市': 90,
    '安康市': 52,
    '商洛市': 28,
  },
  operating: {
    '西安市': 46,
    '铜川市': 20,
    '宝鸡市': 72,
    '咸阳市': 54,
    '渭南市': 88,
    '延安市': 62,
    '汉中市': 30,
    '榆林市': 100,
    '安康市': 48,
    '商洛市': 38,
  },
}

export const investmentOverviewData = {
  year: '2026年',
  annualPlan: 567944.43,
  completed: 367944.43,
  completionRate: 65,
  wind: {
    label: '风电项目',
    annualPlan: 164400,
    completed: 59916.34,
    completionRate: 54,
  },
  solar: {
    label: '太阳能项目',
    annualPlan: 164400,
    completed: 59916.34,
    completionRate: 54,
  },
  ruralSupport: {
    label: '帮扶项目',
    completed: 100,
    target: 300,
    unit: '万元',
  },
  consumptionSupport: {
    label: '消费帮扶',
    completed: 10,
    target: 300,
    unit: '万元',
  },
}

export const strategyPlanningData = {
  year: '十五五',
  targets: [
    {
      key: 'installed-capacity',
      label: '总装机目标',
      value: 600,
      unit: '万kW',
      completionRate: 80.2,
    },
    {
      key: 'clean-energy',
      label: '清洁能源目标',
      value: 620,
      unit: '万kW',
      completionRate: 93.2,
    },
  ],
  actualStructure: [
    { label: '火电', value: 132, unit: '万kW', percentage: 32 },
    { label: '风电', value: 180, unit: '万kW', percentage: 43 },
    { label: '光伏', value: 108, unit: '万kW', percentage: 25 },
  ],
  newDuringPeriod: [
    { label: '火电', value: 80, unit: '万kW', percentage: 24 },
    { label: '风电', value: 160, unit: '万kW', percentage: 48 },
    { label: '光伏', value: 94, unit: '万kW', percentage: 28 },
  ],
}

export const policyNewsData = [
  {
    id: 1,
    title: '陕西省新能源项目开发建设工作持续推进',
    date: '03-21',
  },
  {
    id: 2,
    title: '规划部召开年度重点项目推进专题会议',
    date: '03-20',
  },
  {
    id: 3,
    title: '关于加快推进新型能源体系建设的指导意见',
    date: '03-18',
  },
  {
    id: 4,
    title: '陕西省“十五五”能源发展规划编制工作启动',
    date: '03-16',
  },
]