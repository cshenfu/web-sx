<template>
    <SearchBar :searchKey="searchKey" @handleSearch="handleSearch" @resetSearch="resetSearch">
        <a-flex :vertical="false" wrap="wrap" class="my-project-list-search">
            <select-search
                class="search-item-box"
                placeholder="制造商"
                v-model:selectValue="searchKey.manufacturer"
                :options="manufacturerOptions"
                @updateSearch="handleSearch"
            ></select-search>
            <select-search
                class="search-item-box"
                placeholder="组件类型"
                v-model:selectValue="searchKey.inverterType"
                :options="inverterTypeOptions"
                @updateSearch="handleSearch"
            ></select-search>
            <select-search
                class="search-item-box"
                placeholder="设备容量"
                v-model:selectValue="searchKey.capacity"
                :options="equipmentCapacityOptions"
                @updateSearch="handleSearch"
            ></select-search>
            <a-input
                v-model:value="searchKey.model"
                placeholder="组件型号"
                class="site-input-right search-item-box"
                style="width: 240px; text-align: center"
                allowClear
            >
                <template #suffix>
                    <iconpark-icon name="sousuo" size="12"></iconpark-icon>
                </template>
            </a-input>
            <a-input
                v-model:value="searchKey.inverterCode"
                placeholder="设备编号"
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
    import SearchBar from '@/components/searchBar/SearchBar.vue';
    import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
    import { computed, reactive, ref,onMounted,onBeforeMount} from 'vue';
    import {useRouter} from 'vue-router';
    import{ getPvComponentCondition} from '@/api/modules/commonDataManage'
    const emit = defineEmits(['handleSearch']);
    const router = useRouter()
    // 类型
    const inverterTypeOptions = ref([])
    // 制造商
    const manufacturerOptions = ref([]);
    // 设备容量
    const equipmentCapacityOptions = ref([])
    const searchKey = ref({
        manufacturer: null,
        inverterType:null,
        capacity: null,
        model:'',
        inverterCode:''
    });
    // 搜索
    const handleSearch = () => {
        emit('handleSearch', searchKey.value)
    };
    // 重置
    const resetSearch = async() => {
        for (const key in searchKey.value) {
            if (Object.hasOwnProperty.call(searchKey.value, key)) {
                searchKey.value[key] = null;
            }
        }
        emit('handleSearch', searchKey.value);
    };
        // 获取所有的查询条件
        const getAllSearchData = async()=>{        
        try {
            let res = await getPvComponentCondition()
            if(res.code ==200 && res.data){
                for (const key in res.data.pvModuleDeviceEnum) {
                    inverterTypeOptions.value.push({
                            'value': key, 
                            'label': res.data.pvModuleDeviceEnum[key]
                        });
                }
                manufacturerOptions.value = res.data.manufacturer.map((item)=> {
                    return {
                        'label':item,
                        'value':item
                    }
                })
                equipmentCapacityOptions.value = res.data.capacity.map((item)=> {
                    return {
                        'label':item,
                        'value':item
                    }
                })
            }
        } catch (error) {
            console.log('error',error);
            
        }
    }
    onBeforeMount(async()=>{
        await getAllSearchData()
    })
    onMounted(async() => {
        handleSearch()
    });
    defineExpose({
        searchKey,
    })
</script>
<style lang="scss" scoped>

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
