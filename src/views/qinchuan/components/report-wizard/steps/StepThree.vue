<!-- components/report-wizard/steps/StepThree.vue -->
<template>
    <div class="step-three">
      <div class="illustrate">
        <span class="illustrate-icon">!</span>
        说明：系统提供以下费用项的默认值，您可根据公司项目进行相关费用的单价调整，也可不进行调整
      </div>
  
      <CostTable :rows="rows" @update:rows="(next) => (rows = next)" />
  
      <div class="show-more-row">
        <button type="button" class="show-more-btn" @click="showAdvanced = !showAdvanced">
          {{ showAdvanced ? '收起' : '高级参数设置' }}
          <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
  
      <div class="footer-actions">
        <button type="button" class="btn" @click="$emit('save-draft', rows)">保存草稿</button>
        <button type="button" class="btn primary" @click="$emit('submit', rows)">提交计算</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import CostTable from '../../shared/CostTable.vue'
  import { costTableDataSource } from '../../../js/reportWizardMockData'
  
  defineEmits(['save-draft', 'submit'])
  
  const showAdvanced = ref(false)
  const rows = ref(costTableDataSource.map((row) => ({ ...row, price: null })))
  </script>
  
  <style scoped>
  .step-three {
    padding-bottom: 20px;
  }
  
  .illustrate {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 16px;
    border-radius: 4px;
    background: #fff7e6;
    color: #92600a;
    font-size: 12.5px;
  }
  
  .illustrate-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f5a623;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .show-more-row {
    display: flex;
    justify-content: center;
    margin: 20px 0;
  }
  
  .show-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    border: 1px solid #2f8dff;
    border-radius: 4px;
    cursor: pointer;
    color: #2f8dff;
    background: #fff;
    font-size: 12.5px;
  }
  
  .chevron {
    width: 12px;
    height: 12px;
    transition: transform 0.2s;
  }
  
  .chevron.up {
    transform: rotate(180deg);
  }
  
  .footer-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
  
  .btn {
    min-width: 100px;
    padding: 9px 20px;
    border: 1px solid #d1d5db;
    border-radius: 20px;
    cursor: pointer;
    color: #374151;
    background: #fff;
    font-size: 13px;
  }
  
  .btn.primary {
    border-color: #2f8dff;
    color: #fff;
    background: #2f8dff;
  }
  </style>