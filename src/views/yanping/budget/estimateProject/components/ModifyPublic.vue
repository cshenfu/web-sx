<template>
    <div class="add-mc-content">
        <tips-modal :width="'700px'" :title="title" :tipType="'success'" :okText="'保存'" class="add-mc-modal"
            v-model:openTipsModal="openTipsImportFileModal" @handleChangeFileModal="handleChangeClose">
            <template #contentBody>
                <a-form class="sort-form" ref="openFormRef" :model="formData" :labelCol="labelCol" :rules="getRules"
                    labelAlign="left">
                    <!-- 动态生成表单项 -->
                    <a-form-item :label="item.name" :name="item.dataIndex" v-for="item in formItems"
                        :key="item.dataIndex">
                        <component :is="item.type"  v-model:value="formData[item.dataIndex]"
                            :placeholder="item.placeholder" :options="item.options || []" :min="item.min"
                            :precision="item.precision" :style="item.style || 'width: 50%'" ></component>
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
    modifyPublicFlag: {
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
    title:{
        type:String,
        default:'新增数据'
    }

});
const emits = defineEmits(['update:modifyPublicFlag','getModifyPublicData']);
const openTipsImportFileModal = ref(props.modifyPublicFlag);
const openFormRef = ref(null);
// 表单数据
const formData = ref({ ...props.initialValues });
// 动态生成校验规则
const getRules = computed(() => {
    const rules = {
        selectPricetName: [{ required: true, trigger: 'blur' }],
        code: [{ required: true, trigger: 'blur' }],
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
            emits('getModifyPublicData',formData.value)
            emits('update:modifyPublicFlag', false);
        }).catch((error) => {
            console.log('错误', error);
        })
    } else {
        emits('update:modifyPublicFlag', false);
    }
};
watch([() => props.modifyPublicFlag], ([valFlg, oldFlg]) => {
    openTipsImportFileModal.value = valFlg;
});

onBeforeMount(() => {
})
onMounted(() => {
})
watchEffect(() => {
})

</script>
<style scoped lang='scss'>
.add-mc-content {
    .sort-form{
        margin-top: 40px;
    }
}
</style>