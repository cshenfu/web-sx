<template>
    <div class="project-log-component">
        <TableList @changePage="tableLogChangePage" class="table-common table-account" :page="tablePageLog"
            :tableData="tableDataLog" :tableColumn="tableColumnLog">
            <template #handleType="record">
                <span>{{ handleTypeData[record['handleType']] }}</span>
            </template>
            <template #attachments="record">
                <span v-for="file in record['attachments']">{{ file['fileName'] }}</span>
            </template>
        </TableList>
    </div>
</template>
<script setup>
import { reactive } from 'vue';
import TableList from '@/components/tableList/TableList.vue';
import { PROJECT_DETAIL_LOG } from '../inverter.js';
// 操作日志表格表头
const tableColumnLog = PROJECT_DETAIL_LOG;
const tableDataLog = reactive([
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '账号状态【正常】-->【停用】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '账号状态【正常】-->【停用】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
    {
        handleTime: '2020-09-09 18:00:00',
        handleUser: '张开',
        handleType: 1,
        handleCont: '新增服务【按次付费，20次，2023-09-09~2024-01-01】',
        remark: '这是一个备注信息',
        attachments: [
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
            {
                fileName: '文件名称',
                fileUrl: '文件链接',
            },
        ],
    },
]);
// 操作日志表格页码信息
const tablePageLog = reactive({
    current: 1,
    size: 10,
    totalNum: 3,
});
// 操作表格切换页码信息
const tableLogChangePage = (page, pageSize) => {
    tablePageLog.current = page;
    tablePageLog.size = pageSize;
    console.log(page);
    console.log(pageSize);
};
</script>