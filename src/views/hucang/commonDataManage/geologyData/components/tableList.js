const GEOLOGY_TABLE_LIST_CLOUMN = [{
    title: '数据编号',
    dataIndex: 'geologyCode',
    width: 120,
    selfHeader:'selfName',
    fixed: 'left'
}, {
    title: '所属区域',
    width: 120,
    scopedSlots: 'provinceName'
}, {
    title: '关联项目编号',
    width: 120,
    dataIndex: 'relaProjectCodes'
}, {
    title: '数据状态',
    width: 120,
    scopedSlots: 'status'
},, {
    title: '地勘引用',
    width: 120,
    scopedSlots: 'geologicalSurveyCite'
},, {
    title: '地形引用',
    width: 120,
    scopedSlots: 'terrainCite'
},{
    title: '拐点坐标',
    width: 120,
    scopedSlots: 'isHaveLocationFile'
}, {
    title: '地勘报告附件',
    width: 120,
    scopedSlots: 'isHaveExplorationFile'
},{
    title: '地形图文件',
    width: 120,
    scopedSlots: 'isHaveTopographicFile'
}, {
    title: '粗糙度文件',
    width: 120,
    scopedSlots: 'isHaveRoughnessFile'
}, {
    title: '岩土层厚度/承载力特征值',
    width: 120,
    scopedSlots: 'isHaveGeologyRockSoils'
}, {
    title: '区域地质信息',
    width: 120,
    scopedSlots: 'isHaveRegionalGeologyInfo'
}, {
    title: '场区地质条件与评价',
    width: 120,
    scopedSlots: 'isHaveRegionalGeologyConditionEvaluation'
}, {
    title: '地震参数信息',
    width: 120,
    scopedSlots: 'isHaveSeismicInfo'
}, {
    title: '场地条件信息',
    width: 120,
    scopedSlots: 'isHaveRegionalHydrologyInfo'
}, {
    title: '结论与建议',
    width: 120,
    scopedSlots: 'isHaveConclusionEvaluation'
},  {
    title: '更新时间',
    width: 150,
    scopedSlots: 'updateTime'
}, {
    title: '操作',
    width: 120,
    scopedSlots: 'operation',
    fixed: 'right'
}]

export {
    GEOLOGY_TABLE_LIST_CLOUMN
}