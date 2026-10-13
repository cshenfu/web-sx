<!-- components/report-wizard/steps/StepTwo.vue -->
<template>
    <div class="step-two">
      <div class="form-item">
        <label class="form-label required">拟接入电压等级</label>
        <RadioOptionGroup v-model="form.substationRatedVoltage" :options="voltageOptions" name="voltage" />
      </div>
  
      <ReferenceBlock v-model="form.isAnemometerTowerData" :block="stepTwoReferenceBlocks.windTower" />
      <ReferenceBlock v-model="form.isGeologicalSurveyReport" :block="stepTwoReferenceBlocks.geological" />
      <ReferenceBlock v-model="form.isTopographicMap" :block="stepTwoReferenceBlocks.topographic" />
      <ReferenceBlock v-model="form.isSystemReport" :block="stepTwoReferenceBlocks.system" />
  
      <div class="divider" />
  
      <div v-show="showAdvanced" class="advanced-block">
        <ReferenceBlock v-model="form.isWeatherStationData" :block="stepTwoAdvancedBlocks.weather" />
        <ReferenceBlock v-model="form.isAvoidAreasData" :block="stepTwoAdvancedBlocks.avoid" />
        <ReferenceBlock v-model="form.isCanDeployableAreaData" :block="stepTwoAdvancedBlocks.deployable" />
  
        <div class="form-item">
          <label class="form-label">集电线路铺设方式</label>
          <select v-model="form.cableLayingMethod" class="select-input wide">
            <option v-for="opt in cableLayingMethodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">覆冰厚度</label>
          <select v-model="form.iceThickness" class="select-input wide">
            <option v-for="opt in iceThicknessOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">电网污秽等级</label>
          <select v-model="form.dirtyLevel" class="select-input wide">
            <option v-for="opt in powerGridOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
  
        <div class="form-item">
          <label class="form-label">进站道路占地</label>
          <RadioOptionGroup
            v-model="form.landAcquisitionType"
            :options="[{ label: '永久征地', value: 0 }, { label: '长期征地', value: 1 }]"
            name="landAcquisitionType"
          />
        </div>
  
        <ReferenceBlock v-model="form.isEiaReport" :block="stepTwoAdvancedBlocks.eia" />
        <ReferenceBlock v-model="form.isWaterConservationReport" :block="stepTwoAdvancedBlocks.water" />
        <ReferenceBlock v-model="form.isMesoscaleFile" :block="stepTwoAdvancedBlocks.mesoscale" />
      </div>
  
      <div class="show-more-row">
        <button type="button" class="show-more-btn" @click="showAdvanced = !showAdvanced">
          {{ showAdvanced ? '收起' : '高级参数设置' }}
          <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
  
      <div class="footer-actions">
        <button type="button" class="btn" @click="$emit('save-draft', form)">保存草稿</button>
        <button type="button" class="btn primary" @click="$emit('next', form)">下一步</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, h, reactive, ref } from 'vue'
  import RadioOptionGroup from '../../shared/RadioOptionGroup.vue'
  import ReferenceBox from '../../shared/ReferenceBox.vue'
  import {
    PACKAGE_TYPE,
    voltageLevelOptionsByMode,
    referenceToggleOptions,
    stepTwoReferenceBlocks,
    stepTwoAdvancedBlocks,
    cableLayingMethodOptions,
    iceThicknessOptions,
    powerGridOptions,
  } from '../../../js/Reportwizardmockdata'
  
  const props = defineProps({
    createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  })
  
  defineEmits(['save-draft', 'next'])
  
  const showAdvanced = ref(false)
  
  const voltageOptions = computed(
    () => voltageLevelOptionsByMode[props.createProjectMode] || voltageLevelOptionsByMode[PACKAGE_TYPE.default]
  )
  
  const form = reactive({
    substationRatedVoltage: voltageOptions.value[0]?.value,
    isAnemometerTowerData: 0,
    isGeologicalSurveyReport: 0,
    isTopographicMap: 0,
    isSystemReport: 0,
    isWeatherStationData: 0,
    isAvoidAreasData: 0,
    isCanDeployableAreaData: 0,
    cableLayingMethod: 0,
    iceThickness: 10,
    dirtyLevel: 0,
    landAcquisitionType: 0,
    isEiaReport: 0,
    isWaterConservationReport: 0,
    isMesoscaleFile: 0,
  })
  
  // 每个“引用项目 / 暂无”板块，抽成一个内联小组件，避免在模板里重复写
  // 单选 + 条件展示的 ReferenceBox 组合。
  const ReferenceBlock = {
    props: { modelValue: [Number, String], block: Object },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () =>
        h('div', { class: 'form-item' }, [
          h('label', { class: 'form-label required' }, props.block.title),
          h(RadioOptionGroup, {
            modelValue: props.modelValue,
            options: referenceToggleOptions,
            name: props.block.key,
            'onUpdate:modelValue': (val) => emit('update:modelValue', val),
          }),
          props.modelValue === 1
            ? h('div', { class: 'form-item sub-item' }, [h(ReferenceBox, { rows: props.block.rows })])
            : null,
        ])
    },
  }
  </script>
  
  <style scoped>
  .step-two {
    padding-bottom: 20px;
  }
  
  .form-item {
    margin-bottom: 18px;
  }
  
  .form-item.sub-item {
    margin-top: 10px;
    margin-bottom: 0;
  }
  
  .form-label {
    display: block;
    margin-bottom: 8px;
    color: #1f2937;
    font-size: 13px;
  }
  
  .form-label.required::before {
    content: '*';
    margin-right: 3px;
    color: #ff6b6b;
  }
  
  .select-input {
    height: 32px;
    padding: 0 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    outline: none;
    font-size: 13px;
  }
  
  .select-input.wide {
    width: 220px;
  }
  
  .divider {
    height: 1px;
    margin: 20px 0;
    background: #eef0f3;
  }
  
  .show-more-row {
    display: flex;
    justify-content: center;
    margin: 8px 0 20px;
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