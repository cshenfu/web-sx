// js/areaPanelMockData.js
// 区域面板 & 项目详情面板所用的 mock 数据。
// 后续对接接口时，保持字段名不变，直接把这里的静态数组换成接口返回即可。

// ---------------- 避让/区域列表（收起后展开的卡片列表） ----------------
export const AREA_TYPE_OPTIONS = [
  { value: '', label: '避让类型' },
  { value: 'common', label: '通用避让' },
  { value: 'survey', label: '地勘报告' },
]

export const DATA_TYPE_OPTIONS = [
  { value: '', label: '数据类型' },
]

export const areaListMockData = [
  {
    id: 'area-001',
    tag: '通用避让',
    tagType: 'common',
    name: '已建项目：风电',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-002',
    tag: '通用避让',
    tagType: 'common',
    name: '矿区',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-003',
    tag: '通用避让',
    tagType: 'common',
    name: '生态保护区',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-004',
    tag: '地勘报告',
    tagType: 'survey',
    name: '耕地',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-005',
    tag: '通用避让',
    tagType: 'common',
    name: '不可用',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-006',
    tag: '通用避让',
    tagType: 'common',
    name: '生态保护区',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-007',
    tag: '通用避让',
    tagType: 'common',
    name: '生态保护区',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
  {
    id: 'area-008',
    tag: '通用避让',
    tagType: 'common',
    name: '生态保护区',
    updatedAt: '2026/03/21 09:19:00',
    operator: '张三',
  },
]

// ---------------- 项目详情面板 ----------------

export const projectDetailMockData = {
  id: 'project-yanan-50mw',
  name: '延安 50MW 风电场项目',
  company: 'XXXXXX分公司',
  center: [109.4899, 36.5853], // 详情跳转时 flyTo 的中心点，实际接入时用区域 centroid 替换
  zoom: 12.5,

  mainInfo: {
    timeline: [
      { key: 'select', label: '初步遴选', date: '2026/07/28' },
      { key: 'reserve', label: '项目储备', date: '2026/07/28' },
      { key: 'approve', label: '项目立项', date: '2026/07/28' },
      { key: 'feasibility', label: '可研审查', date: '2026/07/28', active: true },
      { key: 'invest', label: '投资决策', date: '2026/07/28' },
      { key: 'construct', label: '项目施工', date: '2026/07/28' },
      { key: 'operate', label: '项目运营', date: '2026/07/28' },
    ],
    metrics: [
      { label: '装机容量', value: '100', unit: 'MW' },
      { label: '建设总投资', value: '10000.21', unit: '万元' },
      { label: '资本金IRR', value: '5.96', unit: '%', highlight: true },
      { label: '年均上网小时数', value: '1987.56', unit: 'h' },
    ],
    planCards: [
      {
        title: '主要规划情况',
        icon: 'location',
        rows: [
          ['风机数量', '24台(单机6.25MW)'],
          ['轮毂高度/叶轮直径', '140m/220m'],
          ['道路总长度', '23.56km'],
          ['线路总长度', '16.85km'],
          ['永久征地面积', '200987m²'],
        ],
      },
      {
        title: '升压站及接入信息',
        icon: 'bolt',
        rows: [
          ['升压站电压等级', '110kV'],
          ['主容量', '3100MVA（1台）'],
          ['集电线路敷设方式', '架空+地理'],
          ['接入站', 'XXX变电站'],
          ['接入距离', '30.56km'],
        ],
      },
    ],
    subTabs: [
      {
        key: 'turbine',
        label: '风机坐标明细',
        columns: ['风机编号', 'Y坐标', '平均风速(m/s)', '年发电量(m/s)', '备注'],
        rows: Array.from({ length: 9 }, () => [
          'XZ01', '3509875675', '3509875675', '3509875675', '3509875675',
        ]),
      },
      { key: 'substation', label: '升压站设计', columns: [], rows: [] },
      { key: 'access', label: '接入点参数', columns: [], rows: [] },
      { key: 'road', label: '厂区道路', columns: [], rows: [] },
    ],
  },

  surveyInfo: {
    sections: [
      {
        key: 'terrain',
        title: '地形信息',
        extraLabel: '地质库：',
        extraValue: 'DZ098767909876',
        files: [
          { tag: '地勘报告', name: 'XXXXXXX地勘报告.pdf', updatedAt: '2026/03/21 09:00:00', operator: '张三' },
          { tag: '场区地形图', tag2: '1:2000', name: 'XXXX1:2000地形图.dwg', updatedAt: '2026/03/21 09:00:00', operator: '张三' },
          { tag: '升压站地形图', tag2: '1:500', name: 'XXXX1:500地形图.dwg', updatedAt: '2026/03/21 09:00:00', operator: '张三' },
        ],
      },
      {
        key: 'wind',
        title: '测风信息',
        files: [
          { tag: '测风塔', name: '#098904.txt', updatedAt: '2026/03/21 09:00:00', operator: '张三', actions: ['download', 'delete'], hasImage: true },
          { tag: '测风塔', name: '#098903.txt', updatedAt: '2026/03/21 09:00:00', operator: '张三', actions: ['download', 'delete'] },
          { tag: 'ERA5数据', tag2: '98.813978_36.614381_ERA5.txt', name: '尺度风速: 100m:5.86m/s,120m:5.92m/s,140m:6.06m/s', updatedAt: '2026/03/21 09:00:00', operator: '系统', actions: ['download', 'delete'] },
          { tag: '气象数据', name: 'XXX气象站数据.xlsx', updatedAt: '2026/03/21 09:00:00', operator: '张三', actions: ['download', 'delete'] },
        ],
      },
      {
        key: 'env',
        title: '环保数据',
        extraLabel: '环保库：',
        extraValue: 'HB098767909876',
        files: [
          { tag: '环评报告', name: 'XXXXXXX环评报告.pdf', updatedAt: '2026/03/21 09:00:00', operator: '张三' },
        ],
      },
      {
        key: 'water',
        title: '水保数据',
        files: [],
        emptyText: '暂无数据~',
      },
      {
        key: 'check',
        title: '核查信息',
        description: '地貌特征：黄土高原沟壑，地垒类型：园地，是否涉敏：拟选场址范围及附近不涉及新版生态红线、环境保护、基本农田、林地林权占区、压覆矿产、文物古迹、军事等限制项目开发的敏感性因素。',
        files: [
          { tag: '核查文件', name: 'XXXXXXX核查信息.pdf', updatedAt: '2026/03/21 09:00:00', operator: '张三', actions: ['edit', 'delete'] },
        ],
      },
    ],
  },

  supportDocs: {
    stages: ['全部', '立项阶段', '可研审查', '投资决策', '建设准备', '建设实施', '竣工验收', '投产运营'],
    activeStage: '投资决策',
    typeFilters: [
      { key: 'approval', label: '核准批复', color: 'pink' },
      { key: 'eia', label: '环评批复', color: 'pink' },
      { key: 'water', label: '水保批复', color: 'green' },
      { key: 'access', label: '接入批复', color: 'green' },
      { key: 'land', label: '用地预审', color: 'green' },
    ],
    files: [
      {
        tag: '压覆矿批复',
        org: '榆林市自然资源和规划局',
        docNo: '渝政自然函〔2025〕70号',
        date: '2026/03/21取得',
        name: '榆林市自然资源和规划局关于陕西华电边韩家沟200MW风力发电工程项目压覆重要矿产资源查询结果的函.pdf',
        updatedAt: '2026/03/21 09:00:00',
        operator: '张三',
      },
      {
        tag: '用地预审',
        org: '陕西省自然资源厅',
        docNo: '陕自然资审〔2025〕556号',
        date: '2026/03/21取得',
        name: '用地预审与选址意见.pdf',
        updatedAt: '2026/03/21 09:00:00',
        operator: '张三',
      },
      {
        tag: '用地预审',
        org: '陕西省自然资源厅',
        docNo: '陕自然资审〔2025〕556号',
        date: '2026/03/21取得',
        name: '建设用地批复.pdf',
        updatedAt: '2026/03/21 09:00:00',
        operator: '张三',
      },
      {
        tag: '接入批复',
        org: '国网陕西省电力公司',
        docNo: '陕电发展〔2025〕214号',
        date: '2026/03/21取得',
        name: '陕西华电白水15万千瓦风电工程接入系统批复.pdf',
        updatedAt: '2026/03/21 09:00:00',
        operator: '张三',
      },
    ],
  },

  projectReport: {
    subTabs: [
      { key: 'proposal', label: '项目建议书', count: 5 },
      { key: 'feasibility', label: '可研报告', count: 5 },
      { key: 'bidding', label: '竞配申报报告', count: 5 },
      { key: 'request', label: '请示文件', count: 2, active: true },
      { key: 'postEval', label: '后评价报告', count: 5 },
    ],
    columns: ['文件ID', '计算类型', '文件类型', '请示单位', '装机容量/MW', '状态', '备注', '创建时间', '操作'],
    rows: [
      { id: '00002', calcType: '人工', fileType: '压覆矿审查请示', unit: '西安市自然资源和规划厅', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '环评审查请示', unit: '临潼区环保局', capacity: 50, status: '计算中', statusType: 'info', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '林业审查请示', unit: '临潼区林业局', capacity: 50, status: '挂起中', statusType: 'warning', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '水保审查请示', unit: '临潼区水保局', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '文物审查请示', unit: '临潼区文化和旅游体育局', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '林业审查请示', unit: '临潼区林业局', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '压覆矿审查请示', unit: '西安市自然资源和规划厅', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
      { id: '00002', calcType: '人工', fileType: '终止计算', unit: '临潼区林业局', capacity: 50, status: '已完成', statusType: 'success', remark: '--', createdAt: '2025-09-21 09:00' },
    ],
  },

  reviewInfo: {
    timeline: [
      { key: 'approve', label: '立项', date: '2026/03/28' },
      { key: 'feasibility', label: '可研审查', date: '2026/04/28' },
      { key: 'invest', label: '投资决策', date: null },
    ],
    groups: [
      {
        key: 'g1',
        stage: '可研',
        date: '2026-06-18',
        to: 'to新能源公司',
        items: [
          {
            tag: '审查意见',
            org: 'XXXXX设计院',
            date: '2026/03/21取得',
            name: '延安50MW风电场项目可行性研究报告审查意见.pdf',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
        ],
      },
      {
        key: 'g2',
        stage: '立项',
        date: '2026-06-12',
        to: '陕西公司',
        items: [
          {
            tag: '会议纪要',
            org: '华电陕西能源有限公司办公室',
            docNo: '总经理办公会纪要〔2026〕3号',
            date: '2026/03/21取得',
            name: '关于陕西华电靖边10万千瓦风电项目前期立项的会议纪要.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
          {
            tag: '立项批复',
            org: '华电陕西能源有限公司',
            docNo: '华电陕西〔2024〕74号',
            date: '2026/03/21取得',
            name: '关于陕西华电靖边10万千瓦风电项目前期立项的批复.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
        ],
      },
      {
        key: 'g3',
        stage: '立项',
        date: '2026-06-10',
        to: 'to陕西公司',
        active: true,
        items: [
          {
            tag: '立项申请',
            org: 'XXX新能源公司',
            date: '2026/03/21 申请',
            name: '关于陕西华电靖边10万千瓦风电项目前期立项申请报告.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
          {
            tag: '立项请示',
            org: 'XXX新能源公司',
            date: '2026/03/21 申请',
            name: '关于陕西华电靖边10万千瓦风电项目的立项请示函.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
        ],
      },
      {
        key: 'g4',
        stage: '立项',
        date: '2026-06-10',
        to: 'to新能源公司',
        items: [
          {
            tag: '立项申请',
            org: 'XXX项目公司',
            date: '2026/03/21 申请',
            name: '关于陕西华电靖边10万千瓦风电项目前期立项申请报告.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
          {
            tag: '会议纪要',
            org: 'XXX项目公司',
            date: '2026/03/21 申请',
            name: '关于陕西华电靖边10万千瓦风电项目前期立项的会议纪要.docx',
            operator: '张三',
            updatedAt: '2026/03/21 09:00:00',
          },
        ],
      },
    ],
  },
}

// ---------------- 报告/函件生成弹窗 ----------------
export const reportTypeOptions = [
  { key: 'proposal', label: '项目建议书', icon: 'bulb', iconColor: '#2fd0c4' },
  { key: 'feasibility-centralized', label: '可研报告（集中式）', sub: '[30~200] MW', icon: 'doc', iconColor: '#2f8dff' },
  { key: 'feasibility-distributed', label: '可研报告（分散式）', sub: '[5~40] MW', icon: 'chart', iconColor: '#9b6bff' },
  { key: 'feasibility-base', label: '可研报告（基地项目）', sub: '[200~500] MW', icon: 'chart-alt', iconColor: '#ff8a3d' },
  { key: 'bidding', label: '竞配申报文件', icon: 'file-badge', iconColor: '#f2b23c' },
  { key: 'request', label: '请示文件', icon: 'file-pen', iconColor: '#ff5c7a' },
  { key: 'postEval', label: '后评价报告', icon: 'file-edit', iconColor: '#8b6bff' },
]
