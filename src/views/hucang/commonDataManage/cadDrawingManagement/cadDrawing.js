const CAD_TABLE_LIST_CLOUMN= [
    {
        title: '图编号', 
        width:120,
        dataIndex: 'value1',
    },
    {
        title: '图名称',
        width: 180,
        scopedSlots: 'value2',
    },
    {
        title: '所属模块',
        width: 140,
        scopedSlots: 'value3',
    },
    {
        title: '适用项目类型',
        width: 100,
        scopedSlots: 'value4',
    },
    {
        title: '版本',
        width: 100,
        scopedSlots: 'value5',
    },
   
    {
        title: '创建时间',
        width: 160,
        dataIndex: 'createTime',
    },
    {
        title: '操作',
        scopedSlots: 'operation',
        width:160,
        fixed: 'right',
    },
]
const DETAIL_LIST_CLOUMN = [{
        title: '更新时间',
        dataIndex: 'handleTime'
    }, 
    {
        title: '更新人',
        dataIndex: 'handleUser'
    }, {
        title: '版本',
        scopedSlots: 'handleType'
    }, {
        title: '源文件附件',
        dataIndex: 'handleCont'
    }, {
        title: 'PDF文件',
        dataIndex: 'remark'
    }
]

const USER_DETAIL_LOG = [{
    title: '操作时间',
    dataIndex: 'handleTime'
}, {
    title: '操作人',
    dataIndex: 'handleUser'
}, {
    title: '操作类型',
    scopedSlots: 'handleType'
}, {
    title: '操作内容',
    dataIndex: 'handleCont'
}, {
    title: '备注',
    dataIndex: 'remark'
}, {
    title: '附件',
    scopedSlots: 'attachments'
}]
export{
    CAD_TABLE_LIST_CLOUMN,
    USER_DETAIL_LOG,
    DETAIL_LIST_CLOUMN
}