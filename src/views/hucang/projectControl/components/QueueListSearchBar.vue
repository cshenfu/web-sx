<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
        <select-search 
            class="search-item-box"  
            placeholder="状态" 
            v-model:selectValue="searchKey.status" 
            :options="QUEUE_MANAGE_STATUS"
            @updateSearch="handleSearch"
            style="width: 180px;"
        >
        </select-search>
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
        <a-input
            allowClear
            v-model:value="searchKey.projectId"
            placeholder="项目ID"
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
import { ref,reactive,computed, onMounted } from 'vue';
import {QUEUE_MANAGE_STATUS} from '../projectList'
const props = defineProps({
})
const emit = defineEmits(['handleSearch','resetSearch'])
const selectCompanyNameRef = ref(null)
const searchKey = reactive({
    status:null,
    projectCode:'',
    projectId:'',
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