<!-- components/report-wizard/steps/StepThree.vue -->
<template>
  <div class="step-three">
    <div class="illustrate">
      <span class="illustrate-icon">!</span>
      说明：系统提供以下费用项的默认值，您可根据公司项目进行相关费用的单价调整，也可不进行调整
    </div>

    <EditTable
      v-if="columns.length"
      ref="editTableRef"
      :columns="columns"
      :dataSource="visibleSource"
      :showMoreTemplate="true"
    />

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
import { ref, computed, onMounted } from 'vue'
import EditTable from '@/components/editTable/EditTable.vue'
import {
  submitThreeStepParam,
  getThreeStepDynamicParam,
} from '@/api/modules/project'
import { PACKAGE_TYPE } from '../../../js/Reportwizardmockdata'

const props = defineProps({
  project: { type: Object, default: () => null },
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
})
const emit = defineEmits(['save-draft', 'submit'])

const editTableRef = ref(null)
const submitting = ref(false)
const submitMode = ref('')
const submitError = ref('')
const columns = ref([])

const projectMode = props.createProjectMode
const isDistributed = projectMode === PACKAGE_TYPE.distributedDefault

// 优先取向导里的项目数据，取不到回退 sessionStorage（原组件来源）
const hubHeight =
  Number(props.project?.preferHubHeight ?? sessionStorage.getItem('preferHubHeight')) || 0
const selfBuildStorage =
  (props.project?.energyStorage ?? sessionStorage.getItem('energyStorage')) == 1

const AUTO_DESC = '说明：系统会根据实际项目容量自动计算。若调整价格，则以您调整的价格为准'
const AREA_DESC = '说明：系统会根据实际占用的相关土地面积自动计算。若调整则以您调整的面积为准'

// 构造一行：type, name, dataIndex, unit, default, min, max, extra
const r = (type, name, dataIndex, unit, def, min, max, extra = {}) => ({
  type, name, dataIndex, unit, default: def, price: null, min, max, ...extra,
})

