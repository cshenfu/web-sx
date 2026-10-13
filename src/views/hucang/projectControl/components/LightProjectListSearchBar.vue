<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
        <select-search 
            class="search-item-box"  
            placeholder="计算节点" 
            v-model:selectValue="searchKey.node" 
            style="width: 240px;"
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
      </a-flex>
  </SearchBar>
</template>
<script setup>
import SearchBar from '@/components/searchBar/SearchBar'
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import SelectSearchCompanyName from '@/components/selectSearch/SelectSearchCompayName.vue';
import { ref,reactive } from 'vue';
import {ALL_SERVICE_TYPE_OPTIONS} from '@/assets/js/static';
const emit = defineEmits(['handleSearch','resetSearch'])
const computedNodeData = [
    {
        label: '地址数据解析',
        value: '1',
    },
    {
        label: '数据库气候数据解析',
        value: '2',
    },
    {
        label: '中尺度solargis数据解析',
        value: '3',
    },
    {
        label: '中尺度Meteonorm和NASA数据解析',
        value: '4',
    },
    {
        label: '发电量计算',
        value: '5',
    },
    {
        label: '升压站选址',
        value: '6',
    },
    {
        label: '道路线路设计',
        value: '7',
    },
    {
        label: '发电量计算',
        value: '8',
    },    
    {
        label: '道路自动设计',
        value: '9',
    },
    {
        label: '土建基础设计',
        value: '10',
    },    

    {
        label: '技术经济智能概算',
        value: '12',
    },
    {
        label: '财务智能评价',
        value: '13',
    },
    {
        label: '文档生成',
        value: '15',
    }
]
const projectTypeData = [...ALL_SERVICE_TYPE_OPTIONS[0]['children'][1]['children']]
const selectCompanyNameRef = ref(null)
const searchKey = reactive({
    node: null,
    itemType:null,
    companyName:'',
    projectName:''
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