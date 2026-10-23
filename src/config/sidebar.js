/**
 * 侧边栏配置
 *
 * sidebarConfig 的 key 对应路由 meta.sidebar
 * roles 表示哪些角色可以看到该菜单
 */

export const sidebarConfig = {
  // ─────────────────────────────────────────────
  // 秦川智筹
  // ─────────────────────────────────────────────
  qinchuan: [
    { key: 'overview', icon: 'Overview', label: '项目总览', path: '/overview', roles: ['admin', 'user', 'viewer'] },
    { key: 'site', icon: 'SiteSelect', label: '智能选址', path: '/site', roles: ['admin', 'user', 'viewer'] },
    { key: 'reserve', icon: 'Reserve', label: '项目储备', path: '/reserve', roles: ['admin', 'user', 'viewer'] },
    { key: 'approval', icon: 'Approval', label: '立项阶段', path: '/approval', roles: ['admin', 'user', 'viewer'] },
    { key: 'research', icon: 'Research', label: '可研阶段', path: '/research', roles: ['admin', 'user', 'viewer'] },
    { key: 'decision', icon: 'Decision', label: '投资决策', path: '/decision', roles: ['admin', 'user', 'viewer'] },
    { key: 'compute', icon: 'Compute', label: '计算队列', path: '/compute', roles: ['admin', 'user', 'viewer'] }
  ],

  // ─────────────────────────────────────────────
  // 研评智坊 → 智能评审
  // ─────────────────────────────────────────────
  'yanping-review': [
    { key: 'home', icon: 'House', label: '首页', path: '/yanping', roles: ['admin', 'user', 'viewer'] },
    { key: 'create', icon: 'Plus', label: '创建', path: '/yanping/review/create', roles: ['admin', 'user', 'viewer'] },
    { key: 'project', icon: 'Folder', label: '项目', path: '/yanping/review/project', roles: ['admin', 'user', 'viewer'] },
    { key: 'draft', icon: 'Document', label: '草稿', path: '/yanping/review/draft', roles: ['admin', 'user', 'viewer'] },
    { key: 'default-project', icon: 'Star', label: '项目', path: '/yanping/review/default-project', roles: ['admin', 'user', 'viewer'] }
  ],

  // ─────────────────────────────────────────────
  // 研评智坊 → 技经概算
  // ─────────────────────────────────────────────
  'yanping-budget': [
    { key: 'home', icon: 'House', label: '首页', path: '/yanping', roles: ['admin', 'user', 'viewer'] },
    { key: 'create', icon: 'Plus', label: '创建', path: '/yanping/budget/create', roles: ['admin', 'user', 'viewer'] },
    { key: 'project', icon: 'Folder', label: '项目', path: '/yanping/budget/project', roles: ['admin', 'user', 'viewer'] },
    { key: 'draft', icon: 'Document', label: '草稿', path: '/yanping/budget/draft', roles: ['admin', 'user', 'viewer'] },
    { key: 'default-project', icon: 'Star', label: '项目', path: '/yanping/budget/default-project', roles: ['admin', 'user', 'viewer'] }
  ],

  // ─────────────────────────────────────────────
  // 研评智坊 → 财务评价
  // ─────────────────────────────────────────────
  'yanping-finance': [
    { key: 'home', icon: 'House', label: '首页', path: '/yanping', roles: ['admin', 'user', 'viewer'] },
    { key: 'create', icon: 'Plus', label: '创建', path: '/yanping/finance/create', roles: ['admin', 'user', 'viewer'] },
    { key: 'project', icon: 'Folder', label: '项目', path: '/yanping/finance/project', roles: ['admin', 'user', 'viewer'] },
    { key: 'draft', icon: 'Document', label: '草稿', path: '/yanping/finance/draft', roles: ['admin', 'user', 'viewer'] },
    { key: 'default-project', icon: 'Star', label: '项目', path: '/yanping/finance/default-project', roles: ['admin', 'user', 'viewer'] }
  ],

  // ─────────────────────────────────────────────
  // 湖仓汇源
  // ─────────────────────────────────────────────
  hucang: [
    { 
      key: 'weather', 
      icon: 'Weather', 
      label: '气象', 
      path: '/hucang/weather/list', 
      roles: ['admin', 'user', 'viewer'] 
    },
    { 
      key: 'climate', 
      icon: 'Climate', 
      label: '气候', 
      path: '/hucang/climate/list', 
      roles: ['admin', 'user', 'viewer'] 
    },
    { 
      key: 'windTower', 
      icon: 'WindTower', 
      label: '测风塔', 
      path: '/hucang/windTower/list', 
      roles: ['admin', 'user', 'viewer'] 
    },
    // 👇 地质（父项），点击进地勘，悬停出三个子列表
    { 
      key: 'geology', 
      icon: 'Geology', 
      label: '地质', 
      path: '/hucang/geology/list', 
      roles: ['admin', 'user', 'viewer'],
      children: [
        { key: 'geology-list', label: '地质数据库', path: '/hucang/geology/list' },
        { key: 'environment-list', label: '环评数据库', path: '/hucang/environment/list' },
        { key: 'water-list', label: '水保数据库', path: '/hucang/waterConservayion/list' }
      ]
    },
    { 
      key: 'avoidzone', 
      icon: 'AvoidZone', 
      label: '避让区域', 
      path: '/hucang/avoidzone', 
      roles: ['admin'] 
    },
    { 
      key: 'currentPower', 
      icon: 'PowerGrid', 
      label: '电网', 
      path: '/hucang/currentPower/list', 
      roles: ['admin', 'user', 'viewer'] 
    },
    // 👇 设备（父项），点击进风电，悬停出三个子列表
    { 
      key: 'equipment', 
      icon: 'Equipment', 
      label: '设备', 
      path: '/hucang/windEquipment/list', 
      roles: ['admin', 'user', 'viewer'],
      children: [
        { key: 'equipment-wind', label: '风电设备', path: '/hucang/windEquipment/list' },
        { key: 'equipment-pv', label: '光伏组件', path: '/hucang/photovoltaic/list' },
        { key: 'equipment-inverter', label: '逆变器', path: '/hucang/inverter/list' }
      ]
    },
    { 
      key: 'costLibrary', 
      icon: 'Price', 
      label: '造价', 
      path: '/hucang/costLibrary/list', 
      roles: ['admin', 'user', 'viewer'] 
    }
  ],

  // ─────────────────────────────────────────────
  // 规制中枢
  // ─────────────────────────────────────────────
  guizhi: [
    { key: 'role', icon: 'UserFilled', label: '角色', path: '/guizhi/role', roles: ['admin', 'user', 'viewer'] },
    { key: 'dict', icon: 'Collection', label: '字典', path: '/guizhi/dict', roles: ['admin', 'user', 'viewer'] },
    { key: 'company', icon: 'OfficeBuilding', label: '企业介绍', path: '/guizhi/company', roles: ['admin', 'user', 'viewer'] },
    { key: 'log', icon: 'List', label: '日志', path: '/guizhi/log', roles: ['admin', 'user', 'viewer'] }
  ]
}