<template>
    <div class="add-mc-content">
        <tips-modal :width="'900px'" :title="title" :tipType="'success'" :okText="'保存'" class="add-mc-modal"
            v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <a-form class="sort-form" ref="openFormRef" :model="formData" :labelCol="labelCol" :rules="getRules"
                    labelAlign="left">
                    <a-form-item label="所属分类" name="selectName" v-if="formData.selectName">
                        <span>{{ formData.selectName }}</span>
                    </a-form-item>
                    <a-form-item label="编号" name="code">
                        <span>{{ formData.code || formData.unitPriceCode }}</span>
                    </a-form-item>
                    <!-- 动态生成表单项 -->
                    <a-form-item :label="item.name" :name="item.dataIndex" v-for="item in formItems"
                        :key="item.dataIndex">
                        <component :is="item.type" v-model:value="formData[item.dataIndex]"
                            :placeholder="item.placeholder" :options="item.options || []" :min="item.min"
                            :precision="item.precision" :style="item.style || 'width: 50%'" />
                    </a-form-item>

                </a-form>
            </template>
        </tips-modal>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import TipsModal from '@/components/tipsDialog/TipsModal.vue';
import { ADD_CODE_OPTIONS, UNIT_OPTIONS } from '../budget'
import { useRoute } from 'vue-router';
const route = useRoute();
const props = defineProps({
    modifyPriceFlag: {
        type: Boolean,
        default: false,
    },
    formItems: {
        type: Array,
        required: true,
    },
    initialValues: {
        type: Object,
        default: () => ({}),
    },
    labelCol: {
        type: Object,
        default: () => ({ style: { width: '100px' } }),
    },

});
const emits = defineEmits(['update:modifyPriceFlag', 'getModifyPriceData']);

const title = ref('新增数据')
const openTipsImportFileModal = ref(props.modifyPriceFlag);
const openFormRef = ref(null);
// 表单数据
const formData = ref({ ...props.initialValues });
// 动态生成校验规则
const getRules = computed(() => {
    const rules = {
        selectName: [{ required: true, trigger: 'blur' }],
        code: [{ required: props.initialValues?.unitPriceCode ? false : true, trigger: 'blur' }],
    };
    props.formItems.forEach(item => {
        if (item.rules) {
            rules[item.dataIndex] = item.rules;
        }
    });
    return rules;
});

const handleChangeClose = async (val) => {
    if (val) {
        openFormRef.value.validateFields().then(() => {
            emits('getModifyPriceData', formData.value);
            emits('update:modifyPriceFlag', false);
            console.log('检验成功', formData);
        }).catch((error) => {
            console.log('错误', error);
        })

    } else {
        emits('update:modifyPriceFlag', false);
    }
};
watch([() => props.modifyPriceFlag], ([valFlg, oldFlg]) => {
    openTipsImportFileModal.value = valFlg;
});

onBeforeMount(() => {
    title.value = '编辑数据'
})
onMounted(() => {
})
watchEffect(() => {
})

</script>
<style scoped lang='scss'>
.add-mc-content {
    .sort-form {
        margin-top: 40px;
    }
}
</style>