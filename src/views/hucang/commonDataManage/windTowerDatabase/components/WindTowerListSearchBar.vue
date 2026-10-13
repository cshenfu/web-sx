<template>
     <div class="user-tabs">
        <ul class="user-tabs-ul">
            <li class="user-tabs-li" @click="chooseTabs(2)" :class="searchKey.source==2?'active':''">用户数据</li>
            <li class="user-tabs-li" @click="chooseTabs(1)" :class="searchKey.source==1?'active':''">公共数据</li>
        </ul>
    </div>
    <SearchBar
        :searchKey="searchKey"
        @handleSearch="handleSearch"
        @resetSearch="resetSearch"
        class="wind-tower-search"
    >
        <a-flex :vertical="false" wrap="wrap">
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
                v-model:selectValue="searchKey.rangeType"
                :options="rangeTypeOptions"
                @changeAreaData="changeAreaData"
            ></select-search>
            <a-cascader
                @dropdownVisibleChange="(e) => openDropDown(e, 'first')"
                v-model:value="searchKey.areaCode"
                style="width: 140px; margin-right: 10px; margin-bottom: 12px"
                placeholder="所属区域"
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
            <select-search
                class="search-item-box"
                placeholder="数据状态"
                v-model:selectValue="searchKey.analysisStatus"
                :options="analysisStatusOptons"
                @updateSearch="handleSearch"
            ></select-search>
            <a-input
                allowClear
                v-model:value="searchKey.windTowerCode"
                placeholder="数据编号"
                class="site-input-right search-item-box"
                style="width: 140px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.projectCode"
                placeholder="关联项目编号"
                class="site-input-right search-item-box"
                style="width: 140px; text-align: center"
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                allowClear
                v-model:value="searchKey.windTowerSeq"
                placeholder="测风塔号"
                class="site-input-right search-item-box"
                style="width: 140px; text-align: center"
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
    import { computed, reactive, ref,onMounted,watch, nextTick, onBeforeMount} from 'vue';
    import mitt from '@/utils/eventBus';
    import { getProvince } from '@/api/modules/public';
    import { USER_COMMON_DATA_STATUS,PUBLIC_COMMON_STATUS,filterAreaInfo} from '../../commonData'
        const emit = defineEmits(['getModeType']);
    const props = defineProps({
    });
    const areaCodeData = ref([]);
    const areaCodeOptions = ref([]);
    const searchKey = ref({
        source:1,
        modeType: 'b',
        areaCode: [],
        status: null,
        projectCode:'',
        windTowerCode:'',
        windTowerSeq:'',
    });
    const rangeTypeOptions = reactive([
        {
            label: '省数据',
            value: 1,
        },
        {
            label: '市数据',
            value: 2,
        },
        {
            label: '区数据',
            value: 3,
        },
    ]);
    // watch(

    // );
    const chooseTabs = (index) => {
        searchKey.value.source = index;
        mitt.emit('handleSearch', searchKey.value)
    }

    const analysisStatusOptons = computed(()=> {
        searchKey.value.analysisStatus = null
        return  searchKey.value.source === 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS
    })
    const defaultModeType = ref('a');
    // 搜索
    const handleSearch = () => {
        mitt.emit('handleSearch', searchKey.value)
    };
    // 重置
    const resetSearch = async() => {
        searchKey.value.areaCode = [];
        searchKey.value.status = null;
        searchKey.value.value5 = '';
        searchKey.value.modeType = defaultModeType.value;
        mitt.emit('resetSearch', searchKey.value);
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
        resetSearch()
    };
    const changeAreaData = (val) => {
        areaCodeOptions.value = filterAreaInfo(val, areaCodeData.value);
        // mitt.emit('getAreaInfo', val);
        searchKey.value.areaCode =[]
    };
    onBeforeMount(async()=> {
        try {
            const res = await getProvince();
            if(res.code === 200){
                areaCodeData.value = res.data?.subList;
                areaCodeOptions.value = filterAreaInfo(1, areaCodeData.value);
            }
        }catch (e) {
            console.log(e);
        }
        handleSearch()
    })
    defineExpose({
        searchKey,
    });
</script>
<style lang="scss" scoped>
@import '@/assets/css/tabs.scss';
    .wind-tower-search {
        margin-top: 16px;
        // padding-left: 24px;
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
