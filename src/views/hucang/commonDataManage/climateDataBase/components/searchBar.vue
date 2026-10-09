<template>
    <div class="user-tabs">
        <ul class="user-tabs-ul">
            <li class="user-tabs-li" v-for="item in PLAIN_OPTIONS" :key="item.value" @click="chooseTabs(item.value)" :class="searchKey.activeKey == item.value ? 'active' : ''">{{item.label}}</li>
            <!-- <li class="user-tabs-li" @click="chooseTabs(1)" :class="searchKey.activeKey == 1 ? 'active' : ''">雷暴</li>
            <li
                    class="user-tabs-li"
                    @click="chooseTabs(2)"
                    :class="activeKey == 2 ? 'active' : ''"
                    >覆冰</li
                >
            <li class="user-tabs-li" @click="chooseTabs(2)" :class="searchKey.activeKey == 2 ? 'active' : ''">酸雨</li>
            <li class="user-tabs-li" @click="chooseTabs(3)" :class="searchKey.activeKey == 3 ? 'active' : ''">温度</li>
            <li class="user-tabs-li" @click="chooseTabs(4)" :class="searchKey.activeKey == 4 ? 'active' : ''">风压</li>
            <li class="user-tabs-li" @click="chooseTabs(5)" :class="searchKey.activeKey == 5 ? 'active' : ''">雪压</li> -->
        </ul>
    </div>
    <div class="fixed-group">
        <!-- <a-button type="primary" ghost @click="importFile">
            <iconpark-icon name="daoru"></iconpark-icon>
            导入数据
        </a-button> -->
        <a-button type="primary" style="margin-left: 16px" @click="add">
            <iconpark-icon name="xinzeng"></iconpark-icon>
            新增数据
        </a-button>
    </div>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch" class="climate-search">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <!-- <a-radio-group v-model:value="searchKey.modeType" button-style="solid" @change="changeMode"
                class="type-active search-item-box">
                <a-radio-button value="a">
                    <div class="mode-list">
                        <iconpark-icon :name="searchKey.modeType == 'a' ? 'dituxuanzhong' : 'ditumoren'" size="13"
                            class="mode-icon"></iconpark-icon><span>地图模式</span>
                    </div>
                </a-radio-button>
                <a-radio-button value="b">
                    <div class="mode-list">
                        <iconpark-icon :name="searchKey.modeType == 'b' ? 'liebiaoxuanzhong' : 'liebiaomoren'" size="13"
                            class="mode-icon"></iconpark-icon><span>列表模式</span>
                    </div>
                </a-radio-button>
            </a-radio-group> -->
            <select-search :allowClear="true" class="search-item-box" placeholder="省市区"
                v-model:selectValue="searchKey.areaLevel" :options="rangeTypeOptions"
                @changeAreaData="changeAreaData"></select-search>
            <a-cascader 
                @dropdownVisibleChange="(e) => openDropDown(e, 'first')"  
                change-on-select
                v-model:value="searchKey.affiliationCode"
                style="width: 140px" 
                placeholder="所属区域" 
                allowClear 
                :fieldNames="{
                    label: 'regionName',
                    value: 'regionCode',
                    children: 'subList',
                }" 
                :options="areaCodeOptions" 
                @change="handleSearch()"
            >
                <template #suffixIcon>
                    <iconpark-icon name="xiala" v-if="!isSelectOpen.first"></iconpark-icon>
                    <iconpark-icon name="shouqi" v-if="isSelectOpen.first"
                        :class="isSelectOpen.first ? 'green' : ''"></iconpark-icon>
                </template>
            </a-cascader>

            <!-- <a-input v-model:value="searchKey.codeNo" placeholder="数据编号" class="site-input-right search-item-box"
                style="width: 240px; text-align: center" allowClear>
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input> -->
        </a-flex>
    </SearchBar>
</template>
<script setup>
import SearchBar from '@/components/searchBar/SearchBar';
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import { reactive, ref, onActivated, onBeforeUnmount, onDeactivated, onMounted, computed } from 'vue';
import { getProvince } from '@/api/modules/public';
import { USER_COMMON_DATA_STATUS, PUBLIC_COMMON_STATUS, filterAreaInfo, RANGE_TYPE_PROVINCE } from '../../commonData'
import {PLAIN_OPTIONS} from '../climateDataBase'
import mitt from '@/utils/eventBus';
const props = defineProps({
    modeType: {
        type: String,
        default: 'b',
    }
})
const emit = defineEmits(['getModeType', 'addEvent', 'importFileEvent','update:modeType']);
const searchKey = ref({
    activeKey: 1,
    modeType: 'b',
    areaLevel: 0,
    affiliationCode: [],
    codeNo: '',

});
const rangeTypeOptions = RANGE_TYPE_PROVINCE;
const areaCodeData = ref([]);
const areaCodeOptions = ref([]);
const defaultModeType = ref('b')
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const statusData = computed(() => {
    searchKey.value.status = null;
    return searchKey.value.source == 2 ? USER_COMMON_DATA_STATUS : PUBLIC_COMMON_STATUS;
});
// 标签切换
const chooseTabs = (index) => {
    searchKey.value.activeKey = index;
    handleSearch()
    
};
// 新增数据弹窗
const importFile =()=> {
    // openAddClimateTipsModal.value = true;
    emit('importFileEvent');
}
const add = () => {
    emit('addEvent', '新增数据');
};
// 搜索
const handleSearch = () => {
    mitt.emit('handleSearch', searchKey.value);
};
// 重置
const resetSearch = () => {
    searchKey.value.affiliationCode = [];
    searchKey.value.modeType = defaultModeType.value;
    mitt.emit('resetSearch', searchKey.value);
};
const changeMode = async(e) => {
    defaultModeType.value = e.target.value;
    emit('update:modeType', e.target.value);
    await mitt.all.clear()
    mitt.emit('handleSearch', searchKey.value)
};
const isSelectOpen = ref({
    first: false,
});
const openDropDown = (open, type) => {
    isSelectOpen.value[type] = open;
};
const changeAreaData = (val) => {
    areaCodeOptions.value = filterAreaInfo(val * 1, areaCodeData.value);
    searchKey.value.affiliationCode = []
    mitt.emit('handleSearch', searchKey.value)
};
onMounted(async () => {
    try {
        const res = await getProvince();
        if (res.code === 200) {
            areaCodeData.value = res.data?.subList;
            // areaCodeOptions.value = filterAreaInfo(1, areaCodeData.value);
            areaCodeOptions.value =res.data?.subList;
        }
    } catch (e) {
        console.log(e);
    }
    handleSearch()
})
onActivated(()=>{
    mitt.emit('handleSearch', searchKey.value)
})
defineExpose({
    searchKey,
});
</script>
<style lang="scss" scoped>
  @import '@/assets/css/fixedGroup.scss';
  @import '@/assets/css/tabs.scss';
.search-item-box {
    margin-right: 12px;
    // margin-bottom: 16px;
}
.climate-search {
    margin-top: 20px
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
