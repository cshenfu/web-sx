<template>

     <div class="user-tabs">
        <div class="add-btn" @click="goPath"><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon> 新增文档</div>
    </div>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <select-search
                class="search-item-box"
                placeholder="适用项目类型"
                v-model:selectValue="searchKey.value1"
                :options="itemTypeData"
                @updateSearch="handleSearch"
            ></select-search>
            <select-search
                class="search-item-box"
                placeholder="标签"
                v-model:selectValue="searchKey.value2"
                :options="versionData"
                @updateSearch="handleSearch"
            ></select-search>
            <a-input
                v-model:value="searchKey.value3"
                placeholder="文档编号、文档名称"
                class="site-input-right search-item-box"
                style="width: 240px; text-align: center"
                allowClear
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
        </a-flex>
    </SearchBar>
</template>
<script setup>
    import SearchBar from '@/components/searchBar/SearchBar';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { computed, reactive, ref,onMounted,watch} from 'vue';
    import mitt from '@/utils/eventBus';
    import {useRouter} from 'vue-router';
    import { getProvince } from '@/api/modules/public';
    const emit = defineEmits(['getModeType']);
    const router = useRouter()
    const searchKey = reactive({
        value1: null,
        value2: null,
        value3: null,
    });
    const goPath = () => {
        router.push({
            path: '/design/add',
        })
    }
    const itemTypeData = [
    {
            value: '1',
            label: '风电-陆上1'
        },
        {
            value: '0',
            label: '风电-陆上0'
        },
    ]
    const versionData = [
        {
            value: '1',
            label: '1'
        },
        {
            value: '0',
            label: '0'
        },
    ]
    // 搜索
    const handleSearch = () => {
        mitt.emit('handleSearch', searchKey)
    };
    // 重置
    const resetSearch = async() => {
        for (const key in searchKey) {
            if (Object.hasOwnProperty.call(searchKey, key)) {
                searchKey[key] = null;
            }
        }
        mitt.emit('resetSearch', searchKey);
    };
    onMounted(async() => {
        handleSearch()
    });
    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
@import '@/assets/css/tabs.scss';
.user-tabs {
    margin-bottom: 12px
}
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
</style>
