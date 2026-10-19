import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

// 路由表
const routes = [
  // 登录页：不经过 MainLayout
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: {
      title: '登录',
      public: true
    }
  },

  // ─────────────────────────────────────────────
  // 秦川智筹
  // ─────────────────────────────────────────────
  {
    path: '/',
    component: MainLayout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('@/views/qinchuan/Overview.vue'),
        meta: {
          title: '项目总览',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'overview'
        }
      },
      {
        path: 'site',
        name: 'SiteSelect',
        component: () => import('@/views/qinchuan/SiteSelect.vue'),
        meta: {
          title: '智能选址',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'site'
        }
      },
      {
        path: 'reserve',
        name: 'Reserve',
        component: () => import('@/views/qinchuan/Reserve.vue'),
        meta: {
          title: '项目储备',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'reserve'
        }
      },
      {
        path: 'approval',
        name: 'Approval',
        component: () => import('@/views/qinchuan/Approval.vue'),
        meta: {
          title: '立项阶段',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'approval'
        }
      },
      {
        path: 'research',
        name: 'Research',
        component: () => import('@/views/qinchuan/Research.vue'),
        meta: {
          title: '可研阶段',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'research'
        }
      },
      {
        path: 'decision',
        name: 'Decision',
        component: () => import('@/views/qinchuan/Decision.vue'),
        meta: {
          title: '投资决策',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'decision'
        }
      },
      {
        path: 'compute',
        name: 'Compute',
        component: () => import('@/views/qinchuan/Compute.vue'),
        meta: {
          title: '计算队列',
          module: 'qinchuan',
          sidebar: 'qinchuan',
          key: 'compute'
        }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 研评智坊
  // ─────────────────────────────────────────────
  {
    path: '/yanping',
    component: MainLayout,
    children: [
      // 研评智坊首页
      {
        path: '',
        name: 'YanpingIndex',
        component: () => import('@/views/yanping/Index.vue'),
        meta: {
          title: '研评智坊',
          module: 'yanping'
        }
      },

      // ─────────────────────────────────────────
      // 智能评审
      // ─────────────────────────────────────────
      {
        path: 'review',
        redirect: '/yanping/review/project',
        children: [
          {
            path: 'create',
            name: 'ReviewCreate',
            component: () => import('@/views/yanping/review/Create.vue'),
            meta: {
              title: '智能评审-创建',
              module: 'yanping',
              sidebar: 'yanping-review',
              key: 'create'
            }
          },
          {
            path: 'project',
            name: 'ReviewProject',
            component: () => import('@/views/yanping/review/Project.vue'),
            meta: {
              title: '智能评审-项目',
              module: 'yanping',
              sidebar: 'yanping-review',
              key: 'project'
            }
          },
          {
            path: 'draft',
            name: 'ReviewDraft',
            component: () => import('@/views/yanping/review/DefaultProject.vue'),
            meta: {
              title: '智能评审-草稿',
              module: 'yanping',
              sidebar: 'yanping-review',
              key: 'draft'
            }
          },
          {
            path: 'default-project',
            name: 'ReviewDefaultProject',
            component: () => import('@/views/yanping/review/DefaultProject.vue'),
            meta: {
              title: '智能评审-项目',
              module: 'yanping',
              sidebar: 'yanping-review',
              key: 'default-project'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 技经概算
      // ─────────────────────────────────────────
      {
        path: 'budget',
        redirect: '/yanping/budget/project', // 默认进项目页
        children: [
          // 侧边栏“首页”如果指向这里，直接重定向回整个大首页
          {
            path: 'home',
            redirect: '/yanping' 
          },
          // 1. 创建
          {
            path: 'create',
            name: 'BudgetCreate',
            // 替换为你复制过来的真实组件路径
            component: () => import('@/views/yanping/budget/estimateProject/estimateList/estimateTemplateList.vue'),
            meta: {
              title: '技经概算-创建',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'create'
            }
          },
          // 2. 项目
          {
            path: 'project',
            name: 'BudgetProject',
            // 替换为你复制过来的真实组件路径
            component: () => import('@/views/yanping/budget/estimateProject/estimateList/estimateList.vue'),
            meta: {
              title: '技经概算-项目',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'project'
            }
          },
          // 3. 草稿（保持原样）
          {
            path: 'draft',
            name: 'BudgetDraft',
            component: () => import('@/views/yanping/budget/DefaultProject.vue'),
            meta: {
              title: '技经概算-草稿',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'draft'
            }
          },
          {
            path: 'default-project',
            name: 'BudgetDefaultProject',
            component: () => import('@/views/yanping/budget/DefaultProject.vue'),
            meta: {
              title: '技经概算-项目',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'default-project'
            }
          },
          // ========== 下面是子页面（不在左侧菜单显示，但需保留防止 404） ==========
          // 预览页（如果在“项目”里点击进入预览）
          {
            path: 'newTemplatePreview',
            name: 'BudgetNewTemplatePreview',
            component: () => import('@/views/yanping/budget/estimateProject/templatePreview/NewTemplatePreview.vue'),
            meta: {
              title: '新项目预览',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'project' // 保持在左侧菜单高亮“项目”
            }
          },
          // 模版设置（如果在“项目”里点击进入设置）
          {
            path: 'set',
            name: 'BudgetSet',
            component: () => import('@/views/yanping/budget/estimateProject/estimateList/index2.vue'),
            meta: {
              title: '模版设置',
              module: 'yanping',
              sidebar: 'yanping-budget',
              key: 'project' // 保持在左侧菜单高亮“项目”
            }
          }
        ]
      },

            // ─────────────────────────────────────────
      // 财务评价
      // ─────────────────────────────────────────
      {
        path: 'finance',
        redirect: '/yanping/finance/project', // 默认进项目页
        children: [
          // 侧边栏“首页”统一重定向回研评智坊总首页
          {
            path: 'home',
            redirect: '/yanping'
          },
          // 1. 创建
          {
            path: 'create',
            name: 'FinanceCreate',
            // 替换为你复制过来的真实组件路径
            component: () => import('@/views/yanping/finance/financeEval/create/Create.vue'),
            meta: {
              title: '财务评价-创建',
              module: 'yanping',
              sidebar: 'yanping-finance',
              key: 'create'
            }
          },
          // 2. 项目
          {
            path: 'project',
            name: 'FinanceProject',
            // 替换为你复制过来的真实组件路径
            component: () => import('@/views/yanping/finance/financeEval/project/Project.vue'),
            meta: {
              title: '财务评价-项目',
              module: 'yanping',
              sidebar: 'yanping-finance',
              key: 'project'
            }
          },
          // 3. 草稿（保持原样占位）
          {
            path: 'draft',
            name: 'FinanceDraft',
            component: () => import('@/views/yanping/finance/DefaultProject.vue'),
            meta: {
              title: '财务评价-草稿',
              module: 'yanping',
              sidebar: 'yanping-finance',
              key: 'draft'
            }
          },
          {
            path: 'default-project',
            name: 'FinanceDefaultProject',
            component: () => import('@/views/yanping/finance/DefaultProject.vue'),
            meta: {
              title: '财务评价-项目',
              module: 'yanping',
              sidebar: 'yanping-finance',
              key: 'default-project'
            }
          },
          // ========== 下面是子页面（不在左侧菜单显示，但需保留防止 404） ==========
          // 项目预览
          {
            path: 'preview',
            name: 'FinancePreview',
            component: () => import('@/views/yanping/finance/financeEval/preview/FinancePreview.vue'),
            meta: {
              title: '财务评价-项目预览',
              module: 'yanping',
              sidebar: 'yanping-finance',
              key: 'project' // 强制左侧菜单高亮“项目”
            }
          }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 湖仓汇源
  // ─────────────────────────────────────────────
  {
    path: '/hucang',
    component: MainLayout,
    redirect: '/hucang/geology/list',
    children: [
      // ─────────────────────────────────────────
      // 地质
      // ─────────────────────────────────────────
      {
        path: 'geology',
        redirect: '/hucang/geology/list',
        children: [
          {
            path: 'list',
            name: 'HucangGeologyList',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geologyHome.vue'),
            meta: {
              title: '地质数据库',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          },
          {
            path: '/hucang/geology/import',
            name: 'GeologyDataImport',
            component: () =>
              import('@/views/hucang/commonDataManage/geologyData/geologyImport.vue'),
          },
          {
            path: '/geology/detail',
            name: 'HucangGeologyDetail',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geologyDetail.vue'),
            meta: {
              title: '地质数据库数据详情',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          },
          {
            path: 'edit',
            name: 'HucangGeologyEdit',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geologyEdit.vue'),
            meta: {
              title: '地质数据库数据管理',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          },
          {
            path: 'linkage',
            name: 'HucangGeologyLinkage',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geologyLinkage.vue'),
            meta: {
              title: '项目关联信息',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          },
          {
            path: 'map',
            name: 'HucangGeologyMap',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geologyMap.vue'),
            meta: {
              title: '地质数据管理',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          },
          {
            path: 'geography',
            name: 'HucangGeographyManage',
            component: () => import('@/views/hucang/commonDataManage/geologyData/geographyManage.vue'),
            meta: {
              title: '地形数据管理',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'geology'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 设备（先只接入风电设备，后续再扩展逆变器/光伏组件/电气设备）
      // ─────────────────────────────────────────
      {
        path: 'equipment',
        redirect: '/hucang/equipment/list',
        children: [
          {
            path: 'list',
            name: 'HucangEquipmentList',
            component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/WindPowerEquipmentList.vue'),
            meta: {
              title: '风电设备库',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'equipment'
            }
          },
          {
            path: 'detail',
            name: 'HucangEquipmentDetail',
            component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/detail/Detail.vue'),
            meta: {
              title: '设备详情',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'equipment'
            }
          },
          {
            path: 'add',
            name: 'HucangEquipmentAdd',
            component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/addWindDevice.vue'),
            meta: {
              title: '新增设备',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'equipment'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 电网
      // ─────────────────────────────────────────
      {
        path: 'grid',
        redirect: '/hucang/grid/list',
        children: [
          {
            path: 'list',
            name: 'HucangGridList',
            component: () => import('@/views/hucang/commonDataManage/currentPower/CurrentPower.vue'),
            meta: {
              title: '电网现状数据库',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'grid'
            }
          },
          {
            path: 'add',
            name: 'HucangGridAdd',
            component: () => import('@/views/hucang/commonDataManage/currentPower/AddCurrentPower.vue'),
            meta: {
              title: '电网现状数据管理',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'grid'
            }
          },
          {
            path: 'detail',
            name: 'HucangGridDetail',
            component: () => import('@/views/hucang/commonDataManage/currentPower/CurrentPowerDetail.vue'),
            meta: {
              title: '电网数据详情',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'grid'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 气候
      // ─────────────────────────────────────────
      {
        path: 'climate',
        redirect: '/hucang/climate/list',
        children: [
          {
            path: 'list',
            name: 'HucangClimateList',
            component: () => import('@/views/hucang/commonDataManage/climateDataBase/climateList.vue'),
            meta: {
              title: '气候数据库',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'climate'
            }
          },
          {
            path: 'edit',
            name: 'HucangClimateEdit',
            component: () => import('@/views/hucang/commonDataManage/climateDataBase/addClimate.vue'),
            meta: {
              title: '新增数据',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'climate'
            }
          },
          {
            path: 'detail',
            name: 'HucangClimateDetail',
            component: () => import('@/views/hucang/commonDataManage/climateDataBase/climateDetail.vue'),
            meta: {
              title: '数据详情',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'climate'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 价格
      // ─────────────────────────────────────────
      {
        path: 'price',
        redirect: '/hucang/price/list',
        children: [
          {
            path: 'list',
            name: 'HucangPriceList',
            component: () => import('@/views/hucang/commonDataManage/costLibrary/components/costLibraryList.vue'),
            meta: {
              title: '造价数据',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'price'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 测风塔
      // ─────────────────────────────────────────
      {
        path: 'windtower',
        redirect: '/hucang/windtower/list',
        children: [
          {
            path: 'list',
            name: 'HucangWindTowerList',
            component: () => import('@/views/hucang/commonDataManage/windTowerDatabase/windTowerList.vue'),
            meta: {
              title: '测风塔数据库列表',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'windtower'
            }
          },
          {
            path: 'detail',
            name: 'HucangWindTowerDetail',
            component: () => import('@/views/hucang/commonDataManage/windTowerDatabase/windTowerDetail.vue'),
            meta: {
              title: '测风塔数据库详情',
              module: 'hucang',
              sidebar: 'hucang',
              key: 'windtower'
            }
          }
        ]
      },

      // ─────────────────────────────────────────
      // 避让区域（占位页，待开发）
      // ─────────────────────────────────────────
      {
        path: 'avoidzone',
        name: 'HucangAvoidZone',
        component: () => import('@/views/hucang/ComingSoon.vue'),
        meta: {
          title: '避让区域',
          module: 'hucang',
          sidebar: 'hucang',
          key: 'avoidzone'
        }
      },

      // ─────────────────────────────────────────
      // 制度（占位页，待开发）
      // ─────────────────────────────────────────
      {
        path: 'rule',
        name: 'HucangRule',
        component: () => import('@/views/hucang/ComingSoon.vue'),
        meta: {
          title: '制度',
          module: 'hucang',
          sidebar: 'hucang',
          key: 'rule'
        }
      }
    ]
  },

   // ─────────────────────────────────────────────
  // 规制中枢
  // ─────────────────────────────────────────────
  {
    path: '/guizhi',
    component: MainLayout,
    redirect: '/guizhi/role',
    children: [
      {
        path: 'role',
        name: 'RoleManage',
        component: () => import('@/views/guizhi/RolePage.vue'),
        meta: {
          title: '角色管理',
          module: 'guizhi',
          sidebar: 'guizhi', // 👈 必须有这个，侧边栏才会显示
          key: 'role'         // 👈 必须有这个，侧边栏对应的菜单才会高亮
        }
      },
      // 如果你后续加了字典、企业介绍、日志，也要加上上面这两个 meta 字段
      {
        path: 'dict',
        name: 'DictManage',
        component: () => import('@/views/guizhi/DictPage.vue'),
        meta: {
          title: '字典管理',
          module: 'guizhi',
          sidebar: 'guizhi',
          key: 'dict'
        }
      },
      {
        path: 'company',
        name: 'CompanyIntro',
        component: () => import('@/views/guizhi/CompanyIntro.vue'),
        meta: {
          title: '企业介绍',
          module: 'guizhi',
          sidebar: 'guizhi',
          key: 'company'
        }
      },
      {
        path: 'log',
        name: 'LogManage',
        component: () => import('@/views/guizhi/LogPage.vue'),
        meta: {
          title: '日志管理',
          module: 'guizhi',
          sidebar: 'guizhi',
          key: 'log'
        }
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 404
  // ─────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面不存在',
      public: true
    }
  }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({
    top: 0
  })
})

// 全局路由守卫
router.beforeEach((to) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 新能源项目前期工作AI平台`
    : '新能源项目前期工作AI平台'

  const token = sessionStorage.getItem('accessToken')

  // 已登录用户再次访问登录页时，直接回到目标页面或默认首页。
  if (to.name === 'Login' && token) {
    const redirect = to.query.redirect
    const safeRedirect =
      typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//')
        ? redirect
        : '/overview'

    return safeRedirect
  }

  // 公开页面直接放行
  if (to.meta.public) {
    return true
  }

  if (!token) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  return true
})

export default router