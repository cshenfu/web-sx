<!-- components/area-panel/ProjectDetailPanel.vue -->
<template>
  <section class="detail-panel" :class="{ 'is-fullscreen': isFullscreen }">
    <button type="button" class="collapse-btn" title="返回列表" @click="$emit('back')">
      <svg viewBox="0 0 16 16" class="chevron"><path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>

    <header class="detail-header">
      <div class="header-left">
        <div class="project-name">{{ project.name }}</div>
        <div class="project-company">
          <svg viewBox="0 0 16 16" class="company-icon"><path d="M3 13.5V4l5-2 5 2v9.5M6 13.5v-3h4v3" fill="none" stroke="currentColor" stroke-width="1.1"/></svg>
          所属公司：{{ project.company || '-' }}
        </div>
      </div>
      <div class="header-right">
        <!-- 全屏切换按钮 -->
        <button type="button" class="icon-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="$emit('toggle-fullscreen')">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
        </button>
        <button type="button" class="report-btn" @click="$emit('generate-report')">
          <svg viewBox="0 0 16 16" class="report-icon"><rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
          报告 / 函件生成
        </button>
      </div>
    </header>

    <nav class="main-tabs">
      <button
        v-for="tab in mainTabs"
        :key="tab.key"
        type="button"
        class="main-tab"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="tab-content">
      <MainInfoTab v-if="activeTab === 'main'" :data="project.mainInfo" />
      
      <SurveyInfoTab
        v-else-if="activeTab === 'survey'"
        v-loading="surveyLoading"
        :data="surveyData"
        @add-data="handleSurveyAddData"
        @file-action="handleSurveyFileAction"
        @file-click="handleSurveyFileClick"
      />
      
      <SupportDocsTab
        v-else-if="activeTab === 'support'"
        :data="project.supportDocs"
        @add-data="$emit('support-add-data')"
        @file-action="(...args) => $emit('support-file-action', ...args)"
      />
      
      <ProjectReportTab
        v-else-if="activeTab === 'report'"
        :project="project"
        @row-action="(row) => $emit('report-row-action', row)"
      />
      
      <ReviewInfoTab v-else-if="activeTab === 'review'" :data="project.reviewInfo" />
    </div>

    <AddDataDialog
      v-model:visible="addDialogVisible"
      :ai-project-id="project.id"
      :data-category="addDialogCategory"
      :section-title="addDialogTitle"
      :coordinate-list="dialogCoordinateList"
      :cft-point-list="dialogCftPointList"
      @success="refreshSurveyData"
    />

    <AddImageDialog
      v-model:visible="addImageDialogVisible"
      :tower-file-id="addImageTowerFileId"
      :tower-file-name="addImageTowerFileName"
      @success="refreshSurveyData"
    />
  </section>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MainInfoTab from './tabs/MainInfoTab.vue'
import SurveyInfoTab from './tabs/SurveyInfoTab.vue'
import SupportDocsTab from './tabs/SupportDocsTab.vue'
import ProjectReportTab from './tabs/ProjectReportTab.vue'
import ReviewInfoTab from './tabs/ReviewInfoTab.vue'
import AddDataDialog from './AddDataDialog.vue'
import AddImageDialog from './AddImageDialog.vue'
import { getDataById, delItem } from '@/api/modules/newAPI'
import { useRouter } from 'vue-router'

const props = defineProps({
  project: { type: Object, required: true },
  isFullscreen: { type: Boolean, default: false }
})

defineEmits([
  'back', 'generate-report', 'toggle-fullscreen',
  'survey-add-data', 'survey-file-action',
  'support-add-data', 'support-file-action',
  'report-row-action',
])

const router = useRouter()

const mainTabs = [
  { key: 'main', label: '主要信息' },
  { key: 'survey', label: '勘测信息' },
  { key: 'support', label: '支持性文件' },
  { key: 'report', label: '项目报告' },
  { key: 'review', label: '审查信息' },
]

const activeTab = ref('main')

const SURVEY_SECTIONS = [
  { key: 'terrain', title: '地形信息', dataCategory: 'TERRAIN' },
  { key: 'wind', title: '测风信息', dataCategory: 'WIND' },
  { key: 'environment', title: '环保数据', dataCategory: 'ENVIRONMENT' },
  { key: 'waterConservancy', title: '水保数据', dataCategory: 'WATER_CONSERVANCY' },
  { key: 'verification', title: '核查信息', dataCategory: 'VERIFICATION' },
]

