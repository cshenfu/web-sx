<template>
    <div class="mediumScale-list-template">
        <searchBar ref="searchBarRef" @addDevice="addDevice"></searchBar>
        <table-list
            class="mediumScale-table"
            :loading="loading"
            :tableData="dataSource"
            :tableColumn="thArr"
            :page="page"
            @getRowData="getRowData"
            @changePage="changePage"
        >
            <template #updateTime="{ record }">
                {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template #operation="{ record }">
                <div class="operation-btn">
                    <span class="operation-btn-item" @click.stop="edit(record)">编辑</span>
                    <span class="operation-btn-item" @click.stop="del(record)"
                        >删除</span
                    >
                </div>
            </template>
        </table-list>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
    import searchBar from './searchBar.vue';
    import TableList from '@/components/tableList/TableList.vue';
    import { ELECTRICAL_TABLE_LIST_CLOUMN } from './cloumn';
    import { useRouter } from 'vue-router';
    import dayjs from 'dayjs';
    const searchBarRef = ref();
    const dataSource = ref([{
        geologyCode: '2ks3483',
        progressNumber: '花式电箱'
    }]);
    const thArr = ref(ELECTRICAL_TABLE_LIST_CLOUMN);
    const loading = ref(false);
    const router = useRouter();
    const page = ref({
        current: 1,
        size: 10,
        total: 0,
    });
    // 点击行获取数据
    const getRowData = (val) => {
        // 跳转到详情页面
        router.push({
            path: '/mediumScale/detail',
            query: {
                id: 12,
                source: searchBarRef.value.searchInfo.source
            }
        })
    }
    // 切换页码
    const changePage = (val) => {
        page.value.current = val.page;
        page.value.size = val.pageSize;
    }
    // 新增设备
    const addDevice = () => {
        router.push({
            path: '/mediumScale/edit'
        })
    }
    // 编辑
    const edit = (row) => {
        router.push({
            path: '/mediumScale/edit'
        })
    }
    // 删除
    const del = (row) => {
        console.log('删除');
    }
</script>
<style scoped lang="scss">
.mediumScale-list-template{
    background-color: #fff;
    padding: 20px;
}
</style>
