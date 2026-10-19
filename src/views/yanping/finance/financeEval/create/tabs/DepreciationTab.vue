<!--
  折旧设置 Tab
  路径: src/pages/financeEval/create/tabs/DepreciationTab.vue
-->
<template>
  <a-form
    ref="formRef"
    :model="form"
    :rules="rules"
    layout="horizontal"
    :label-col="{ style: 'width:120px; text-align:right' }"
    :wrapper-col="{ style: 'flex:1' }"
    class="wfe-form"
  >
    <a-form-item label="折旧方式" name="method">
      <a-select v-model:value="form.method" style="width:100%" class="uni-input">
        <a-select-option v-for="m in METHODS" :key="m" :value="m">{{ m }}</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item label="折旧年限" name="depreciationYears">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.depreciationYears"
          placeholder="请输入"
          :min="1"
          :precision="0"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">年</span>
      </div>
    </a-form-item>

    <a-form-item label="残债率" name="residualRate">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.residualRate"
          placeholder="请输入"
          :min="0"
          :max="100"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">%</span>
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const METHODS = ['直线折旧法', '双倍余额递减法', '年数总和法']

const form = ref({ ...props.modelValue })
const formRef = ref(null)

let syncing = false

watch(form, v => {
  if (syncing) return
  emit('update:modelValue', { ...v })
}, { deep: true })

watch(() => props.modelValue, v => {
  syncing = true
  form.value = { ...v }
  nextTick(() => { syncing = false })
}, { deep: true })

const rules = {
  method:            [{ required: true, message: '请选择折旧方式',  trigger: 'change' }],
  depreciationYears: [{ required: true, message: '请输入折旧年限',  trigger: 'blur'   }],
  residualRate:      [{ required: true, message: '请输入残债率',    trigger: 'blur'   }],
}

defineExpose({ validate: () => formRef.value?.validate() })
</script>

<style scoped>
.wfe-form { max-width: 600px; margin: 0 auto; padding: 8px 0; }

:deep(.ant-form-item) { margin-bottom: 20px; }

/* ── 统一输入框高度 36px ─────────────────────────────────── */
:deep(.uni-input.ant-input-number) {
  height: 36px;
  line-height: 36px;
}
:deep(.uni-input.ant-input-number .ant-input-number-input) {
  height: 34px;
  line-height: 34px;
  padding-right: 38px;
}
:deep(.uni-input.ant-select .ant-select-selector) {
  height: 36px !important;
  line-height: 36px !important;
}
:deep(.uni-input.ant-select .ant-select-selection-item) {
  line-height: 34px !important;
}

/* ── 单位内置输入框 ─────────────────────────────────────── */
.input-unit-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.input-unit-wrap :deep(.ant-input-number) {
  width: 100%;
}

.unit-inner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #bbb;
  font-size: 13px;
  pointer-events: none;
  user-select: none;
  z-index: 1;
}
</style>
