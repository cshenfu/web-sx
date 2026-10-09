<template>
    <div class="geology-linkage-components">
        <div class="content-body">
            <a-row>
                <a-col :span="8">
                    <span>数据编号</span>
                    <p>{{ params?.geologyCode }}</p>
                </a-col>
                <a-col :span="8">
                    <span>所属区域</span>
                    <p>
                        {{ params?.provinceName }}
                        <template v-if="params?.cityName"> / {{ params?.cityName }} </template>
                        <template v-if="params?.districtName">
                            / {{ params?.districtName }}
                        </template>
                    </p>
                </a-col>
                <a-col :span="8">
                    <span>数据状态</span>
                    <p>
                        <template v-if="params?.source == 2">
                            <i v-if="params?.status" class="tag-i-success">
                                {{
                                    params?.status == 1
                                        ? '系统解析'
                                        : params?.status == 2
                                          ? '已核对'
                                          : params?.status == 3
                                            ? '解析错误'
                                            : ''
                                }}
                            </i>
                        </template>
                        <template v-else>
                            {{ params?.isDisable ? '已禁用' : '已开放' }}
                        </template>
                    </p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="8">
                    <span>数据来源</span>
                    <p>{{ params?.source == 1 ? '公共数据' : '用户数据' }}</p>
                </a-col>
                <a-col :span="8">
                    <span>关联项目数</span>
                    <p>{{ params?.progressNumber }}</p>
                </a-col>
            </a-row>
        </div>
        <TableList
            @changePage="tableLogChangePage"
            class="table-common table-account"
            :page="tablePageLog"
            :tableData="tableDataLog"
            :tableColumn="tableColumnLog"
        >
            <template #dataOwner="{ record }">
                {{ record?.dataOwner == 1 ? '是' : '否' }}
            </template>
        </TableList>
    </div>
</template>
<script setup>
    import { reactive, onMounted, ref } from 'vue';
    import TableList from '@/components/tableList/TableList.vue';
    // 关联信息
    const params = ref(null);
    onMounted(() => {
        if (sessionStorage.getItem('linkProgressInfo')) {
            params.value = JSON.parse(sessionStorage.getItem('linkProgressInfo'));
            console.log(params.value);
        }
    });

    // 表格表头
    const tableColumnLog = [
        {
            title: '关联时间',
            dataIndex: 'rleaTime',
        },
        {
            title: '关联项目编号',
            dataIndex: 'projectCode',
        },
        {
            title: '关联项目名称',
            dataIndex: 'projectName',
        },
        {
            title: '所属客户简称',
            dataIndex: 'customerName',
        },
        {
            title: '是否数据上传方',
            scopedSlots: 'dataOwner',
        },
    ];
    const tableDataLog = reactive([
        {
            rleaTime: '2023-09-09 20:00:00',
            projectCode: 'FD348395489',
            projectName: 'SDK市XXXX风电场工程',
            customerName: '大唐集团',
            dataOwner: 0,
        },
    ]);
    // 表格页码信息
    const tablePageLog = reactive({
        current: 1,
        size: 10,
        totalNum: 3,
    });
</script>
<style scoped lang="scss">
  @import '@/assets/css/detail.scss';
    .geology-linkage-components {
        background: #ffffff;
        padding: 24px;
        .tag-i-success {
            display: inline-block;
            width: 52px;
            height: 22px;
            background: #d9f2d0;
            border-radius: 2px;
            text-align: center;
            line-height: 22px;
            color: #50b72a;
            font-size: 12px;
        }
    }
</style>