// 同一 type 的行必须连续（合并单元格依赖）
const dataSource = ref([
  // 设备相关
  r('设备相关', '风机单价', 'windTurbineUnitPrice', '元/kW', isDistributed ? 1500 : 1300, 1000, 2000,
    { codeNum: isDistributed ? '000007' : '000005' }),
  r('设备相关', '塔筒单价', 'towerBarrelUnitPrice', '元/t', isDistributed ? 11000 : 8500, 5000, 15000,
    { codeNum: isDistributed ? '000008' : '000006', show: !hubHeight || hubHeight <= 140 }),
  r('设备相关', '混塔塔筒单价', 'mixTowerBarrelUnitPrice', '元/kW', 800, 500, 1200,
    { codeNum: '000022', show: hubHeight > 140 }),
  r('设备相关', '主变单价', 'mainTransformerUnitPrice', '元/MVA', 50000, 47000, 55000, { codeNum: '000009' }),
  r('设备相关', '箱变单价', 'boxTransformerUnitPrice', '元/kVA', 95, 90, 110, { codeNum: '000010' }),
  r('设备相关', '无功率补偿装置SVG单价', 'svgUnitPrice', '元/Mvar', 70000, 66000, 77000, { codeNum: '000011' }),
  r('设备相关', '送出工程总费用', 'sendOutTotalPrice', '万元', 0, 0, 15000,
    { desc: '说明：系统确认升压站位置后自动计算。若调整价格，则以您调整的价格为准' }),
  r('设备相关', '储能设备费', 'energyStorageDeviceFee', '万元/MWh', 70, 60, 80,
    { codeNum: '000012', show: selfBuildStorage }),
  // 资金及费率
  r('资金及费率', '项目资金比例', 'fundingRatio', '%', 20, 20, 100, { codeNum: '000001' }),
  r('资金及费率', '长期贷款利率', 'longLoanRate', '%', 3.95, 0, 20, { codeNum: '000002' }),
  r('资金及费率', '短期贷款利率', 'shortLoanRate', '%', 3.55, 0, 20, { codeNum: '000003' }),
  // 预备费
  r('预备费', '基本预备费费率', 'basicContingencyRate', '%', 3, 1, 3, { isParseFloat: 2, codeNum: '000004' }),
  // 发电上网
  r('发电上网', '上网电价（含税）', 'feedInTariff', '元/kWh', '系统自动取费', 0.001, 2, { isParseFloat: 4 }),
  r('发电上网', '限电比例', 'powerRationingRatio', '%', 0, 0, 50, { isParseFloat: 1 }),
  // 其他
  r('其他', '工程前期费', 'preConstructionFee', '万元', 80, 0, 10000),
  r('其他', '勘查费', 'surveyFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  r('其他', '设计费', 'designFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  r('其他', '环境保护工程', 'environmentalProtectionFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  r('其他', '劳动安全与职业卫生工程', 'laborSafetyOccupationalHygieneFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  r('其他', '水土保持工程（不含水土保持补偿费）', 'waterSoilConservationFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  r('其他', '水土保持补偿费', 'waterSoilConservationCompensationFee', '万元', '系统自动计算', 0, 10000, { desc: AUTO_DESC }),
  // 运维
  r('运维', '定员人数', 'fixNumPerson', '人', 12, 1, 100),
  r('运维', '人工工资（不含福利）', 'wages', '元/人/年', 80000, 50000, 1000000),
  r('运维', '风机质保期', 'deviceWarranty', '年', 5, 1, 50, { isParseInt: true }),
  r('运维', '材料费（质保期内）', 'warrantyInMaterial', '元/kW', 20, 0, 100),
  r('运维', '材料费（质保期外）', 'warrantyOutMaterial', '元/kW', 30, 0, 100),
  r('运维', '其他费', 'otherFee', '元/kW', 50, 0, 100),
  r('运维', '保险费率', 'safeRate', '%', 0.25, 0, 1),
  r('运维', '修理费（质保期内）', 'warrantyInFix', '元/kW', 25, 0, 100),
  r('运维', '修理费（质保期外）', 'warrantyOutFix', '元/kW', 30, 0, 100),
  r('运维', '折旧年限', 'depreciationPeriod', '年', 20, 5, 20, { isParseInt: true }),
  r('运维', '折旧残值', 'depreciationResidual', '%', 5, 0, 5),
  // 用地
  r('用地', '永久征地费', 'landAcquisitionFee', '元/亩', 246790, 25000, 800000, { codeNum: '000013' }),
  r('用地', '长期征地费', 'longLandAcquisitionFee', '元/亩', 113390, 10500, 200000, { codeNum: '000014' }),
  r('用地', '永久征地补偿费', 'landCompensation', '元/亩', 213440, 105000, 300000, { codeNum: '000015' }),
  r('用地', '临时用地租用费', 'tempLandRentalFee', '元/亩', 6670, 500, 8000, { codeNum: '000016' }),
  r('用地', '土地使用税', 'landUseTax', '元/亩', 10000, 3000, 15000, { codeNum: '000017' }),
  r('用地', '土地复垦费', 'landReclamationFee', '元/亩', 150000, 40000, 180000, { codeNum: '000018' }),
  r('用地', '青苗补偿费', 'youngCropCompensationFee', '元/亩', 30000, 12000, 35000, { codeNum: '000019' }),
  r('用地', '青苗补偿占用面积', 'youngCropCompensationOccupiedArea', '亩', '系统自动计算', 0, 10000000, { desc: AREA_DESC }),
  r('用地', '林地林木补偿费', 'forestLandCompensationFee', '元/亩', 13340, 8000, 20000, { codeNum: '000020' }),
  r('用地', '林地林木占用面积', 'forestLandOccupiedArea', '亩', '系统自动计算', 0, 10000000, { desc: AREA_DESC }),
  r('用地', '耕地占用税', 'farmlandOccupiedTax', '元/亩', 10000, 2500, 66700, { codeNum: '000021' }),
  r('用地', '耕地占用面积', 'farmlandOccupiedArea', '亩', '系统自动计算', 0, 10000000, { desc: AREA_DESC }),
])

// 隐藏的行不显示，也不提交
const visibleSource = computed(() =>
  dataSource.value.filter((ele) => ele.show == null || ele.show)
)

function computedRowSpan(data, key) {
  const spans = Array(data.length).fill(1)
  let i = 0
  while (i < data.length) {
    let count = 1
    while (i + count < data.length && data[i][key] === data[i + count][key]) {
      spans[i + count] = 0
      count++
    }
    spans[i] = count
    i += count
  }
  return spans
}

function buildColumns() {
  const rowSpanData = computedRowSpan(visibleSource.value, 'type')
  columns.value = [
    {
      title: '类型', dataIndex: 'type', width: '17%', align: 'center',
      customCell: (_, index) => ({ rowSpan: rowSpanData[index] }),
    },
    { title: '费用项', dataIndex: 'name', width: '28%', align: 'center' },
    { title: '单位', dataIndex: 'unit', width: '15%', align: 'center' },
    { title: '默认值', dataIndex: 'default', width: '20%', isDesc: true, align: 'center' },
    { title: '调整值', dataIndex: 'price', width: '20%', align: 'center', isEdit: true, type: 1 },
  ]
}

// 项目 id：雪花 ID 用字符串，避免精度丢失
function getProjectId() {
  const id = props.project?.id ?? sessionStorage.getItem('projectID')
  return id === '' || id === null || id === undefined ? undefined : String(id)
}

// 用后端接口覆盖默认值、范围（与原组件 onInitParam 一致）
async function initParam() {
  try {
    const res = await getThreeStepDynamicParam(projectMode, getProjectId())
    if (res && res.code == 200) {
      const detail = res.data?.projectDetailRespDTO || {}
      const dynamicList = res.data?.projectCostRespDTOList || []

      dataSource.value.forEach((ele) => {
        const dyn = ele.codeNum && dynamicList.find((item) => item.code == ele.codeNum)
        if (dyn) {
          ele.default = dyn.defaultValue
          ele.min = dyn.minValue
          ele.max = dyn.maxValue
          ele.name = dyn.name
        } else {
          ele.default = detail[ele.dataIndex] == null ? '系统自动计算' : detail[ele.dataIndex]
        }
      })
    }
  } catch (error) {
    console.error('获取第三步默认值失败:', error)
  } finally {
    buildColumns() // 无论成功与否都要渲染表格
  }
}

onMounted(initParam)

function extractSavedProjectId(response) {
  const candidates = [
    response?.data?.id,
    response?.data?.projectId,
    response?.result?.id,
    response?.id,
    response?.data,
  ]
  const id = candidates.find((v) => {
    if (v === '' || v === null || v === undefined) return false
    return /^\d+$/.test(String(v))
  })
  return id === undefined ? null : String(id)
}

// 取值规则与原组件一致：调整值 > 数字默认值 > null（文字默认值交给后端计算）
function buildParams(isDraft) {
  const params = {
    itemType: projectMode,
    projectId: getProjectId(),
  }

  const list = editTableRef.value?.dataList || visibleSource.value
  list.forEach((ele) => {
    const hasPrice =
      (ele.price && !isNaN(parseFloat(ele.price))) || ele.price == 0
    params[ele.dataIndex] = hasPrice
      ? ele.price * 1
      : typeof ele.default == 'string'
        ? null
        : ele.default * 1
  })

  if (isDraft) params.isDraft = true
  params.obsPath = sessionStorage.getItem('obsFilePath')
  return params
}

async function submitStep(isDraft) {
  submitting.value = true
  submitMode.value = isDraft ? 'draft' : 'submit'
  submitError.value = ''

  const params = buildParams(isDraft)

  try {
    // type：草稿 0，提交 1
    const response = await submitThreeStepParam(isDraft ? 0 : 1, params)
    if (response?.code !== undefined && response.code !== 200) {
      throw new Error(response.msg || '项目保存失败')
    }

    const savedProjectId = extractSavedProjectId(response) ?? props.project?.id ?? null
    const costRows = (editTableRef.value?.dataList || []).map((row) => ({ ...row }))

    const result = {
      form: { costRows },
      request: params,
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
.submit-error { margin: 8px 0 12px; color: #f04444; font-size: 12px; text-align: center; }
.footer-actions { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
.btn {
  min-width: 100px; padding: 9px 20px; border: 1px solid #d1d5db;
  border-radius: 20px; cursor: pointer; color: #374151; background: #fff; font-size: 13px;
}
.btn.primary { border-color: #2f8dff; color: #fff; background: #2f8dff; }
.btn:disabled { cursor: not-allowed; opacity: 0.6; }
</style>