const FILE_TAG_TO_PATH = {
  GEOLOGY_REPORT: '/hucang/geology/detail',
  SITE_TERRAIN_MAP: '/hucang/geology/detail',
  WIND_TOWER: '/hucang/windTower/detail',
  WIND_TOWER_IMAGE: '/hucang/windTower/detail',
  EIA_REPORT: '/hucang/environment/detail',
  SOIL_WATER_REPORT: '/hucang/waterConservayion/detail',
}

function handleSurveyFileClick(file) {
  const raw = file?._raw || file || {}
  const parseStatus = raw.parseStatus ?? file?.parseStatus
  const isParseType = parseStatus !== null && parseStatus !== undefined && parseStatus !== ''
  if (isParseType && parseStatus !== 'SUCCESS') { ElMessage.warning('请等待解析成功'); return }
  const tag = raw.fileTypeTag || file?.tag
  const path = FILE_TAG_TO_PATH[tag]
  if (!path) { console.warn('[ProjectDetailPanel] 未配置跳转 path 的 fileTypeTag:', tag); return }
  router.push({ path, query: { id: props.project.id } })
}

const surveyData = ref({ sections: [] })
const surveyLoading = ref(false)
const addDialogVisible = ref(false)
const addDialogCategory = ref('')
const addDialogTitle = ref('')
const addImageDialogVisible = ref(false)
const addImageTowerFileId = ref(null)
const addImageTowerFileName = ref('')

const PARSE_STATUS_MAP = {
  UPLOADED: { text: '待解析', type: 'pending' },
  PARSING: { text: '解析中', type: 'running' },
  SUCCESS: { text: '解析成功', type: 'success' },
  FAILED: { text: '解析失败', type: 'failed' },
}

const dialogCoordinateList = computed(() => [])
const dialogCftPointList = computed(() => [])

function mapSurveyResponseToSections(raw) {
  const groups = Array.isArray(raw) ? raw : []
  const grouped = {}
  groups.forEach((g) => { grouped[g.dataCategory] = g.fileList || [] })
  return SURVEY_SECTIONS.map((s) => ({
    key: s.key, title: s.title, files: (grouped[s.dataCategory] || []).map((item) => mapFileItem(item)), emptyText: '暂无数据~',
  }))
}

function mapFileItem(item) {
  const isWindTower = item.fileTypeTag === '测风塔' || item.fileTypeTag === 'WIND_TOWER'
  const actions = ['download']
  if (isWindTower) actions.push('addImage')
  actions.push('delete')
  const parse = PARSE_STATUS_MAP[item.parseStatus]
  return {
    id: item.id, name: item.fileName || '', tag: item.fileTypeTag || '', tag2: parse?.text || '', description: item.notes || '', updatedAt: item.createTime || item.updateTime || '', operator: item.creator || item.updater || '', filePath: item.filePath || '', fileSuffix: item.fileSuffix || '', parseStatus: item.parseStatus,
    imageList: (item.imageList || []).map((img) => ({ id: img.id, fileName: img.fileName || '', filePath: img.filePath || '', fileSuffix: img.fileSuffix || '' })).filter((img) => img.filePath),
    actions, _raw: item,
  }
}

async function refreshSurveyData() {
  if (!props.project?.id) return
  surveyLoading.value = true
  try {
    const res = await getDataById(props.project.id)
    surveyData.value = { sections: mapSurveyResponseToSections(res?.data ?? []) }
  } catch (err) {
    console.error('获取勘测数据失败:', err)
    surveyData.value = { sections: SURVEY_SECTIONS.map((s) => ({ key: s.key, title: s.title, files: [], emptyText: '暂无数据~' })) }
  } finally { surveyLoading.value = false }
}

function handleSurveyAddData(sectionKey) {
  const section = SURVEY_SECTIONS.find((s) => s.key === sectionKey)
  if (!section) return
  addDialogCategory.value = section.dataCategory
  addDialogTitle.value = section.title
  addDialogVisible.value = true
}

