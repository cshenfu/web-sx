<template>
        <SearchBar
            :searchKey="searchKey"
            @handleSearch="(e) => handleSearch(e)"
            @resetSearch="resetSearch"
        >
            <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
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
                <a-select
                    @dropdownVisibleChange="(e) => openDropDown(e, 'second')"
                    v-model:value="searchKey.projectStatus"
                    style="width: 140px; margin-right: 10px"
                    placeholder="全部状态"
                    allowClear
                >
                    <template #suffixIcon>
                        <iconpark-icon name="xiala" v-if="!isSelectOpen.second"></iconpark-icon>
                        <iconpark-icon
                            name="shouqi"
                            v-if="isSelectOpen.second"
                            :class="isSelectOpen.second ? 'green' : ''"
                        ></iconpark-icon>
                    </template>
                    <a-select-option
                        v-for="(item, index) in PROJECT_STATUS"
                        :value="item.value"
                        :key="item.value"
                        >{{ item.label }}</a-select-option
                    >
                </a-select>
                <div class="search-item">
                    <span class="search-label-self">本期容量</span>
                    <div
                        class="range-number-cont"
                        :class="isError ? 'error' : isActive ? 'active' : 'unActive'"
                    >
                        <div class="range-number-input">
                            <a-input-number
                                style="width: 100%; height: 34px"
                                @mouseover="mouseover"
                                @mouseout="mouseout"
                                @focus="(isActive = true), (isFocus = true)"
                                @blur="blur"
                                :controls="false"
                                placeholder="最小值"
                                :min="0"
                                v-model:value="searchKey.minCurrentProjectCapacity"
                            ></a-input-number>
                        </div>
                        <span class="custom-icon">~</span>
                        <div class="range-number-input">
                            <a-input-number
                                style="width: 100%; height: 34px"
                                @mouseover="mouseover"
                                @mouseout="mouseout"
                                @focus="(isActive = true), (isFocus = true)"
                                @blur="blur"
                                :controls="false"
                                placeholder="最大值"
                                v-model:value="searchKey.maxCurrentProjectCapacity"
                            ></a-input-number>
                        </div>
                    </div>
                </div>
                <div class="search-item">
                    <span class="search-label-self">创建时间</span>
                    <a-range-picker
                        inputReadOnly
                        class="custom-time-picker"
                        v-model:value="searchKey.dataTime"
                        :format="dateFormat"
                        :valueFormat="dateFormat"
                        show-time
                        allowClear
                    >
                        <template #suffixIcon>
                            <iconpark-icon name="riqi"></iconpark-icon>
                        </template>
                    </a-range-picker>
                </div>
                <div class="search-item">
                    <a-input
                        v-model:value="searchKey.projectName"
                        placeholder="项目名称"
                        style="width: 220px; text-align: center"
                        allowClear
                    >
                        <template #suffix>
                            <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                        </template>
                    </a-input>
                </div>
            </a-flex>
        </SearchBar>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import SearchBar from '@/components/searchBar/SearchBar.vue';
import useAreaDataStore from '@/pinia/modules/areaData';
import { PROJECT_STATUS} from '../project';
const emits = defineEmits(['search']);
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const isSelectOpen = ref({
    first: false,
    second: false,
});
const openDropDown = (open, type) => {
    isSelectOpen.value[type] = open;
};
const isActive = ref(false);
const isError = ref(false);
const isFocus = ref(false);
const mouseover = () => {
    isActive.value = true;
};
const mouseout = () => {
    isActive.value = isFocus.value;
};
const blur = () => {
    isActive.value = false;
    isFocus.value = false;
};
let areaDataStore = useAreaDataStore();
const areaCodeOptions = computed(() => {
    return areaDataStore.areaArr;
});
const searchKey = ref({
    areaCode: [],
    projectStatus: null,
    minCurrentProjectCapacity: '',
    maxCurrentProjectCapacity: '',
    dataTime: [],
    projectName: '',
});
// 搜索
const handleSearch = () => {
    emits('search', {searchKey:searchKey.value,page:1});
};
// 重置
const resetSearch = () => {
    for (const key in searchKey.value) {
        if (Object.hasOwnProperty.call(searchKey.value, key)) {
            searchKey.value[key] = null;
        }
    }
    searchKey.value.areaCode = [];
    searchKey.value.dataTime = [];
    emits('search', {searchKey:searchKey.value,page:1});
};
onBeforeMount(() => {
    emits('search', {searchKey:searchKey.value,page:1});
})
onMounted(() => {
})


</script>
<style scoped lang='scss'>
@import '../../project.scss';
.my-project-list-search {
    display: flex;
    align-items: flex-start;
}
</style>