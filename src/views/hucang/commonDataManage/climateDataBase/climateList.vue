<template>
    <div class="climate-list-content">
        <div class="climate-content">
            <searchBar ref="climateListRef" v-model:modeType="modeType" @getModeType="getModeType" @addEvent="showAddModal"@useFileEvent="showImportFileModal"></searchBar>
            <climateMap v-if="modeType =='a'"></climateMap>
            <List  v-if="modeType =='b'"></List>
        </div>
    </div>
    <!-- 导入数据 -->
    <import-climate-file v-model:importFileFlg="openAddClimateTipsModal"></import-climate-file>
    <!-- 新增 -->
    <tips-modal
        :width="'490px'"
        :tipType="'success'"
        class="tip-content-modal"
        okText="确定"
        :openTipsModal.sync="openTipsOpenModal"
        @handleChangeFileModal="handleChangeOpenModal"
    >
        <template #customTitle>{{ tipTitle }}</template>
        <template #contentBody>
            <div class="tuning-tip">
                <!-- <iconpark-icon name="jinggao" size="18" class="success"></iconpark-icon>
                <span class="tuning-tip-title">{{ contentTip }}</span> -->
            </div>
            <a-form
                :colon="false"
                class="sort-form"
                ref="openFormRef"
                :model="openFormData"
                labelAlign="left"
            >
                <a-form-item
                    label="数据类型"
                    name="type"
                    :rules="[
                        { required: true, ElMessage: '请输入要新增的数据类型', trigger: 'blur' },
                    ]"
                >
                    <!-- <a-radio-group v-model:value="openFormData.type" name="radioGroup">
                        <a-radio :value="1">雷暴</a-radio>
                        <a-radio value="2">覆冰</a-radio>
                        <a-radio :value="2">酸雨</a-radio>
                        <a-radio :value="3">温度</a-radio>
                        <a-radio :value="4">风压</a-radio>
                    </a-radio-group> -->
                    <a-radio-group v-model:value="openFormData.type" :options="PLAIN_OPTIONS" name="radioGroup" />
                </a-form-item>
            </a-form>
        </template>
    </tips-modal>
</template>

<script setup>
    import List from './components/allList.vue';
    import searchBar from './components/searchBar.vue';
    import climateMap from './climateMap.vue';
    import { ref, reactive,onBeforeMount, onMounted,onUnmounted, computed, watch, nextTick } from 'vue';
    import { useRouter } from 'vue-router';
    import TipsModal from '@/components/tipsDialog/TipsModal.vue';
    import { trigger } from '@vue/reactivity';
    import ImportClimateFile from './components/ImportClimateFile.vue';
    import {PLAIN_OPTIONS} from './climateDataBase'
    const modeType = ref('');
    const climateListRef = ref(null)
    onMounted(()=> {
        modeType.value = climateListRef.value.searchKey.modeType
    })
    // 获取模式
    const getModeType=(val)=> {
        // modeType.value = val;
    }
    const router = useRouter();
    // 新增导入
    const openAddClimateTipsModal = ref(false);
    // 关闭导入数据
    const handleChangeAddClimateModal = (val) => {
        console.log('关闭新增', val);
    };
    // 显示导入弹窗
    const showImportFileModal = () => {
        openAddClimateTipsModal.value = true;
    }

    // 新增操作
    const openFormRef = ref(null);
    let tipTitle = ref('');
    let openTipsOpenModal = ref(false);
    let openFormData = reactive({
        type: '1',
    });
    // 显示新增弹窗
    const showAddModal = (title) => {
        tipTitle.value = title;
        openTipsOpenModal.value = true;
    }
    const handleChangeOpenModal = (value) => {
        if (value) {
            router.push({
                path: '/climate/edit',
                query: {
                    type: openFormData.type,
                },
            });
        } 
        openFormRef.value.resetFields();
        openTipsOpenModal.value = false;
    };

    onBeforeMount(() => {
        sessionStorage.setItem('obsPath','climate/')
    });
    onUnmounted(() => {
        sessionStorage.removeItem('obsPath')
    })
</script>
<style scoped lang="scss">
  @import '@/assets/css/fixedGroup.scss';
  @import '@/assets/css/tabs.scss';
    .climate-list-content {
        padding: 24px;
        background: #ffffff;
        max-height: calc(100vh - 100px);
        overflow: auto;
    }
    .climate-content{
        // padding: 24px 0;
    }
    
</style>
