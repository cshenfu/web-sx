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
    {
      key: 'overview',
      icon: 'Overview', // 改为 Overview
      label: '项目总览', // 去掉 \n
      path: '/overview',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'site',
      icon: 'SiteSelect', // 改为 SiteSelect
      label: '智能选址', // 去掉 \n
      path: '/site',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'reserve',
      icon: 'Reserve', // 改为 Reserve
      label: '项目储备', // 去掉 \n
      path: '/reserve',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'approval',
      icon: 'Approval', // 改为 Approval
      label: '立项阶段', // 去掉 \n
      path: '/approval',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'research',
      icon: 'Research', // 改为 Research
      label: '可研阶段', // 去掉 \n
      path: '/research',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'decision',
      icon: 'Decision', // 改为 Decision
      label: '投资决策', // 去掉 \n
      path: '/decision',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'compute',
      icon: 'Compute', // 改为 Compute
      label: '计算队列', // 去掉 \n
      path: '/compute',
      roles: ['admin', 'user', 'viewer']
    }
  ],
  // ─────────────────────────────────────────────
  // 研评智坊 → 智能评审
  // ─────────────────────────────────────────────
  'yanping-review': [
    {
      key: 'home',
      icon: 'House',
      label: '首页',
      path: '/yanping',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'create',
      icon: 'Plus',
      label: '创建',
      path: '/yanping/review/create',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'project',
      icon: 'Folder',
      label: '项目',
      path: '/yanping/review/project',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'draft',
      icon: 'Document',
      label: '草稿',
      path: '/yanping/review/draft',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'default-project',
      icon: 'Star',
      label: '项目',
      path: '/yanping/review/default-project',
      roles: ['admin', 'user', 'viewer']
    }
  ],

  // ─────────────────────────────────────────────
  // 研评智坊 → 技经概算
  // ─────────────────────────────────────────────
  'yanping-budget': [
    {
      key: 'home',
      icon: 'House',
      label: '首页',
      path: '/yanping',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'create',
      icon: 'Plus',
      label: '创建',
      path: '/yanping/budget/create',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'project',
      icon: 'Folder',
      label: '项目',
      path: '/yanping/budget/project',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'draft',
      icon: 'Document',
      label: '草稿',
      path: '/yanping/budget/draft',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'default-project',
      icon: 'Star',
      label: '项目',
      path: '/yanping/budget/default-project',
      roles: ['admin', 'user', 'viewer']
    }
  ],

  // ─────────────────────────────────────────────
  // 研评智坊 → 财务评价
  // ─────────────────────────────────────────────
  'yanping-finance': [
    {
      key: 'home',
      icon: 'House',
      label: '首页',
      path: '/yanping',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'create',
      icon: 'Plus',
      label: '创建',
      path: '/yanping/finance/create',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'project',
      icon: 'Folder',
      label: '项目',
      path: '/yanping/finance/project',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'draft',
      icon: 'Document',
      label: '草稿',
      path: '/yanping/finance/draft',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'default-project',
      icon: 'Star',
      label: '项目',
      path: '/yanping/finance/default-project',
      roles: ['admin', 'user', 'viewer']
    }
  ],

  // ─────────────────────────────────────────────
  // 湖仓汇源
  // ─────────────────────────────────────────────
  hucang: [
    {
      key: 'geology',
      icon: 'MapLocation',
      label: '地质',
      path: '/hucang/geology',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'equipment',
      icon: 'Box',
      label: '设备',
      path: '/hucang/equipment',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'grid',
      icon: 'Connection',
      label: '电网',
      path: '/hucang/grid',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'climate',
      icon: 'Cloudy',
      label: '气候',
      path: '/hucang/climate',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'price',
      icon: 'Money',
      label: '价格',
      path: '/hucang/price',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'windtower',
      icon: 'Upload',
      label: '测风塔',
      path: '/hucang/windtower',
      roles: ['admin', 'user', 'viewer']
    },
    {
      key: 'avoidzone',
      icon: 'Warning',
      label: '避让\n区域',
      path: '/hucang/avoidzone',
      roles: ['admin']
    },
    {
      key: 'rule',
      icon: 'Memo',
      label: '制度',
      path: '/hucang/rule',
      roles: ['admin']
    }
  ],

  // ─────────────────────────────────────────────
  // 规制中枢
  // ─────────────────────────────────────────────
  guizhi: [
    {
      key: 'role',
      icon: 'UserFilled',
      label: '角色',
      path: '/guizhi/role',
      roles: ['admin']
    },
    {
      key: 'dict',
      icon: 'Collection',
      label: '字典',
      path: '/guizhi/dict',
      roles: ['admin']
    },
    {
      key: 'company',
      icon: 'OfficeBuilding',
      label: '企业\n介绍',
      path: '/guizhi/company',
      roles: ['admin']
    },
    {
      key: 'log',
      icon: 'List',
      label: '日志',
      path: '/guizhi/log',
      roles: ['admin']
    }
  ]
}