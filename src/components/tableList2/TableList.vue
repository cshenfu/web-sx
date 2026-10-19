<template>
    <div class="table-list">
        <a-table
            :bordered="bordered"
            :loading="loading"
            :scroll="scrollData"
            ref="tableList"
            :dataSource="tableData"
            :columns="tableColumn"
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
                    <slot
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
        // margin-top: 16px;
    }
    .table-pagination {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }
</style>
