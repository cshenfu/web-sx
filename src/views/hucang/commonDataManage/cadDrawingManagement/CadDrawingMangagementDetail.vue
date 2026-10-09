<template>
    <div class="climate-detail-components">
        <h4 class="content-title">
            <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
            基本信息
        </h4>
        <div class="content-body">
            <a-row>
                <a-col :span="8" v-for="item in detailInfo['infoList']">
                    <span>{{ item['title'] }}</span>
                    <p>{{ item['data'] }}</p>
                </a-col>
            </a-row>
            <a-row v-for="item in detailInfo['fileList']">
                <a-col>
                    <span>{{ item['title'] }}</span>
                    <template v-if="item['type'] == 'file'">
                        <p v-for="fileItem in item['data']">
                            {{ fileItem['name'] }}
                            <a style="margin-left: 12px" href=""
                                >{{ fileItem['url']
                                }}<iconpark-icon name="fujian"></iconpark-icon>附件下载</a
                            >
                        </p>
                    </template>
                    <template v-else>
                        <p>
                            <span class="fileItemImage" v-for="fileItem in item['data']">
                                <a-image
                                    :src="fileItem['url']"
                                    style="margin-right: 12px"
                                    fallback="data:image/png;base64,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"
                                />
                            </span>
                        </p>
                    </template>
                </a-col>
            </a-row>
        </div>
        <div class="content-list">
            <h4 class="content-title">
                <!-- <img src="../../../assets/img/user/detail-title.png" alt="" /> -->
                主要操作日志
            </h4>
            <TableList @changePage="tableLogChangePage" class="table-common table-account" :page="tablePageLog"
                :tableData="tableDataLog" :tableColumn="DETAIL_LIST_CLOUMN">
                <template #attachments="record">
                    <span v-for="file in record['attachments']">{{ file['fileName'] }}</span>
                </template>
            </TableList>
        </div>
    </div>
</template>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
    .climate-detail-components {
        padding: 24px;
        background: #ffffff;
    }
</style>
<script setup>
    import { reactive, watch, ref } from 'vue';
    import {DETAIL_LIST_CLOUMN} from './cadDrawing'
    import { useRoute } from 'vue-router';
    import TableList from '@/components/tableList/TableList.vue';
    const route = useRoute();
    const type = ref(route.query.type);
    const cadDetail= {
        infoList: [
            {
                title: '图名称',
                data: 'WHHFHDJJF',
                fields: 'value1',
            },
            {
                title: '图编号',
                data: 'WHHFHDJJF',
                fields: 'value2',
            },
            {
                title: '图所属',
                data: 'WHHFHDJJF',
                fields: 'value3',
            },
            {
                title: '版本',
                data: 'WHHFHDJJF',
                fields: 'value4',
            },
            {
                title: '图类型',
                data: 'WHHFHDJJF',
                fields: 'value7',
            },
        ],
        fileList: [
            {
                title: '附件',
                type: 'file',
                fields: 'value10',
                data: [
                    {
                        name: '《基于信息扩散论的贵州》',
                        url: 'xxxx',
                    },
                    {
                        name: '《基于信息扩散论的贵州酸雨分析》',
                        url: 'xxxx',
                    },
                ],
            }
        ],
    }
    const detailInfo = cadDetail
// 操作日志表格表头
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
const tablePageLog = ref({
    pageNo: 1,
    size: 10,
    total: 0,
});
// 操作表格切换页码信息
const tableLogChangePage = (page, pageSize) => {
    console.log(page);
    console.log(pageSize);
};
</script>
