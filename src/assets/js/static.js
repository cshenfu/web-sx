console.log(process.env.NODE_ENV, '当前环境');
const fileIconList = {
    ppt: 'ppt',
    pdf: 'pdf',
    txt: 'txt',
    docx: 'doc',
    doc: 'doc',
    xls: 'exc',
    xlsx: 'exc',
    zip: 'txt',
    rar: 'txt',
};
const operationCenterData = [
    {
        title: '账号管理',
        icon: 'zhanghaoguanli',
        key: 'user',
        children: [
            {
                title: '账号列表',
                url: '/user/list',
                key: 'userList',
            },
            {
                title: '服务列表',
                url: '/package/list',
                key: 'packageList',
            },
            // {
            //   title: '光御服务列表',
            //   url: '/package/light/list',
            //   key: 'packageLightList',
            // },
            // {
            //   title: '气象服务列表',
            //   url: '/package/meteorological/list',
            //   key: 'meteorologicalServiceList',
            // },
            {
                title: '加密管理',
                url: '/encrypt/list',
                key: 'encryptList',
            },
        ],
    },
    {
        title: '天机项目',
        icon: 'fengdian-fe869311',
        key: 'project',
        children: [
            {
                title: '风电项目列表',
                url: '/projectContro/list',
                key: 'projectList',
            },
            {
                title: '风电待审核列表',
                url: '/projectControl/pendingList',
                key: 'pendingReviewList',
            },
            {
                title: '风电队列管理',
                url: '/projectControl/queue',
                key: 'queueManagment',
            },
            {
                title: '光伏项目列表',
                url: '/projectControl/light/list',
                key: 'lightProjectControList',
            },
        ],
    },
    {
        title: '天同项目',
        icon: 'fenxi',
        key: 'tianTongProject',
        children: [
            {
                title: '风电工具项目',
                url: '/tt/windUntils/list',
                key: 'windUntilsProject',
            },
        ],
    },
    // {
    //   title: '光伏项目',
    //   icon: 'guangfu-fe86931c',
    //   key: 'lightProject',
    //   children: [
    //     {
    //       title: '项目列表',
    //       url: '/projectControl/light/list',
    //       key: 'lightProjectControList',
    //     },
    //   ],
    // },
    {
        title: '线索管理',
        icon: 'xiansuoguanli',
        key: 'clue',
        children: [
            {
                title: '线索列表',
                url: '/clue/list',
                key: 'cluetList',
            },
        ],
    },
    {
        title: '代理管理',
        icon: 'dailiguanli',
        key: 'agentManagement',
        children: [
            {
                title: '代理列表',
                url: '/agent/list',
                key: 'agentList',
            },
        ],
    },
    {
        title: '辅助工具',
        icon: 'gongju',
        key: 'toolsManagement',
        children: [
            {
                title: '添加水印',
                url: '/tools',
                key: 'addWatermark',
            },
            {
                title: '暂停运行',
                url: '/tools/controlWithInRangeDate',
                key: 'controlWithInRangeDate',
            },
        ],
    },
    // {
    //   title: '数据报表',
    //     icon: 'shujubaobiao',
    //     children: [
    //     {
    //     title: '客户项目统计',
    //     url: '',
    //     headerKey:'operationCenterData'
    //     },
    //     ],
    // },
];
const dataServiceData = [
    {
        title: '项目模版管理',
        icon: 'xiangmumobanguanli',
        key: 'projectTemplateManage',
        children: [
            {
                title: '项目模板',
                url: '/template',
                key: 'projectTemplate',
            },
            // {
            //   title: '类型管理',
            //   url: '/typeList',
            //   key: 'typeManage',
            // },
            {
                title: '参数管理',
                url: '/argumentList',
                key: 'argumentManage',
            },
            {
                title: '标签管理',
                url: '/tagList',
                key: 'tagManage',
            },
        ],
    },

    {
        title: '地质数据',
        icon: 'dizhi',
        key: 'geologicalManage',
        children: [
            {
                title: '地质数据库',
                url: '/geology',
                key: 'geologicalData',
                headerKey: 'dataServiceData',
            },
            {
                title: '环评数据库',
                url: '/environment',
                key: 'environmentData',
                headerKey: 'dataServiceData',
            },
            {
                title: '水保数据库',
                url: '/waterConservayion',
                key: 'waterConservayionData',
                headerKey: 'dataServiceData',
            },
        ],
    },
    {
        title: '设备数据',
        icon: 'shebei',
        key: 'equipmentManage',
        children: [
            {
                title: '风电设备库',
                url: '/windEquipment',
                key: 'windTurbineData',
                headerKey: 'dataServiceData',
            },
            {
                title: '逆变器设备库',
                url: '/inverter',
                key: 'inverterList',
                headerKey: 'dataServiceData',
            },
            {
                title: '光伏组件设备库',
                url: '/photovoltaic',
                key: 'photovoltaicList',
                headerKey: 'dataServiceData',
            },
        ],
    },
    {
        title: '气象数据',
        icon: 'qixiang',
        key: 'meteorologicalData',
        children: [
            {
                title: '测风塔数据库',
                url: '/windTower/list',
                key: 'windTowerData',
                headerKey: 'dataServiceData',
            },
            {
                title: '气候数据库',
                url: '/climate',
                key: 'climateData',
                headerKey: 'dataServiceData',
            },
            {
                title: '太阳能资源数据',
                url: '/sourceData/sloarList',
                key: 'solarEnergyResourceData',
                headerKey: 'dataServiceData',
            },
        ],
    },
    {
        title: '电网数据',
        icon: 'dianwang',
        key: 'gridCurrentManage',
        children: [
            {
                title: '电网现状及规划',
                url: '/currentPower',
                key: 'gridCurrentData',
                headerKey: 'dataServiceData',
            },
            // {
            //   title: '数据接入管理',
            //   icon: 'shujujieruguanli',
            //   key: 'dataAccessManage',
            //   children: [
            //     {
            //       title: '数据接入列表',
            //       url: '',
            //       key: 'dataAccessList',
            //     },
            //   ],
            // },
        ],
    },
    {
        title: '造价数据',
        icon: 'zaojiashuju',
        key: 'costLibrary',
        children: [
            {
                title: '基本数据',
                url: '/costLibrary',
                key: 'costBasicData',
                headerKey: 'dataServiceData',
            },
        ],
    },
    {
        title: '概算管理',
        icon: 'gaisuanguanli',
        key: 'budgetManagement',
        children: [
            {
                title: '风电定额',
                url: '/windQuota',
                key: 'windPowerQuota',
                headerKey: 'dataServiceData',
            },
            {
                title: '概算项目',
                url: '/estimateProject',
                key: 'estimateProject',
                headerKey: 'dataServiceData',
            },
        ],
    },
    // {
    //   title: '通用数据管理',
    //     icon: 'tongyongshujuguanli',
    //     key: 'commonDataManage',
    //     children: [
    //       {
    //         title: '电气设备库',
    //         url: '/electricalEquipment',
    //         key: 'electricalData',
    //         headerKey:'dataServiceData'
    //       },
    //       {
    //         title: 'CAD制图资源',
    //         url: '/cadDrawwing',
    //         key: 'cadDrawingData',
    //         headerKey:'dataServiceData'
    //       },
    //       {
    //         title: '设计标准规范管理',
    //         url: '/design',
    //         key: 'designData',
    //         headerKey:'dataServiceData'
    //       },
    //       {
    //         title: '项目造价库',
    //         url: '/costLibrary',
    //         key: 'costLibrary',
    //         headerKey:'dataServiceData'
    //       },
    //       {
    //         title: '中尺度数据库',
    //         url: '/mediumScale',
    //         key: 'mediumScaleData',
    //         headerKey:'dataServiceData'
    //       },

    //     ],
    // },
];
const systemSettingsData = [
    {
        title: '组织管理',
        icon: 'zuzhiguanli',
        key: 'organization',
        children: [
            {
                title: '人员管理',
                url: '/staffManage',
                key: 'staffManageList',
                headerKey: 'systemSettingsData',
            },
            {
                title: '部门管理',
                url: '/departmentManage',
                key: 'departmentManage',
                headerKey: 'systemSettingsData',
            },
            {
                title: '角色管理',
                url: '/roleManage',
                key: 'roleManage',
                headerKey: 'systemSettingsData',
            },
        ],
    },
    {
        title: '日志管理',
        icon: 'rizhiguanli',
        key: 'logManage',
        children: [
            {
                title: '用户端',
                url: '/log/user',
                key: 'userLog',
                headerKey: 'systemSettingsData',
            },
        ],
    },
];
const headMenuData = [
    {
        key: 'operationCenterData',
        name: '运营中心',
        icon: 'yunyingzhongxinmoren',
        path: operationCenterData[0]['children'][0]['url'],
        activeIcoin: 'yunyingzhongxinxuanzhong',
    },
    {
        key: 'dataServiceData',
        name: '数据服务',
        icon: 'shujufuwumoren',
        path: dataServiceData[0]['children'][0]['url'],
        activeIcoin: 'shujufuwuxuanzhong',
    },
    {
        key: 'systemSettingsData',
        name: '系统设置',
        icon: 'xitongshezhimoren',
        path: systemSettingsData[0]['children'][0]['url'],
        activeIcoin: 'xitongshezhixuanzhong',
    },
];
const menumData = {
    operationCenterData,
    dataServiceData,
    systemSettingsData,
};
// 天地图Key
const tdKey = '429657aadca28e2e467243852a0b388d';
console.log(process.env.NODE_ENV, '----环境');

