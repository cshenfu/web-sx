<!--
  投资设置 Tab
  路径: src/pages/financeEval/create/tabs/InvestmentTab.vue
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
    <a-form-item label="长期贷款利率" name="longTermLoanRate">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.longTermLoanRate"
          placeholder="请输入"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">%</span>
      </div>
    </a-form-item>

    <a-form-item label="短期贷款利率" name="shortTermLoanRate">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.shortTermLoanRate"
          placeholder="请输入"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">%</span>
      </div>
    </a-form-item>

    <a-form-item name="capitalRatio">
      <template #label><span>资本金占动态<br />投资比例</span></template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.capitalRatio"
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

    <a-form-item name="workingCapitalPerKW">
      <template #label><span>流动资金单位<br />千瓦指标</span></template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.workingCapitalPerKW"
          placeholder="请输入"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">元/kW</span>
      </div>
    </a-form-item>

    <a-form-item name="ownWorkingCapitalRatio">
      <template #label><span>自有流动资金<br />比例</span></template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.ownWorkingCapitalRatio"
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

    <a-form-item label="还贷期限" name="loanRepaymentPeriod">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.loanRepaymentPeriod"
          placeholder="请输入"
          :min="1"
          :precision="0"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">年</span>
      </div>
    </a-form-item>

    <!-- <a-form-item name="unitCostStaticInvestment">
      <template #label><span>单位造价(静态)<br />投资</span></template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.unitCostStaticInvestment"
          placeholder="请输入"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">万元</span>
      </div>
    </a-form-item> -->

    <a-form-item name="unitCostDynamic">
      <template #label><span>单位造价(动态)<br />投资</span></template>
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.unitCostDynamic"
          placeholder="请输入"
          :precision="2"
          :min="0"
          :max="999999999"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">万元</span>
      </div>
    </a-form-item>

    <a-form-item label="可抵扣税金" name="deductibleTax">
      <div class="input-unit-wrap">
        <a-input-number
          v-model:value="form.deductibleTax"
          placeholder="请输入"
          :precision="2"
          class="uni-input"
          style="width:100%"
        />
        <span class="unit-inner">万元</span>
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

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

const constructionInterest = computed(() => {
  const cost = form.value.unitCostStaticInvestment ?? 0
  const loanRate = (form.value.longTermLoanRate ?? 0) / 100
  const capitalRatio = (form.value.capitalRatio ?? 0) / 100
  const interest = cost * (1 - capitalRatio) * loanRate * 0.5
  return interest > 0 ? interest.toFixed(2) : ''
})

const totalInvestment = computed(() => {
  const cost = form.value.unitCostStaticInvestment ?? 0
  const interest = parseFloat(constructionInterest.value) || 0
  const tax = form.value.deductibleTax ?? 0
  const total = cost + interest + tax
  return total > 0 ? total.toFixed(2) : ''
})

const required = msg => [{ required: true, message: msg, trigger: 'blur' }]

const rules = {
  longTermLoanRate:         required('请输入长期贷款利率'),
  shortTermLoanRate:        required('请输入短期贷款利率'),
  capitalRatio:             required('请输入资本金占动态投资比例'),
  workingCapitalPerKW:      required('请输入流动资金单位千瓦指标'),
  ownWorkingCapitalRatio:   required('请输入自有流动资金比例'),
  loanRepaymentPeriod:      required('请输入还贷期限'),
  unitCostStaticInvestment: required('请输入单位造价(静态)投资'),
  unitCostDynamic:          required('请输入单位造价(动态)投资'),
  deductibleTax:            required('请输入可抵扣税金'),
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
  padding-right: 52px; /* 为单位腾出空间（最长单位"元/kW"约4字符） */
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
  white-space: nowrap;
}
</style>
