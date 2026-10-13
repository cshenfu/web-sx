<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <select-search
                class="search-item-box"
                placeholder="MW类别"
                v-model:selectValue="searchKey.deviceCapacity"
                :options="deviceCapacityData"
                @updateSearch="handleSearch"
            ></select-search>
            <select-search 
            class="search-item-box"
                placeholder="风机类型"
                v-model:selectValue="searchKey.deviceType"
                :options="[{
                    label: '直驱',
                    value: 1,
                },{
                    label: '双馈',
                    value: 2,
                },{
                    label: '中速永磁',
                    value: 3,
                },{
                    label: '半直驱',
                    value: 4,
                }]"
                @updateSearch="handleSearch"
            ></select-search>
            <a-input
                v-model:value="searchKey.deviceModel"
                placeholder="风机型号"
                class="site-input-right search-item-box"
                style="width: 240px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.deviceCode"
                placeholder="设备编号"
                class="site-input-right search-item-box"
                style="width: 240px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
        </a-flex>
    </SearchBar>
</template>
<script setup>
    import SearchBar from '@/components/searchBar/SearchBar.vue';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { reactive } from 'vue';
    const emit = defineEmits(['handleSearch', 'resetSearch']);
    const deviceCapacityData = [
        {
            label: '5MW以下',
            value: '0',
        },
        {
            label: '5',
            value: '5',
        },
        {
            label: '6',
            value: '6',
        },
        {
            label: '7',
            value: '7',
        },  
        {
            label: '8',
            value: '8',
        },
        {
            label: '9',
            value: '9',
        },
        {
            label: '10及以上',
            value: '10',
        },
    ];
    const searchKey = reactive({
        deviceCapacity: null,
        deviceType: null,
        deviceModel: '',
        deviceCode:''
    });
    // 搜索
    const handleSearch = () => {
        console.log(searchKey, 'searchKey');
        emit('handleSearch', searchKey);
    };
    // 重置
    const resetSearch = () => {
        for (const key in searchKey) {
            if (Object.hasOwnProperty.call(searchKey, key)) {
                searchKey[key] = null;
            }
        }
        emit('resetSearch', searchKey);
    };

    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
.search-item-box{
    margin-right: 12px;
    margin-bottom: 16px;
}
    .search-item {
        display: flex;
        justify-content: space-around;
        align-items: center;
        margin-right: 12px;
        &:last-child {
            margin-right: 0;
        }
        .search-label-self {
            flex: 0 0 auto;
            margin-right: 12px;
            font-size: 12px;
            color: #363b4d;
        }
    }
</style>