// 阿里云--地址
const ossClientInfo = {
    region: 'oss-cn-beijing',
    bucketname: process.env.NODE_ENV == 'production' ? 'whln-prod-public' : 'whln-test-public',
    privateBucketname:
        process.env.NODE_ENV == 'production' ? 'whln-prod-public' : 'whln-test-public',
    endPointShort: 'oss-cn-beijing.aliyuncs.com',
};
// 所有的套餐服务
const ALL_SERVICE_TYPE_OPTIONS = [
    {
        label: '天机平台',
        value: 'tianJiPlatform',
        children: [
            {
                label: '风范 AI',
                value: 'wind',
                children: [
                    { value: 1, label: '一键风电可研（集中式）' },
                    { value: 4, label: '一键风电可研（分散式）' },
                    { value: 5, label: '一键风电可研（基地项目）' },
                    { value: 2, label: 'AI找风资源' },
                    { value: 3, label: '风电项目建议书' },
                ],
            },
            {
                label: '光御 AI',
                value: 'light',
                children: [
                    { value: 10, label: '一键光伏可研' },
                    { value: 11, label: '光伏项目建议书' },
                ],
            },
        ],
    },
    {
        label: '天同平台',
        value: 'tiantongPlatform',
        children: [
            {
                label: '风电工具',
                value: 'windUntils',
                children: [{ value: 101, label: '测风塔分析' },{ value: 102, label: '技经概算' },{ value: 105, label: '财务评价' }],
            },
            {
                label: '气象精灵',
                value: 'weather',
                children: [
                    // { value: 120000, label: 'ERA5数据下载' },
                    { value: 120, label: '气象精灵数据下载' },
                ],
            },
        ],
    },
];
// 模板地址源
const templatePath = {
    'geologyRegion': 'https://whln-prod-public.oss-cn-beijing.aliyuncs.com/template/%E5%9C%BA%E5%8C%BA%E5%9D%90%E6%A0%87%E6%A8%A1%E6%9D%BF.xlsx'
}
// pdfview插件配置文件
const pdfViewConfigurationPath = `https://whln-prod-public.${ossClientInfo.endPointShort}/configuration/viewer.properties`;
export {
    fileIconList,
    menumData,
    headMenuData,
    tdKey,
    ALL_SERVICE_TYPE_OPTIONS,
    pdfViewConfigurationPath,
    ossClientInfo,
    templatePath
};
