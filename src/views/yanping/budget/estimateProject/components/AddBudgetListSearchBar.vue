<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <a-input
                allowClear
                v-model:value="searchKey.name"
                placeholder="名称"
                class="site-input-right search-item-box"
                style="width: 220px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.code"
                placeholder="编号"
                class="site-input-right search-item-box"
                style="width: 220px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
        </a-flex>
    </SearchBar>
</template>
<script setup>
    import SearchBar from '@/components/searchBar/SearchBar2.vue';
    import { getProvince } from '@/api/modules/public';
    import { ref, reactive, onBeforeMount } from 'vue';
    const props = defineProps({
        componentType: {
            type: String,
            default: 'wind',
        },
    });
    const provinceOptions = ref([]);
    const emit = defineEmits(['handleSearch', 'resetSearch']);
    const selectCompanyNameRef = ref(null);
    const searchKey = reactive({
        name: '',
        code: ''
    });
    // 搜索
    const handleSearch = (val) => {
        if (val) {
            searchKey[val.key] = val.value;
        }
        emit('handleSearch', searchKey);
    };
    // 重置
    const resetSearch = () => {
        for (const key in searchKey) {
            if (Object.hasOwnProperty.call(searchKey, key)) {
                searchKey[key] = null;
            }
        }
        selectCompanyNameRef.value && selectCompanyNameRef.value.clearSearch();
        emit('resetSearch', searchKey);
    };
    onBeforeMount(() => {
        getProvince().then((res) => {
            console.log(res);
            if (res.code == 200 && res.data.subList) {
                provinceOptions.value = res.data.subList || [];
            }
        });
    });
    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
    .search-item-box {
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
    :deep(.ant-input) {
        height: 24px !important;
    }
</style>
