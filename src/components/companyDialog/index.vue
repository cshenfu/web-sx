<template>
  <el-dialog
    v-model="dialogVisible"
    width="85%"
    top="5vh"
    class="company-info-modal"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <template #header>
      <div class="custom-modal-header">
        <span class="modal-title">{{ displayCompanyName || '企业信息' }}</span>
        <div class="header-actions">
          <el-button class="btn-cancel" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="btn-save" @click="dialogVisible = false">确定</el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab" class="detail-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="基本信息" name="basic" />
      <el-tab-pane label="项目业绩" name="performance" />
      <el-tab-pane label="技术能力" name="tech" />
      <el-tab-pane label="财务审计" name="finance" />
      <el-tab-pane label="申报情况" name="apply" />
    </el-tabs>

    <div class="tab-content" v-loading="loading">
      <!-- ==================== 1. 基本信息 ==================== -->
      <div v-if="activeTab === 'basic'" class="basic-info">
        <el-form label-width="180px" label-position="left" class="read-only-form">
          <el-form-item label="企业名称">
            <el-input v-model="basicInfo.enterpriseName" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="统一社会信用代码">
            <el-input v-model="basicInfo.unifiedSocialCreditCode" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="法定代表人姓名">
            <el-input v-model="basicInfo.legalRepresentative" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="注册地址">
            <el-input v-model="basicInfo.registeredAddress" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="成立和/或注册日期">
            <el-input v-model="basicInfo.registrationDate" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="实收注册资本">
            <div class="input-with-unit">
              <el-input v-model="basicInfo.paidUpCapital" readonly class="readonly-input" />
              <span class="unit">{{ basicInfo.paidUpCapitalUnit || '亿元' }}</span>
            </div>
          </el-form-item>
          <el-form-item label="所属最高级母公司名称">
            <el-input v-model="basicInfo.ultimateParentCompanyName" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="最高级母公司占申报公司股权比例">
            <el-input v-model="basicInfo.ultimateParentEquityRatio" type="textarea" :rows="2" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="申报企业股东构成">
            <el-input v-model="basicInfo.shareholderStructure" type="textarea" :rows="4" readonly class="readonly-input" />
          </el-form-item>
          <el-form-item label="资产负债情况">
            <div class="asset-box">
              <div class="asset-row">
                <span class="asset-label">截止日期</span>
                <el-input v-model="basicInfo.financialDate" readonly class="readonly-input" style="width: 200px" />
              </div>
              <div class="asset-row">
                <span class="asset-label">固定资产</span>
                <div class="input-with-unit">
                  <el-input v-model="basicInfo.fixedAssets" readonly class="readonly-input" style="width: 200px" />
                  <span class="unit">{{ basicInfo.fixedAssetsUnit || '亿元' }}</span>
                </div>
              </div>
              <div class="asset-row">
                <span class="asset-label">总资产</span>
                <div class="input-with-unit">
                  <el-input v-model="basicInfo.totalAssets" readonly class="readonly-input" style="width: 200px" />
                  <span class="unit">{{ basicInfo.totalAssetsUnit || '亿元' }}</span>
                </div>
              </div>
              <div class="asset-row">
                <span class="asset-label">净资产</span>
                <div class="input-with-unit">
                  <el-input v-model="basicInfo.netAssets" readonly class="readonly-input" style="width: 200px" />
                  <span class="unit">{{ basicInfo.netAssetsUnit || '亿元' }}</span>
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="企业简介">
            <el-input v-model="basicInfo.companyProfile" type="textarea" :rows="4" readonly class="readonly-input" />
          </el-form-item>
        </el-form>

        <div class="license-section" v-if="basicInfo.licensePreviewUrl">
          <div class="section-title"><span class="blue-bar"></span>营业执照副本原件的复印件</div>
          <div class="upload-tip">说明：支持 jpg、png 格式图片</div>
          <div class="license-preview">
            <el-image style="max-width: 400px; max-height: 300px; border: 1px solid #E2E9F0; padding: 4px; border-radius: 4px;"
              :src="basicInfo.licensePreviewUrl" :preview-src-list="[basicInfo.licensePreviewUrl]" preview-teleported fit="contain" />
          </div>
        </div>
      </div>

      <!-- ==================== 2. 项目业绩 ==================== -->
      <div v-else-if="activeTab === 'performance'" class="data-panel">
        <el-table :data="performanceList" empty-text="暂无项目业绩数据" border size="small" class="common-el-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="projectType" label="类型" width="100" />
          <el-table-column label="装机容量(万kW)" width="120" align="center">
            <template #default="{ row }">{{ row.installedCapacity ?? '-' }}</template>
          </el-table-column>
          <el-table-column prop="electricityBusinessLicenseNo" label="电力业务许可证编号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="gridConnectionAgreementNo" label="并网协议编号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="purchaseSalesContractNo" label="购售合同编号" min-width="150" show-overflow-tooltip />
          <el-table-column label="营业执照/附件" min-width="200" align="left">
            <template #default="{ row }">
              <div v-if="row.fileList && row.fileList.length > 0" class="list-attachments">
                <template v-for="(file, index) in row.fileList" :key="index">
                  <el-image v-if="!isPdf(file)"
                    style="width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; margin-right: 8px; cursor: pointer; border: 1px solid #ebeef5;"
                    :src="file.previewUrl" :preview-src-list="row.fileList.filter(f => !isPdf(f)).map(f => f.previewUrl)"
                    :initial-index="index" preview-teleported fit="cover" />
                  <el-button v-else link type="primary" style="flex-shrink: 0;" @click="openPdf(file.previewUrl)">
                    <el-icon><Document /></el-icon> PDF
                  </el-button>
                </template>
              </div>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ==================== 3. 技术能力 ==================== -->
      <div v-else-if="activeTab === 'tech'" class="data-panel">
        <el-table :data="techList" empty-text="暂无技术能力数据" border size="small" class="common-el-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="projectType" label="类型" width="120" />
          <el-table-column prop="researchUnit" label="研究单位" min-width="160" show-overflow-tooltip />
          <el-table-column label="可研时间" min-width="200">
            <template #default="{ row }">{{ row.researchStartDate || '-' }} 至 {{ row.researchEndDate || '-' }}</template>
          </el-table-column>
          <el-table-column prop="acceptanceOpinionDate" label="结题验收意见出具时间" min-width="160" />
          <el-table-column prop="achievementRelation" label="成果完成单位与竞配申报单位的关系" min-width="200" show-overflow-tooltip />
          <el-table-column label="证明材料" min-width="200" align="left">
            <template #default="{ row }">
              <div v-if="row.fileList && row.fileList.length > 0" class="list-attachments">
                <template v-for="(file, index) in row.fileList" :key="index">
                  <el-image v-if="!isPdf(file)"
                    style="width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; margin-right: 8px; cursor: pointer; border: 1px solid #ebeef5;"
                    :src="file.previewUrl" :preview-src-list="row.fileList.filter(f => !isPdf(f)).map(f => f.previewUrl)"
                    :initial-index="index" preview-teleported fit="cover" />
                  <el-button v-else link type="primary" style="flex-shrink: 0;" @click="openPdf(file.previewUrl)">
                    <el-icon><Document /></el-icon> PDF
                  </el-button>
                </template>
              </div>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="achievementDate" label="取得日期" min-width="120" />
          <el-table-column prop="projectDescription" label="项目简介/备注" min-width="150" show-overflow-tooltip />
        </el-table>
      </div>

      <!-- ==================== 4. 财务审计 ==================== -->
      <div v-else-if="activeTab === 'finance'" class="data-panel">
        <el-table :data="financeList" empty-text="暂无财务审计数据" border size="small" class="common-el-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="financialYear" label="财务年份" width="120" />
          <el-table-column prop="auditFirm" label="审计公司" min-width="200" show-overflow-tooltip />
          <el-table-column prop="auditBatchNo" label="审计批号" min-width="200" show-overflow-tooltip />
          <el-table-column label="审计材料" min-width="250">
            <template #default="{ row }">
              <div v-if="row.fileList && row.fileList.length > 0">
                <el-button link type="primary" @click="openPdf(row.fileList[0].previewUrl)">
                  {{ row.fileList[0].fileName }}
                </el-button>
              </div>
              <span v-else class="text-gray-400">-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ==================== 5. 申报情况 ==================== -->
      <div v-else-if="activeTab === 'apply'" class="data-panel">
        <div class="sub-tabs">
          <div class="sub-tab-item" :class="{ active: declLevel === 'province' }" @click="switchDeclLevel('province')">在陕西省申报情况</div>
          <div class="sub-tab-item" :class="{ active: declLevel === 'city' }" @click="switchDeclLevel('city')">在所属市申报情况</div>
        </div>
        <el-table :data="declList" empty-text="暂无申报情况数据" border size="small" class="common-el-table">
          <el-table-column prop="declarationYear" label="年份" width="120" align="center" />
          <el-table-column label="取得指标规模/万千瓦" align="center">
            <el-table-column prop="windPowerQuota" label="风电" width="120" align="center" />
            <el-table-column prop="photovoltaicQuota" label="光伏" width="120" align="center" />
            <el-table-column prop="baseProjectQuota" label="基地项目" width="120" align="center" />
          </el-table-column>
          <el-table-column label="并网规模/万千瓦" align="center">
            <el-table-column prop="windPowerGridConnected" label="风电" width="120" align="center" />
            <el-table-column prop="photovoltaicGridConnected" label="光伏" width="120" align="center" />
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import * as api from '@/api/modules/company'
import { useOssUpload } from '@/components/ossClient/index'