function handleSurveyFileAction(action, file, sectionKey) {
  const raw = file?._raw || file || {}
  const fileId = raw.id ?? file?.id
  const filePath = raw.filePath || file?.filePath
  if (action === 'download') {
    if (!filePath) { ElMessage.warning('该文件缺少下载路径'); return }
    window.open(filePath, '_blank'); return
  }
  if (action === 'addImage') {
    if (!fileId) return
    addImageTowerFileId.value = fileId
    addImageTowerFileName.value = raw.fileName || file?.name || ''
    addImageDialogVisible.value = true; return
  }
  if (action === 'delete') {
    if (!fileId) return
    ElMessageBox.confirm('确认删除该文件吗？', '提示', { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' })
      .then(async () => { await delItem(fileId); ElMessage.success('删除成功'); refreshSurveyData() })
      .catch(() => {})
    return
  }
  if (action === 'edit') ElMessage.info('编辑功能待接入')
}

onMounted(refreshSurveyData)
watch(() => props.project?.id, (id) => { if (id) refreshSurveyData() })
</script>

<style scoped>
/* ================= 最外层玻璃质感外框 ================= */
.detail-panel {
  position: relative;
  bottom: 20px;
  height: 90%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 779px; 
  max-width: 100%;
  max-height: 100%;
  padding: 16px 0px 24px 0px;
  gap: 16px;
  
  /* 你提供的长串线性渐变背景 */
  background: linear-gradient(149.65deg, rgba(255, 255, 255, 0.2) 4.61%, rgba(255, 255, 255, 0.15) 29.07%, rgba(255, 255, 255, 0.3) 49.01%, rgba(255, 255, 255, 0.1) 61.4%, rgba(255, 255, 255, 0.2) 74.74%, rgba(255, 255, 255, 0.22) 97.19%);
  
  /* 毛玻璃与边框 */
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  
  /* 设计稿指定的双层阴影 */
  box-shadow: 5px 5px 0px rgba(207, 234, 255, 0.5), -10px 0px 30px rgba(0, 0, 0, 0.1);
  
  color: #303133;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* 🌟 关键：禁止最外层出现滚动条，所有滚动交给内部 content */
  overflow: hidden; 
}

/* ⭐ 全屏状态 */
.detail-panel.is-fullscreen {
  position: fixed;
  right: 12px;
  bottom: 20px;
  width: 50%;
  height: 90%;
  max-height: none;
  z-index: 99;
}

/* ================= 左侧返回按钮 ================= */
.collapse-btn {
  position: absolute;
  top: 50%;
  left: -17px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-50%);
  transition: all 0.2s;
}
.collapse-btn:hover { 
  color: #2563EB; 
  border-color: #2563EB; 
  background: #fff;
}
.chevron { width: 14px; height: 14px; }

/* ================= 头部 ================= */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
}
.header-left { flex: 1; display: flex; flex-direction: column; gap: 2px; }

.project-name { 
  color: #111827; 
  font-size: 24px; 
  font-weight: 700; 
  line-height: 28px;
  letter-spacing: 0.5px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.project-company {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2563EB;
  font-size: 13px;
  font-weight: 400;
  line-height: 16px;
}
.company-icon { width: 14px; height: 14px; }

.header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.3);
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { color: #2563EB; border-color: #2563EB; background: #fff; }

.report-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #FFFFFF;
  background: #2563EB;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
}
.report-btn:hover { background: #1D4ED8; }
.report-icon { width: 14px; height: 14px; }

/* ================= 主 Tab 栏 ================= */
.main-tabs {
  display: flex;
  justify-content: space-between;
  height: 44px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
}

.main-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: #4B5563;
  font-family: 'PingFang SC', 'Inter', sans-serif;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.main-tab:hover { color: #1D4ED8; }

.main-tab.active {
  background: rgba(19, 55, 134, 0.05);
  border-bottom-color: #2563EB;
  color: #1D4ED8;
  font-weight: 500;
}

/* ================= 内容区 ================= */
.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: transparent;
  padding-bottom: 8px;
}

/* 🌟 美化滚动条：极细半透明 */
.tab-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.tab-content::-webkit-scrollbar-track {
  background: transparent;
}
.tab-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
}
.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
/* 兼容 Firefox */
.tab-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
}
</style>