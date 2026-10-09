<template>
   <select-search
        show-search
        class="search-item-box"
        placeholder="代理名称"
        v-model:selectValue="agentId"
        :options="agentIdOptonins"
        :show-arrow="false"
        :filter-option="filterOption"
        :not-found-content="notFoundContent"
        @updateSearch="handleSearch"
        style="width: 220px;"
    ></select-search>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import SelectSearch from './SelectSearch.vue';
import {getAllAgentList} from '@/api/modules/agentManagement/agentList.js'
import { useDebounceFn } from '@vueuse/core'

const emits = defineEmits(['update:selectValue','updateSearchList']) 
const agentId = ref (null)
// 代理方列表
const agentIdOptonins = ref([])
const notFoundContent  = ref('')
// 远程搜索
const handleSearchAgentName = async () => {
    try {
        let res = await getAllAgentList()
        if(res.data && res.data.length > 0) {
            agentIdOptonins.value = res.data.map(item => {
                return {
                    label:item.name,
                    value:item.id
                }
            })
        }else {
            agentIdOptonins.value = []
            notFoundContent.value = '未找到相关代理方'

        }

    }catch(e) {
        console.log(e);
    }
        
}
const filterOption = (input,option)=> {
    const label = agentIdOptonins.value.find(item => item.value === option.value)?.label || ''
    return  label.toLowerCase().includes(input.toLowerCase());
}
const handleSearch = ()=> {
    emits('updateSearchList', {key:'agentId',value:agentId.value})
}
const clearSearch = ()=> {
    agentId.value = null
}
onBeforeMount(async() => {
    await handleSearchAgentName()
})
onMounted(() => {
})


defineExpose({
    clearSearch
})

</script>
<style scoped lang='less'>
</style>