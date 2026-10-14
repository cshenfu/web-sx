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
        <svg viewBox="0 0 16 16" class="chevron" :class="{ up: showAdvanced }">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <p v-if="submitError" class="submit-error">{{ submitError }}</p>

    <div class="footer-actions">
      <button type="button" class="btn" :disabled="submitting" @click="submitStep(true)">
        {{ submitting && submitMode === 'draft' ? '保存中…' : '保存草稿' }}
      </button>
      <button type="button" class="btn primary" :disabled="submitting" @click="submitStep(false)">
        {{ submitting && submitMode === 'submit' ? '提交中…' : '提交计算' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CostTable from '../../shared/CostTable.vue'
import { costTableDataSource } from '../../../js/Reportwizardmockdata'
import * as newApi from '@/api/modules/project'

const props = defineProps({
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['save-draft', 'submit'])

const showAdvanced = ref(false)
const submitting = ref(false)
const submitMode = ref('')
const submitError = ref('')

const initialRows =
  Array.isArray(props.project?.costRows) && props.project.costRows.length
    ? props.project.costRows
    : costTableDataSource.map((row) => ({ ...row, price: null }))

const rows = ref(initialRows.map((row) => ({ ...row })))

const labelToKey = {
  基本预备费费率: 'basicContingencyRate',
  箱变单价: 'boxTransformerUnitPrice',
  折旧年限: 'depreciationPeriod',
  折旧残值: 'depreciationResidual',
  设计费: 'designFee',
  风机质保期: 'deviceWarranty',
  储能设备费: 'energyStorageDeviceFee',
  环境保护工程: 'environmentalProtectionFee',
  耕地占用面积: 'farmlandOccupiedArea',
  耕地占用税: 'farmlandOccupiedTax',
  上网电价: 'feedInTariff',
  定员人数: 'fixNumPerson',
  林地林木补偿: 'forestLandCompensationFee',
  林地林木占用面积: 'forestLandOccupiedArea',
  项目资金比例: 'fundingRatio',
  房屋距离: 'houseDistance',
  储能单位静态投资: 'investmentEnergyStorageUnits',
  劳动安全与职业卫生工程: 'laborSafetyOccupationalHygieneFee',
  永久征地费: 'landAcquisitionFee',
  永久征地补偿费: 'landCompensation',
  土地复垦费: 'landReclamationFee',
  土地使用税: 'landUseTax',
  长期征地费: 'longLandAcquisitionFee',
  长期贷款利率: 'longLoanRate',
  主变单价: 'mainTransformerUnitPrice',
  混塔单价: 'mixTowerBarrelUnitPrice',
  其他费: 'otherFee',
  限电比例: 'powerRationingRatio',
  工程前期费: 'preConstructionFee',
  保险费率: 'safeRate',
  送出工程总费用: 'sendOutTotalPrice',
  短期贷款利率: 'shortLoanRate',
  勘察费: 'surveyFee',
  无功率补偿装置SVG单价: 'svgUnitPrice',
  SVG单价: 'svgUnitPrice',
  临时用地租用费: 'tempLandRentalFee',
  塔筒单价: 'towerBarrelUnitPrice',
  单位静态投资: 'unitStaticInvestment',
  人工工资: 'wages',
  修理费质保期内: 'warrantyInFix',
  材料费质保期内: 'warrantyInMaterial',
  修理费质保期外: 'warrantyOutFix',
  材料费质保期外: 'warrantyOutMaterial',
  水土保持补偿费: 'waterSoilConservationCompensationFee',
  水土保持工程: 'waterSoilConservationFee',
  风机单价: 'windTurbineUnitPrice',
  青苗补偿费: 'youngCropCompensationFee',
  青苗补偿占用面积: 'youngCropCompensationOccupiedArea',
}

/**
 * ⚠️ editProjectWindReqDTO.id：雪花 ID，字符串处理。
 */
function toEditProjectId(value) {
  if (value === '' || value === null || value === undefined) return undefined
  return String(value)
}

/**
 * sxProjectId：保持原逻辑（Number）。
 */
function toProjectId(value) {
  if (value === '' || value === null || value === undefined) return 0
  const id = Number(value)
  return Number.isFinite(id) ? id : 0
}

function removeUndefined(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined)
  )
}

function extractSavedProjectId(response) {
  const candidates = [
    response?.data?.id,
    response?.data?.projectId,
    response?.data?.editProjectWindReqDTO?.id,
    response?.result?.id,
    response?.id,
    response?.data,
  ]

  const id = candidates.find((value) => {
    if (value === '' || value === null || value === undefined) return false
    return /^\d+$/.test(String(value))
  })

  return id === undefined ? null : String(id)
}

function keyOf(row) {
  if (!row) return null
  const direct = row.key || row.field || row.prop
  if (direct) return direct

  const label = row.label || row.name || row.title
  if (label && labelToKey[label]) return labelToKey[label]

  if (label) {
    const normalized = String(label).replace(/\s+/g, '')
    if (labelToKey[normalized]) return labelToKey[normalized]
  }

  return null
}

function buildProjectDetail() {
  const project = props.project || {}

  const detail = {
    // projectDetail.projectId 也是项目 id，字符串保精度
    projectId: project.id ? String(project.id) : 0,
  }

  if (project.projectDetail && typeof project.projectDetail === 'object') {
    Object.assign(detail, project.projectDetail)
  }

  rows.value.forEach((row) => {
    const key = keyOf(row)
    if (!key) return

    const raw = row.price
    if (raw === '' || raw === null || raw === undefined) return

    const num = Number(raw)
    if (Number.isFinite(num)) detail[key] = num
  })

  return detail
}

function buildPayload(isDraft) {
  const project = props.project || {}

  const editProjectWindReqDTO = {
    // ⚠️ 项目 id（雪花 ID）
    id: toEditProjectId(project.id),

    step: 3,
    isDraft,
    projectAdjustFlag: Boolean(project.id),
    projectAdjustOneStepFlag: false,
    uniqueIdentification:
      project.uniqueIdentification || `report-step-three-${project.id || 'new'}`,
    projectDetail: buildProjectDetail(),
  }

  return {
    editProjectWindReqDTO: removeUndefined(editProjectWindReqDTO),
    // sxProjectId 保持原逻辑
    sxProjectId: toProjectId(project.sxProjectId ?? project.id),
  }
}

async function submitStep(isDraft) {
  submitting.value = true
  submitMode.value = isDraft ? 'draft' : 'submit'
  submitError.value = ''

  const payload = buildPayload(isDraft)

  try {
    const response = await newApi.saveUpdateProject(payload)
    if (response?.code !== undefined && response.code !== 200) {
      throw new Error(response.msg || '项目保存失败')
    }

    const savedProjectId =
      extractSavedProjectId(response) ?? props.project?.id ?? null

    const costRows = rows.value.map((row) => ({ ...row }))

    const result = {
      form: { costRows },
      request: payload,
      response,
      savedProjectId,
      project: {
        ...(props.project || {}),
        costRows,
        ...(savedProjectId ? { id: savedProjectId } : {}),
      },
    }

    if (isDraft) emit('save-draft', result)
    else emit('submit', result)
  } catch (error) {
    console.error('提交第三步项目数据失败:', error)
    submitError.value = error?.message || '保存失败，请稍后重试'
  } finally {
    submitting.value = false
    submitMode.value = ''
  }
}
</script>

<style scoped>
.step-three { padding-bottom: 20px; }
.illustrate {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  margin-bottom: 16px; border-radius: 4px; background: #fff7e6;
  color: #92600a; font-size: 12.5px;
}
.illustrate-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%; background: #f5a623;
  color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.show-more-row { display: flex; justify-content: center; margin: 20px 0; }
.show-more-btn {
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 16px;
  border: 1px solid #2f8dff; border-radius: 4px; cursor: pointer;
  color: #2f8dff; background: #fff; font-size: 12.5px;
}
.chevron { width: 12px; height: 12px; transition: transform 0.2s; }
.chevron.up { transform: rotate(180deg); }
.submit-error { margin: 8px 0 12px; color: #f04444; font-size: 12px; text-align: center; }
.footer-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
.btn {
  min-width: 100px; padding: 9px 20px; border: 1px solid #d1d5db;
  border-radius: 20px; cursor: pointer; color: #374151; background: #fff; font-size: 13px;
}
.btn.primary { border-color: #2f8dff; color: #fff; background: #2f8dff; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }
</style>