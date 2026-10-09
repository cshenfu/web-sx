<template>
     <div class="user-tabs">
        <div class="add-btn" @click="goPath"><iconpark-icon name="xinzeng" size="12" class="add-icon"></iconpark-icon> 新增数据</div>
    </div>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <!-- <a-radio-group
                v-model:value="searchKey.modeType"
                button-style="solid"
                @change="changeMode"
                class="type-active search-item-box"
            >
                <a-radio-button value="a">
                    <div class="mode-list">
                        <iconpark-icon
                            :name="searchKey.modeType == 'a' ? 'dituxuanzhong' : 'ditumoren'"
                            size="13"
                            class="mode-icon"
                        ></iconpark-icon
                        ><span>地图模式</span>
                    </div>
                </a-radio-button>
                <a-radio-button value="b">
                    <div class="mode-list">
                        <iconpark-icon
                            :name="searchKey.modeType == 'b' ? 'liebiaoxuanzhong' : 'liebiaomoren'"
                            size="13"
                            class="mode-icon"
                        ></iconpark-icon
                        ><span>列表模式</span>
                    </div>
                </a-radio-button>
            </a-radio-group> -->
            <select-search
                :allowClear="false"
                class="search-item-box"
                placeholder="省市区"
                v-model:selectValue="searchKey.areaLevel"
                :options="rangeTypeOptions"
                @changeAreaData="changeAreaData"
            ></select-search>
            <a-cascader
                @dropdownVisibleChange="(e) => openDropDown(e, 'first')"
                v-model:value="searchKey.affiliationCode"
                style="width: 140px; margin-right: 10px; margin-bottom: 12px"
                placeholder="所属区域"
                change-on-select
                allowClear
                :fieldNames="{
                    label: 'regionName',
                    value: 'regionCode',
                    children: 'subList',
                }"
                :options="areaCodeOptions"
                @change="handleSearch"
            >
                <template #suffixIcon>
                    <iconpark-icon name="xiala" v-if="!isSelectOpen.first"></iconpark-icon>
                    <iconpark-icon
                        name="shouqi"
                        v-if="isSelectOpen.first"
                        :class="isSelectOpen.first ? 'green' : ''"
                    ></iconpark-icon>
                </template>
            </a-cascader>
        </a-flex>
    </SearchBar>
</template>
<script setup>
    import SearchBar from '@/components/searchBar/SearchBar';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { computed, reactive, ref,onMounted,watch} from 'vue';
    import mitt from '@/utils/eventBus';
    import {useRouter} from 'vue-router';
    import { USER_COMMON_DATA_STATUS,PUBLIC_COMMON_STATUS,filterAreaInfo,RANGE_TYPE_PROVINCE} from '../../../commonData'
    import { getProvince } from '@/api/modules/public';
    const emit = defineEmits(['getModeType']);
    const router = useRouter()
    const rangeTypeOptions = RANGE_TYPE_PROVINCE.filter(item => item.value !== 0);
    const areaCodeData = ref([]);
    const areaCodeOptions = ref([]);
    const searchKey = reactive({
        modeType: 'b',
        areaLevel: 1,
        affiliationCode:[],
    });
    const defaultModeType = ref('b');
    const goPath = () => {
        router.push({
            path: '/sourceData/sloarAdd',
        })
    }
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
        searchKey.modeType = defaultModeType.value;
        mitt.emit('resetSearch', searchKey);
    };
    const isSelectOpen = ref({
        first: false,
    });
    const openDropDown = (open, type) => {
        isSelectOpen.value[type] = open;
    };
    const changeMode = async(e) => {
        defaultModeType.value = e.target.value;
        emit('getModeType', e.target.value);
        await mitt.all.clear()
        mitt.emit('handleSearch', searchKey)
    };
    const changeAreaData = (val) => {
        areaCodeOptions.value = filterAreaInfo(val, areaCodeData.value);
        // mitt.emit('getAreaInfo', val);
        searchKey.affiliationCode =[]
        mitt.emit('handleSearch', searchKey)
    };
    onMounted(async() => {
        try {
            const res = await getProvince();
            if(res.code === 200){
                areaCodeData.value = res.data?.subList;
                areaCodeOptions.value = filterAreaInfo(0, areaCodeData.value);
            }
        }catch (e) {
            console.log(e);
        }
        handleSearch()
    });
    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
//@use '@/assets/css/tabs.scss';
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
