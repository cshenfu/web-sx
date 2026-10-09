<template>
   <select-search
        show-search
        class="search-item-box"
        placeholder="客户名称"
        v-model:selectValue="companyName"
        :options="companyNameOptonins"
        :show-arrow="false"
        :filter-option="true"
        :not-found-content="notFoundContent"
        @search="handleSearchCompanyName"
        @updateSearch="handleSearch"
        @blur="restCompanyNameOptoninsFn"
        style="width: 220px;"
    ></select-search>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import SelectSearch from './SelectSearch.vue';
import  {getCompanyLikeSearch} from '@/api/modules/user'
import { useDebounceFn } from '@vueuse/core'

const emits = defineEmits(['update:selectValue','updateSearchList']) 
const companyName = ref (null)
// 用户列表
const companyNameOptonins = ref([])
const notFoundContent  = ref('')
const handleSearchCompanyName = useDebounceFn(async(val) => {
        if(!val) {
            notFoundContent.value = ''
            companyNameOptonins.value = []
            return
        }
        console.log('search',val);
        let data  = {
            companyName:val,
        }
        try {
            let res = await getCompanyLikeSearch(data)
            if(res.data && res.data.length > 0) {
                let result = res.data.map(item => {
                    return {
                        label:item.companyName,
                        value:item.companyName
                    }
                })
                // 使用reduce去掉相同的value的数据
                companyNameOptonins.value = result.reduce((pre,cur) => {
                    if(!pre.some(item => item.value === cur.value)) {
                        pre.push(cur)
                    }
                    return pre
                },[])
            }else {
                companyNameOptonins.value = []
                notFoundContent.value = '未找到相关客户'

            }

        }catch(e) {
            console.log(e);
        }
            
    }, 300)
const restCompanyNameOptoninsFn = ()=> {
    companyNameOptonins.value = []
}
const handleSearch = ()=> {
    if(!companyName.value){
        companyNameOptonins.value = []
    }
    emits('updateSearchList', {key:'companyName',value:companyName.value})
}
const clearSearch = ()=> {
    companyName.value = null
}
onBeforeMount(() => {
})
onMounted(() => {
})


defineExpose({
    clearSearch
})

</script>
<style scoped lang='less'>
</style>