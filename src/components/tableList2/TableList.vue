<template>
    <div class="table-list">
        <a-table
            :bordered="bordered"
            :loading="loading"
            :scroll="scrollData"
            ref="tableList"
            :dataSource="tableData"
            :columns="normalizedColumns"
            :pagination="false"
            v-bind="$attrs"
            :customRow="rowClick"
            :style="{'width': props.width}"
        >
            <template #headerCell="{ column, title, record }">
                <!-- <template v-if="column.selfHeader">
                    <slot :name="column.selfHeader ? column.selfHeader : ''" v-bind="record"></slot>
                </template> -->
                <template v-if="column.selfHeader">
                    <template v-if="title.split('|').length > 1">
                    <p>{{ title.split('|')[0] }}</p>
                    <p style="margin-top: -8px">{{ title.split('|')[1] }}</p>
                    </template>
                </template>
            </template>
            <template #bodyCell="{ column, text, record, index }">
                <template v-if="column.scopedSlots">
                    <ActionOverflow v-if="isActionColumn(column)" class="operation-btn">
                        <slot
                            :name="column.scopedSlots"
                            v-bind="{ record, index }"
                        ></slot>
                    </ActionOverflow>
                    <slot
                        v-else
                        :name="column.scopedSlots"
                        v-bind="{ record, index }"
                    ></slot>
                </template>
            </template>
        </a-table>
        <div v-if="isShowPage && pageData.total > 0" class="table-pagination">
            <a-pagination
                v-model:current="pageData.pageNo"
                v-model:page-size="pageData.pageSize"
                v-model:total="pageData.total"
                show-size-changer
                :show-total="(total) => `共 ${total} 条`"
                @change="changePage"
            />
        </div>
    </div>
</template>

<script setup>
    import { ref, reactive, toRefs, onBeforeMount, onMounted, watch, computed } from 'vue';
    import ActionOverflow from '@/components/ActionOverflow.vue';
    const props = defineProps({
        loading: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: false
        },
        // 表格数据
        tableData: {
            type: Array,
            default: () => [],
        },
        // 表格列
        tableColumn: {
            type: Array,
        },
        // 是否展示分页
        isShowPage: {
            type: Boolean,
            default: true,
        },
        // 传入的分页参数
        page: {
            type: Object,
        },
        pageSizeOptions: {
            type: Array,
            default: () => ['10', '20', '50', '100'],
        },
        height: {
            type: Number,
            default: 540
        },
        width: {
            type: String,
            default: 'auto'
        }
    });
    const emit = defineEmits(['changePage', 'getRowData']);
    const pageData = ref({
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
    const scrollData = ref({ x: isNaN(parseInt(props.width)) ? 800 : false })
    //改变页码
    const changePage = (page, pageSize) => {
        emit('changePage', { page, pageSize });
    };
    const isActionColumn = (column = {}) => {
        const title = String(column.title || column.label || '').trim();
        const key = String(column.key || column.dataIndex || column.scopedSlots || '').toLowerCase();
        return title.includes('操作') || key === 'action' || key === 'actions' || key === 'operation';
    };
    const normalizedColumns = computed(() => (props.tableColumn || []).map((column) => {
        if (!isActionColumn(column)) return column;
        const width = Number.parseInt(column.width, 10) || 0;
        return { ...column, width: Math.max(width, 260) };
    }));
    const rowClick = (record, index) => {
        return {
            onclick: () => {
                emit('getRowData', record);
            },
        };
    };
    onMounted(() => {
        pageData.value = props.page;
        if (isNaN(parseInt(props.width))) {
            scrollData.value.y = props.height;
        }
    })
    watch(() => props.page, (nl) => {
        if (nl) {
            pageData.value = nl;
            if (pageData.value.current) {
                pageData.value.pageNo = nl.current;
            }
        }
    },{deep:true,immediate:true})
    watch(()=> props.tableData, (val)=>{
        console.log(val)
    })
</script>
<style scoped lang="scss">
    .table-list {
        width: 100%;
        min-width: 0;
    }

    .table-list :deep(.ant-table-wrapper) {
        overflow: hidden;
        border: 1px solid #e1e7ef;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.96);
    }

    .table-list :deep(.ant-table) {
        color: #304153;
        font-size: 14px;
        background: transparent;
    }

    .table-list :deep(.ant-table-thead > tr > th) {
        height: 40px;
        padding: 0 14px;
        color: #637285;
        font-size: 14px;
        font-weight: 600;
        background: #f2f5f9;
        border-bottom: 1px solid #e0e7ef;
    }

    .table-list :deep(.ant-table-tbody > tr > td) {
        height: 40px;
        padding: 0 14px;
        color: #304153;
        font-size: 14px;
        border-bottom: 1px solid #e8edf3;
    }

    .table-list :deep(.ant-table-tbody > tr:hover > td) {
        background: #f8fbff;
    }

    .table-pagination {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
    }
</style>