const props = defineProps({
  visible: { type: Boolean, default: false },
  companyId: { type: [String, Number], default: '' },
  companyName: { type: String, default: '' }
})
const emit = defineEmits(['update:visible'])

const dialogVisible = ref(false)
const displayCompanyName = ref('')
const activeTab = ref('basic')
const loading = ref(false)

// 各个 Tab 的数据源
const basicInfo = reactive({ licensePreviewUrl: '' })
const performanceList = ref([])
const techList = ref([])
const financeList = ref([])
const declLevel = ref('province')
const declList = ref([])

watch(() => props.visible, (val) => { dialogVisible.value = val })
watch(dialogVisible, (val) => { emit('update:visible', val) })

watch(() => [props.visible, props.companyId], async ([visible, id]) => {
  if (visible && id) {
    displayCompanyName.value = props.companyName
    activeTab.value = 'basic'
    await fetchBasicInfo(id)
  }
})

const unwrapResponse = (res) => {
  if (res && res.data !== undefined && res.code !== undefined) return res.data
  return res
}

const isPdf = (file) => {
  const suffix = file.fileSuffix || file.suffix || ''
  return suffix.toLowerCase() === '.pdf' || (file.filePath && file.filePath.toLowerCase().endsWith('.pdf'))
}

const openPdf = (url) => {
  if (url) window.open(url, '_blank')
}

