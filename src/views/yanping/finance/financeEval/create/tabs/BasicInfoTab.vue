<!--
  基本信息 Tab
  路径: src/pages/financeEval/create/tabs/BasicInfoTab.vue
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
    <a-form-item label="项目名称" name="projectName">
      <a-input
        v-model:value="form.projectName"
        placeholder="请输入您的项目名称"
        :maxlength="50"
        show-count
        class="uni-input"
      />
    </a-form-item>

    <a-form-item label="项目所属区域" name="region">
      <a-cascader
        v-model:value="form.region"
        placeholder="请选择省/市/区"
        allow-clear
        style="width:100%"
        :field-names="{
          label: 'regionName',
          value: 'regionCode',
          children: 'subList',
        }"
        :options="areaCodeOptions"
        class="uni-input"
      />
    </a-form-item>

    <a-form-item label="项目开始日期" name="startYearMonth">
      <div style="display:flex;align-items:center;gap:12px;width:100%">
        <a-date-picker
          v-model:value="form.startYearMonth"
          placeholder="请选择年/月/日"
          value-format="YYYY-MM-DD"
          style="flex:1"
          class="uni-input"
        />
        <span style="white-space:nowrap;color:#333">建设期</span>
        <a-form-item name="constructionPeriod" class="no-margin-formitem" style="margin:0">
          <a-input-number
            v-model:value="form.constructionPeriod"
            :min="1"
            :max="5"
            :precision="0"
            style="width:70px"
            class="uni-input"
            @change="val => emit('constructionPeriodChange', val || 1)"
          />
        </a-form-item>
        <span style="color:#333">年</span>
      </div>
    </a-form-item>

    <a-form-item label="装机容量" name="capacity">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.capacity"
          placeholder="请输入"
          :min="0.001"
          :max="9999.999"
          :precision="3"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">MW</span>
      </div>
    </a-form-item>

    <a-form-item name="capitalIRRAfterTax">
      <template #label>
        <span>资本金基准内部<br />收益率(税后)</span>
      </template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.capitalIRRAfterTax"
          placeholder="默认 6.5"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">%</span>
      </div>
    </a-form-item>

    <a-form-item name="investIRRBeforeTax">
      <template #label>
        <span>投资基准内部<br />收益率(税前)</span>
      </template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.investIRRBeforeTax"
          placeholder="默认 6.0"
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
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { getProvince } from '@/api/modules/base'
import useAreaDataStore from '@/pinia/modules/areaData'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue', 'constructionPeriodChange'])

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

const areaDataStore   = useAreaDataStore()
const areaCodeOptions = computed(() => areaDataStore.areaArr)

onMounted(async () => {
  if (areaDataStore.areaArr && areaDataStore.areaArr.length > 0) return
  try {
    const res = await getProvince()
    areaDataStore.areaArr = res.code === 200 ? (res.data?.subList ?? []) : []
  } catch {
    areaDataStore.areaArr = []
  }
})

const rules = {
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { max: 50, message: '最多50个汉字', trigger: 'blur' },
  ],
  region: [{ required: true, message: '请选择项目所属区域', trigger: 'change' }],
  startYearMonth: [{ required: true, message: '请选择项目开始日期', trigger: 'change' }],
  constructionPeriod: [{ required: true, message: '请输入建设期', trigger: 'blur' }],
  capacity: [
    { required: true, message: '请输入装机容量', trigger: 'blur' },
    {
      validator: (_, v) => {
        if (v <= 0 || v >= 10000) return Promise.reject('须大于0且小于10000')
        return Promise.resolve()
      },
      trigger: 'blur',
    },
  ],
  capitalIRRAfterTax: [{ required: true, message: '请输入资本金基准内部收益率(税后)', trigger: 'blur' }],
  investIRRBeforeTax: [{ required: true, message: '请输入投资基准内部收益率(税前)', trigger: 'blur' }],
}

defineExpose({ validate: () => formRef.value?.validate() })
</script>

<style scoped>
.wfe-form { max-width: 600px; margin: 0 auto; padding: 8px 0; }

:deep(.ant-form-item) { margin-bottom: 20px; }

/* ── 统一输入框高度 36px ─────────────────────────────────── */
:deep(.uni-input.ant-input),
:deep(.uni-input.ant-input-number),
:deep(.uni-input.ant-picker),
:deep(.uni-input.ant-select .ant-select-selector),
:deep(.uni-input.ant-cascader .ant-select-selector) {
  height: 36px;
  line-height: 36px;
}
:deep(.uni-input.ant-input-number .ant-input-number-input) {
  height: 34px;
  line-height: 34px;
}
:deep(.uni-input.ant-picker .ant-picker-input > input) {
  height: 34px;
  line-height: 34px;
}

:deep(.ant-input-affix-wrapper){
  padding-top: 0;
  padding-bottom: 0;
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

/* 为单位文字留出右侧空间 */
.input-unit-wrap :deep(.ant-input-number-input) {
  padding-right: 38px;
  height: 36px;
  line-height: 36px;
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

/* 清除建设期内部form-item全部margin */
:deep(.no-margin-formitem.ant-form-item) {
  margin: 0 !important;
  margin-bottom: 0 !important;
}
/* 同时清除内部子节点的间距，彻底根治 */
:deep(.no-margin-formitem.ant-form-item .ant-form-item-control) {
  margin-bottom: 0 !important;
}
</style>
