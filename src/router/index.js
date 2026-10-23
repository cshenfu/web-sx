import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layout/MainLayout.vue'

// 路由表
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', public: true }
  },

  // ─────────────────────────────────────────────
  // 秦川智筹
  // ─────────────────────────────────────────────
  {
    path: '/',
    component: MainLayout,
    redirect: '/overview',
    children: [
      { path: 'overview', name: 'Overview', component: () => import('@/views/qinchuan/Overview.vue'), meta: { title: '项目总览', module: 'qinchuan', sidebar: 'qinchuan', key: 'overview' } },
      { path: 'site', name: 'SiteSelect', component: () => import('@/views/qinchuan/SiteSelect.vue'), meta: { title: '智能选址', module: 'qinchuan', sidebar: 'qinchuan', key: 'site' } },
      { path: 'reserve', name: 'Reserve', component: () => import('@/views/qinchuan/Reserve.vue'), meta: { title: '项目储备', module: 'qinchuan', sidebar: 'qinchuan', key: 'reserve' } },
      { path: 'approval', name: 'Approval', component: () => import('@/views/qinchuan/Approval.vue'), meta: { title: '立项阶段', module: 'qinchuan', sidebar: 'qinchuan', key: 'approval' } },
      { path: 'research', name: 'Research', component: () => import('@/views/qinchuan/Research.vue'), meta: { title: '可研阶段', module: 'qinchuan', sidebar: 'qinchuan', key: 'research' } },
      { path: 'decision', name: 'Decision', component: () => import('@/views/qinchuan/Decision.vue'), meta: { title: '投资决策', module: 'qinchuan', sidebar: 'qinchuan', key: 'decision' } },
      { path: 'compute', name: 'Compute', component: () => import('@/views/qinchuan/Compute.vue'), meta: { title: '计算队列', module: 'qinchuan', sidebar: 'qinchuan', key: 'compute' } }
    ]
  },

  // ─────────────────────────────────────────────
  // 研评智坊
  // ─────────────────────────────────────────────
  {
    path: '/yanping',
    component: MainLayout,
    children: [
      { path: '', name: 'YanpingIndex', component: () => import('@/views/yanping/Index.vue'), meta: { title: '研评智坊', module: 'yanping' } },
      {
        path: 'review',
        redirect: '/yanping/review/project',
        children: [
          { path: 'create', name: 'ReviewCreate', component: () => import('@/views/yanping/review/Create.vue'), meta: { title: '智能评审-创建', module: 'yanping', sidebar: 'yanping-review', key: 'create' } },
          { path: 'project', name: 'ReviewProject', component: () => import('@/views/yanping/review/Project.vue'), meta: { title: '智能评审-项目', module: 'yanping', sidebar: 'yanping-review', key: 'project' } },
          { path: 'draft', name: 'ReviewDraft', component: () => import('@/views/yanping/review/DefaultProject.vue'), meta: { title: '智能评审-草稿', module: 'yanping', sidebar: 'yanping-review', key: 'draft' } },
          { path: 'default-project', name: 'ReviewDefaultProject', component: () => import('@/views/yanping/review/DefaultProject.vue'), meta: { title: '智能评审-项目', module: 'yanping', sidebar: 'yanping-review', key: 'default-project' } }
        ]
      },
      {
        path: 'budget',
        redirect: '/yanping/budget/project',
        children: [
          { path: 'home', redirect: '/yanping' },
          { path: 'create', name: 'BudgetCreate', component: () => import('@/views/yanping/budget/estimateProject/estimateList/estimateTemplateList.vue'), meta: { title: '技经概算-创建', module: 'yanping', sidebar: 'yanping-budget', key: 'create' } },
          { path: 'project', name: 'BudgetProject', component: () => import('@/views/yanping/budget/estimateProject/estimateList/estimateList.vue'), meta: { title: '技经概算-项目', module: 'yanping', sidebar: 'yanping-budget', key: 'project' } },
          { path: 'draft', name: 'BudgetDraft', component: () => import('@/views/yanping/budget/DefaultProject.vue'), meta: { title: '技经概算-草稿', module: 'yanping', sidebar: 'yanping-budget', key: 'draft' } },
          { path: 'default-project', name: 'BudgetDefaultProject', component: () => import('@/views/yanping/budget/DefaultProject.vue'), meta: { title: '技经概算-项目', module: 'yanping', sidebar: 'yanping-budget', key: 'default-project' } },
          { path: 'newTemplatePreview', name: 'BudgetNewTemplatePreview', component: () => import('@/views/yanping/budget/estimateProject/templatePreview/NewTemplatePreview.vue'), meta: { title: '新项目预览', module: 'yanping', sidebar: 'yanping-budget', key: 'project' } },
          { path: 'set', name: 'BudgetSet', component: () => import('@/views/yanping/budget/estimateProject/estimateList/index2.vue'), meta: { title: '模版设置', module: 'yanping', sidebar: 'yanping-budget', key: 'project' } }
        ]
      },
      {
        path: 'finance',
        redirect: '/yanping/finance/project',
        children: [
          { path: 'home', redirect: '/yanping' },
          { path: 'create', name: 'FinanceCreate', component: () => import('@/views/yanping/finance/financeEval/create/Create.vue'), meta: { title: '财务评价-创建', module: 'yanping', sidebar: 'yanping-finance', key: 'create' } },
          { path: 'project', name: 'FinanceProject', component: () => import('@/views/yanping/finance/financeEval/project/Project.vue'), meta: { title: '财务评价-项目', module: 'yanping', sidebar: 'yanping-finance', key: 'project' } },
          { path: 'draft', name: 'FinanceDraft', component: () => import('@/views/yanping/finance/DefaultProject.vue'), meta: { title: '财务评价-草稿', module: 'yanping', sidebar: 'yanping-finance', key: 'draft' } },
          { path: 'default-project', name: 'FinanceDefaultProject', component: () => import('@/views/yanping/finance/DefaultProject.vue'), meta: { title: '财务评价-项目', module: 'yanping', sidebar: 'yanping-finance', key: 'default-project' } },
          { path: 'preview', name: 'FinancePreview', component: () => import('@/views/yanping/finance/financeEval/preview/FinancePreview.vue'), meta: { title: '财务评价-项目预览', module: 'yanping', sidebar: 'yanping-finance', key: 'project' } }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // 湖仓汇源 (地址采用 hucang，文件全部对应 commonDataManage)
  // ─────────────────────────────────────────────
  {
    path: '/hucang',
    component: MainLayout,
    redirect: '/hucang/weather/list',
    children: [
      // 1. 气象
      {
        path: 'weather',
        redirect: '/hucang/weather/list',
        children: [
          { path: 'list', name: 'HucangWeatherList', component: () => import('@/views/hucang/commonDataManage/weatherData/index.vue'), meta: { title: '气象数据库', module: 'hucang', sidebar: 'hucang', key: 'weather' } }
        ]
      },

      // 2. 气候 (对应旧项目 /climate/list)
      {
        path: 'climate',
        redirect: '/hucang/climate/list',
        children: [
          { path: 'list', name: 'HucangClimateList', component: () => import('@/views/hucang/commonDataManage/climateDataBase/climateList.vue'), meta: { title: '气候数据库', module: 'hucang', sidebar: 'hucang', key: 'climate' } },
          { path: 'edit', name: 'HucangClimateEdit', component: () => import('@/views/hucang/commonDataManage/climateDataBase/addClimate.vue'), meta: { title: '新增数据', module: 'hucang', sidebar: 'hucang', key: 'climate' } },
          { path: 'detail', name: 'HucangClimateDetail', component: () => import('@/views/hucang/commonDataManage/climateDataBase/climateDetail.vue'), meta: { title: '数据详情', module: 'hucang', sidebar: 'hucang', key: 'climate' } }
        ]
      },

      // 3. 测风塔 (对应旧项目 /windTower/list)
      {
        path: 'windTower',
        redirect: '/hucang/windTower/list',
        children: [
          { path: 'list', name: 'HucangWindTowerList', component: () => import('@/views/hucang/commonDataManage/windTowerDatabase/windTowerList.vue'), meta: { title: '测风塔数据库列表', module: 'hucang', sidebar: 'hucang', key: 'windTower' } },
          { path: 'detail', name: 'HucangWindTowerDetail', component: () => import('@/views/hucang/commonDataManage/windTowerDatabase/windTowerDetail.vue'), meta: { title: '测风塔数据库详情', module: 'hucang', sidebar: 'hucang', key: 'windTower' } }
        ]
      },

      // 4. 地质 (对应旧项目 /geology/...)
      {
        path: 'geology',
        redirect: '/hucang/geology/list',
        children: [
          { path: 'list', name: 'HucangGeologyList', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyHome.vue'), meta: { title: '地质数据库', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'geography', name: 'HucangGeographyManage', component: () => import('@/views/hucang/commonDataManage/geologyData/geographyManage.vue'), meta: { title: '地形数据', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'import', name: 'GeologyDataImport', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyImport.vue'), meta: { title: '地质数据导入', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'detail', name: 'HucangGeologyDetail', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyDetail.vue'), meta: { title: '地质数据库数据详情', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'edit', name: 'HucangGeologyEdit', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyEdit.vue'), meta: { title: '地质数据库数据管理', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'linkage', name: 'HucangGeologyLinkage', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyLinkage.vue'), meta: { title: '项目关联信息', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } },
          { path: 'map', name: 'HucangGeologyMap', component: () => import('@/views/hucang/commonDataManage/geologyData/geologyMap.vue'), meta: { title: '地质数据管理', module: 'hucang', sidebar: 'hucang', key: 'geology-list' } }
        ]
      },

      // 5. 环评 (对应旧项目 /environment/...)
      {
        path: 'environment',
        redirect: '/hucang/environment/list',
        children: [
          { path: 'list', name: 'HucangEnvironmentList', component: () => import('@/views/hucang/commonDataManage/environmentalDatabase/EnvironmentDatabase.vue'), meta: { title: '环评数据库管理', module: 'hucang', sidebar: 'hucang', key: 'environment-list' } },
          { path: 'add', name: 'HucangEnvironmentAdd', component: () => import('@/views/hucang/commonDataManage/environmentalDatabase/AddEnvironment.vue'), meta: { title: '新增环评数据', module: 'hucang', sidebar: 'hucang', key: 'environment-list' } },
          { path: 'detail', name: 'HucangEnvironmentDetail', component: () => import('@/views/hucang/commonDataManage/environmentalDatabase/EnvironmentDetail.vue'), meta: { title: '环评数据详情', module: 'hucang', sidebar: 'hucang', key: 'environment-list' } }
        ]
      },

      // 6. 水保 (对应旧项目 /waterConservayion/...)
      {
        path: 'waterConservayion',
        redirect: '/hucang/waterConservayion/list',
        children: [
          { path: 'list', name: 'HucangWaterList', component: () => import('@/views/hucang/commonDataManage/waterConservationDatabase/WaterConservation.vue'), meta: { title: '水保数据库列表', module: 'hucang', sidebar: 'hucang', key: 'water-list' } },
          { path: 'add', name: 'HucangWaterAdd', component: () => import('@/views/hucang/commonDataManage/waterConservationDatabase/AddWaterConservation.vue'), meta: { title: '水保数据库新增', module: 'hucang', sidebar: 'hucang', key: 'water-list' } },
          { path: 'detail', name: 'HucangWaterDetail', component: () => import('@/views/hucang/commonDataManage/waterConservationDatabase/WaterConservationDetail.vue'), meta: { title: '水保数据库详情', module: 'hucang', sidebar: 'hucang', key: 'water-list' } }
        ]
      },

      // 7. 避让区域
      {
        path: 'avoidzone',
        name: 'HucangAvoidZone',
        component: () => import('@/views/hucang/ComingSoon.vue'),
        meta: { title: '避让区域', module: 'hucang', sidebar: 'hucang', key: 'avoidzone' }
      },

      // 8. 电网 (对应旧项目 /currentPower/...)
      {
        path: 'currentPower',
        redirect: '/hucang/currentPower/list',
        children: [
          { path: 'list', name: 'HucangGridList', component: () => import('@/views/hucang/commonDataManage/currentPower/CurrentPower.vue'), meta: { title: '电网现状数据库', module: 'hucang', sidebar: 'hucang', key: 'currentPower' } },
          { path: 'add', name: 'HucangGridAdd', component: () => import('@/views/hucang/commonDataManage/currentPower/AddCurrentPower.vue'), meta: { title: '电网现状数据管理', module: 'hucang', sidebar: 'hucang', key: 'currentPower' } },
          { path: 'detail', name: 'HucangGridDetail', component: () => import('@/views/hucang/commonDataManage/currentPower/CurrentPowerDetail.vue'), meta: { title: '电网数据详情', module: 'hucang', sidebar: 'hucang', key: 'currentPower' } }
        ]
      },

      // 9. 风电设备 (对应旧项目 /windEquipment/...)
      {
        path: 'windEquipment',
        redirect: '/hucang/windEquipment/list',
        children: [
          { path: 'list', name: 'HucangEquipmentList', component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/WindPowerEquipmentList.vue'), meta: { title: '风电设备库', module: 'hucang', sidebar: 'hucang', key: 'equipment-wind' } },
          { path: 'detail', name: 'HucangEquipmentDetail', component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/detail/Detail.vue'), meta: { title: '设备详情', module: 'hucang', sidebar: 'hucang', key: 'equipment-wind' } },
          { path: 'add', name: 'HucangEquipmentAdd', component: () => import('@/views/hucang/commonDataManage/windPowerEquipment/addWindDevice.vue'), meta: { title: '新增设备', module: 'hucang', sidebar: 'hucang', key: 'equipment-wind' } }
        ]
      },

      // 10. 光伏组件 (对应旧项目 /photovoltaic/...)
      {
        path: 'photovoltaic',
        redirect: '/hucang/photovoltaic/list',
        children: [
          { path: 'list', name: 'HucangPhotovoltaicList', component: () => import('@/views/hucang/commonDataManage/photovoltaicEquipmentManage/photovoltaicEquipmentList.vue'), meta: { title: '光伏组件设备库', module: 'hucang', sidebar: 'hucang', key: 'equipment-pv' } },
          { path: 'detail', name: 'HucangPhotovoltaicDetail', component: () => import('@/views/hucang/commonDataManage/photovoltaicEquipmentManage/photovoltaicDetail.vue'), meta: { title: '光伏组件设备库详情', module: 'hucang', sidebar: 'hucang', key: 'equipment-pv' } }
        ]
      },

      // 11. 逆变器 (对应旧项目 /inverter/...)
      {
        path: 'inverter',
        redirect: '/hucang/inverter/list',
        children: [
          { path: 'list', name: 'HucangInverterList', component: () => import('@/views/hucang/commonDataManage/inverterManage/inverterList.vue'), meta: { title: '逆变器设备库', module: 'hucang', sidebar: 'hucang', key: 'equipment-inverter' } },
          { path: 'detail', name: 'HucangInverterDetail', component: () => import('@/views/hucang/commonDataManage/inverterManage/inverterDetail.vue'), meta: { title: '逆变器设备详情', module: 'hucang', sidebar: 'hucang', key: 'equipment-inverter' } }
        ]
      },

      // 12. 造价 (对应旧项目 /costLibrary/...)
      {
        path: 'costLibrary',
        redirect: '/hucang/costLibrary/list',
        children: [
          { path: 'list', name: 'HucangCostList', component: () => import('@/views/hucang/commonDataManage/costLibrary/components/costLibraryList.vue'), meta: { title: '造价数据', module: 'hucang', sidebar: 'hucang', key: 'costLibrary' } }
        ]
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
      { path: 'role', name: 'RoleManage', component: () => import('@/views/guizhi/RolePage.vue'), meta: { title: '角色管理', module: 'guizhi', sidebar: 'guizhi', key: 'role' } },
      { path: 'dict', name: 'DictManage', component: () => import('@/views/guizhi/DictPage.vue'), meta: { title: '字典管理', module: 'guizhi', sidebar: 'guizhi', key: 'dict' } },
      { path: 'company', name: 'CompanyIntro', component: () => import('@/views/guizhi/CompanyIntro.vue'), meta: { title: '企业介绍', module: 'guizhi', sidebar: 'guizhi', key: 'company' } },
      { path: 'log', name: 'LogManage', component: () => import('@/views/guizhi/LogPage.vue'), meta: { title: '日志管理', module: 'guizhi', sidebar: 'guizhi', key: 'log' } }
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在', public: true }
  }
]

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// 全局路由守卫
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 新能源项目前期工作AI平台` : '新能源项目前期工作AI平台'
  const token = sessionStorage.getItem('accessToken')
  if (to.name === 'Login' && token) {
    const redirect = to.query.redirect
    const safeRedirect = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/overview'
    return safeRedirect
  }
  if (to.meta.public) return true
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router