// 1. 获取基本信息
async function fetchBasicInfo(id) {
  loading.value = true
  try {
    const res = await api.getCompanyBasicInfoByCompanyId(id)
    const data = unwrapResponse(res) || {}
    Object.assign(basicInfo, data)
    if (data.registrationDate) basicInfo.registrationDate = data.registrationDate.slice(0, 10)
    if (data.financialDate) basicInfo.financialDate = data.financialDate.slice(0, 10)

    if (data.fileRespDTO?.filePath) {
      const obsUpload = useOssUpload()
      basicInfo.licensePreviewUrl = data.fileRespDTO.filePath.startsWith('http') 
        ? data.fileRespDTO.filePath 
        : await obsUpload.getFileUrl(data.fileRespDTO.filePath)
    }
  } catch (err) {
    console.error('获取基本信息失败', err)
  } finally {
    loading.value = false
  }
}

// 2. Tab 切换加载对应数据
async function handleTabChange(tab) {
  if (!props.companyId) return
  loading.value = true
  try {
    if (tab === 'performance') {
      const res = await api.getProjectPerformanceList(props.companyId)
      const list = unwrapResponse(res) || []
      // 处理附件 URL
      const obsUpload = useOssUpload()
      await Promise.all(list.map(async item => {
        if (item.fileList) {
          await Promise.all(item.fileList.map(async file => {
            file.previewUrl = file.filePath.startsWith('http') ? file.filePath : await obsUpload.getFileUrl(file.filePath)
          }))
        }
      }))
      performanceList.value = list
    } 
    else if (tab === 'tech') {
      const res = await api.getTechResearchList(props.companyId)
      const list = unwrapResponse(res) || []
      const obsUpload = useOssUpload()
      await Promise.all(list.map(async item => {
        if (item.fileList) {
          await Promise.all(item.fileList.map(async file => {
            file.previewUrl = file.filePath.startsWith('http') ? file.filePath : await obsUpload.getFileUrl(file.filePath)
          }))
        }
      }))
      techList.value = list
    } 
    else if (tab === 'finance') {
      const res = await api.getFinancialAuditList(props.companyId)
      const list = unwrapResponse(res) || []
      const obsUpload = useOssUpload()
      await Promise.all(list.map(async item => {
        if (item.fileList) {
          await Promise.all(item.fileList.map(async file => {
            file.previewUrl = file.filePath.startsWith('http') ? file.filePath : await obsUpload.getFileUrl(file.filePath)
          }))
        }
      }))
      financeList.value = list
    } 
    else if (tab === 'apply') {
      await fetchDeclList()
    }
  } catch (err) {
    console.error(`获取 ${tab} 数据失败`, err)
  } finally {
    loading.value = false
  }
}

