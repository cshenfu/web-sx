<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
        <select-search 
            :width="'180px'"
            class="search-item-box"  
            placeholder="计算节点" 
            v-model:selectValue="searchKey.node" 
            :options="computedNodeData"
            @updateSearch="handleSearch"
        >
        </select-search>
        <select-search 
            class="search-item-box"  
            placeholder="项目类型" 
            v-model:selectValue="searchKey.itemType" 
            :options="projectTypeData"
            @updateSearch="handleSearch"
            style="width: 180px;"
        >
        </select-search>
        <!-- <a-input
            allowClear
            v-model:value="searchKey.companyName"
            placeholder="客户名称"
            class="site-input-right search-item-box"
            style="width: 220px; text-align: center"
        >
        <template #suffix>
            <iconpark-icon name="sousuo" size="12"></iconpark-icon>
        </template>
        </a-input> -->
        <select-search-company-name 
            ref="selectCompanyNameRef"
            @updateSearchList="(val)=>handleSearch(val)"
        >
        </select-search-company-name>
        <a-input
            allowClear
            v-model:value="searchKey.projectName"
            placeholder="项目名称"
            class="site-input-right search-item-box"
            style="width: 220px; text-align: center"
        >
            <template #suffix>
                <iconpark-icon name="sousuo" size="12"></iconpark-icon>
            </template>
        </a-input>
        <a-input
            allowClear
            v-model:value="searchKey.projectCode"
            placeholder="项目编号"
            class="site-input-right search-item-box"
            style="width: 220px; text-align: center"
        >
            <template #suffix>
                <iconpark-icon name="sousuo" size="12"></iconpark-icon>
            </template>
        </a-input>
        <select-search 
            class="search-item-box"  
            placeholder="删除状态" 
            v-model:selectValue="searchKey.isShowDel" 
            :options="showDelData"
            @updateSearch="handleSearch"
            style="width: 180px;"
        >
        </select-search>
      </a-flex>
  </SearchBar>
</template>
<script setup>
import SearchBar from '@/components/searchBar/SearchBar'
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import SelectSearchCompanyName from '@/components/selectSearch/SelectSearchCompayName.vue';
import{WINDNODEDATA,LIGHTNODEDATA}  from '../projectList';
import {ALL_SERVICE_TYPE_OPTIONS} from '@/assets/js/static';
import { computed, onMounted } from 'vue';
import { ref,reactive } from 'vue'
const props = defineProps({
    componentType: {
        type: String,
        default: 'wind'
    }
})
const emit = defineEmits(['handleSearch','resetSearch'])
const computedNodeData = computed(()=>{
    return props.componentType=='wind'?WINDNODEDATA :LIGHTNODEDATA
})
const projectTypeData = [...ALL_SERVICE_TYPE_OPTIONS[0]['children'][0]['children']]
const showDelData = [
    {
        label:'未删除',
        value: 1,
    },
    {
        label:'已删除',
        value: 2,
    }
]
const selectCompanyNameRef = ref(null)
const searchKey = reactive({
    selectDraft: false,
    node: null,
    itemType:null,
    companyName:'',
    projectName:'',
    projectCode:'',
    isShowDel: null
});
// 搜索
const handleSearch = (val) => {
    if(val) {
        searchKey[val.key] = val.value
    }
    emit('handleSearch',searchKey)
}
// 重置
const resetSearch = () => {
    for (const key in searchKey) {
        if (Object.hasOwnProperty.call(searchKey, key)) {

            searchKey[key] = null;
        }
    }
    selectCompanyNameRef.value.clearSearch()
    emit('resetSearch',searchKey)
}
defineExpose({
    searchKey,
})
</script>
<style lang="scss" scoped>
.search-item-box{
    margin-right: 12px;
    margin-bottom: 16px;
}
  .search-item {
      display: flex;
      justify-content: space-around;
      align-items:center;
      margin-right: 12px;
      &:last-child {
          margin-right: 0;
      }
      .search-label-self {
          flex: 0 0 auto;
          margin-right: 12px;
          font-size: 12px;
          color: #363B4D;
      }
  }
</style>