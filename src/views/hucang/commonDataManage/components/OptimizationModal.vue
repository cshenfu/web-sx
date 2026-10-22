<template>
   <tips-modal tipType="success" class="tip-content-modal" okText="确认" :openTipsModal.sync="openTuningModal"
            @handleChangeFileModal="handleTuningFileModal" :width="'490px'">
            <template #customTitle>一键优化</template>
            <div class="tuning-tip">
                <iconpark-icon name="jinggao" size="22" class="success"></iconpark-icon>
                <span class="tuning-tip-title">当前项目 <b>资本金财务内部收益率</b> 为
                    {{ tuningTips?.nowYield }}%，根据系统预计算，最大的可调整值为
                    <i>{{ tuningTips?.minYield }}%~{{ tuningTips?.maxYield }}%</i>。
                </span>
            </div>
            <p class="tuning-tip-tips">如需个性化调整，可咨询平台客服</p>
            <a-form class="tuning-form" ref="tuningFormRef" :model="formState" :rules="rules">
                <a-form-item label="调整为" name="optimizeIncome">
                    <a-input-number style="width: 100%" :controls="false" autocomplete="off" placeholder="请输入"
                        v-model:value="formState.optimizeIncome" />
                    <i style="position: absolute; top: 5px; right: 10px">%</i>
                </a-form-item>
            </a-form>
        </tips-modal>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import TipsModal from './TipsModal.vue';
import { message, Modal } from 'ant-design-vue';
import {
    optimize,
    detaleProject,
    getYieldByProjectId,
    saveYieldByProjectId,
} from '@/api/modules/project1';
const emits = defineEmits(['updateList']);
// 一键优化参数变量
const tuningTips = ref(null);
let validateCheckAdjusting = async (_rule, value) => {
    if (!value && value !== 0) {
        return Promise.reject('请输入项目收益');
    } else {
        // 检查
        if (tuningTips.value) {
            if (
                Number(value) > tuningTips.value.maxYield ||
                Number(value) < tuningTips.value.minYield
            ) {
                return Promise.reject(
                    `收益率值需在${tuningTips.value.minYield}%~${tuningTips.value.maxYield}%范围内，请重新合理调整～`,
                );
            } else if (Number(value) == tuningTips.value.nowYield) {
                return Promise.reject('输入收益率值与原收益率值相同，请重新合理调整～');
            } else {
                return Promise.resolve();
            }
        } else {
            return Promise.resolve();
        }
    }
};
const chooseListDetil= ref({})
const openTuningModal = ref(false);
const tuningFormRef = ref(null);
const formState = reactive({
    optimizeIncome: '',
});
const rules = {
    optimizeIncome: [
        { required: true, max: 100, trigger: ['blur'], validator: validateCheckAdjusting },
    ],
};
// 获取项目一键优化收益范围值
const openTuningModalFn = (file) => {
    getTuningTips(file);
}
// 获取原始数据
const getTuningTips = (file)=> {
    getYieldByProjectId({ projectId: file.id }).then((res) => {
        if (res.code == 200) {
            tuningTips.value = res.data;
            chooseListDetil.value = file;
            openTuningModal.value = true;
        }
    });
}
// 校验数据并关闭
const handleTuningFileModal = (val) => {
    if (val) {
        tuningFormRef.value
            .validate()
            .then(async () => {
                let data = {
                    baseProjectId: chooseListDetil.value.id,
                    optimizeIncome: formState.optimizeIncome,
                };
                await saveYieldByProjectId(data).then((res) => {
                    if (res.code === 200) {
                        message.success('操作成功');
                        tuningFormRef.value.resetFields();
                        openTuningModal.value = false;
                        emits('updateList',val);
                    }
                });
            })
            .catch((error) => { });
    }
    if (!val) {
        tuningFormRef.value.resetFields();
        openTuningModal.value = false;
        emits('updateList',val);
    }
};
onBeforeMount(() => {
})
onMounted(() => {
})
defineExpose({
    openTuningModalFn
})
</script>
<style scoped lang='scss'>
@import "../project.scss"
</style>