// 申报情况逻辑
async function fetchDeclList() {
  const res = await api.getDeclarationListByLevel({ companyId: props.companyId, level: declLevel.value })
  declList.value = unwrapResponse(res) || []
}
function switchDeclLevel(level) {
  if (declLevel.value === level) return
  declLevel.value = level
  fetchDeclList()
}
</script>

<style scoped>
.company-info-modal :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  background: #f5f7fa;
}
.custom-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}
.btn-cancel { margin-right: 10px; }
.detail-tabs {
  background: #fff;
  padding: 0 20px;
  border-radius: 8px 8px 0 0;
}
.tab-content {
  background: #fff;
  padding: 24px;
  min-height: 500px;
  max-height: 65vh;
  overflow-y: auto;
  border-radius: 0 0 8px 8px;
}

/* 只读表单样式 */
.read-only-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #667383;
}
.readonly-input :deep(.el-input__wrapper),
.readonly-input :deep(.el-textarea__inner) {
  background-color: #f8fafc !important;
  box-shadow: none !important;
  color: #1f2937;
}
.input-with-unit {
  display: flex;
  align-items: center;
  width: 100%;
}
.input-with-unit :deep(.el-input) { flex: 1; }
.unit {
  margin-left: 12px;
  color: #667383;
  white-space: nowrap;
}
.asset-box {
  border: 1px solid #e2e9f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  background: #f8fafc;
}
.asset-row { display: flex; align-items: center; }
.asset-label {
  width: 80px;
  font-size: 14px;
  color: #667383;
  text-align: right;
  margin-right: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #0b1c2c;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.blue-bar {
  width: 3px;
  height: 14px;
  background-color: #0278e7;
  margin-right: 8px;
  border-radius: 2px;
}
.upload-tip { font-size: 13px; color: #8D9AAF; margin-bottom: 12px; }

.list-attachments { display: flex; flex-wrap: nowrap; overflow-x: auto; align-items: center; padding-bottom: 4px; }
.list-attachments::-webkit-scrollbar { height: 6px; }
.list-attachments::-webkit-scrollbar-thumb { background: #dcdfe6; border-radius: 3px; }

/* 申报情况子Tab */
.sub-tabs { display: flex; gap: 32px; border-bottom: 1px solid #E2E9F0; margin-bottom: 20px; }
.sub-tab-item {
  font-size: 14px; color: #667383; padding: 8px 0; cursor: pointer; position: relative;
}
.sub-tab-item.active { color: #0278E7; font-weight: 500; }
.sub-tab-item.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background-color: #0278E7;
}
</style>