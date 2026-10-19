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
        <!-- ⭐ 全屏切换按钮 -->
        <button type="button" class="icon-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="$emit('toggle-fullscreen')">
          <svg v-if="!isFullscreen" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
        </button>
        <button type="button" class="report-btn" @click="$emit('generate-report')">
          <svg viewBox="0 0 16 16" class="report-icon"><rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>
          报告/函件生成
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
  isFullscreen: { type: Boolean, default: false } // ⭐ 接收全屏状态
})

defineEmits([
  'back', 'generate-report', 'toggle-fullscreen', // ⭐ 新增抛出全屏事件
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
.detail-panel {
  position: relative;
  bottom:20px;
  height:90%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* 默认宽度 780px */
  width: 780px; 
  max-width: 100%;
  max-height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  color: #303133;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* ⭐ 全屏状态 */
.detail-panel.is-fullscreen {
  position: fixed;
  /* left: 130px; 避开左上角的按钮 */
  right: 12px;
  bottom: 20px;
  width: 50%;
  height:90%;
  max-height: none;
  z-index: 99;
}

.collapse-btn {
  position: absolute;
  top: 50%;
  left: -14px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 44px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #606266;
  background: #fff;
  transform: translateY(-50%);
}
.collapse-btn:hover { color: #1677ff; border-color: #1677ff; }
.chevron { width: 14px; height: 14px; }

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(235, 238, 245, 0.8);
}
.header-left { flex: 1; }
.project-name { color: #1f2d3d; font-size: 17px; font-weight: 600; }
.project-company {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
}
.company-icon { width: 12px; height: 12px; }

.header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover { color: #1677ff; border-color: #1677ff; }

.report-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  background: #1677ff;
  font-size: 12px;
  white-space: nowrap;
}
.report-btn:hover { background: #4096ff; }
.report-icon { width: 12px; height: 12px; }

.main-tabs {
  display: flex;
  padding: 0 20px;
  border-bottom: 1px solid rgba(235, 238, 245, 0.8);
  background-color: rgba(255, 255, 255, 0.7);
}
.main-tab {
  padding: 12px 14px;
  border: none;
  background: none;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.main-tab:hover { color: #1677ff; }
.main-tab.active { color: #1677ff; border-bottom-color: #1677ff; font-weight: 600; }

/* 全屏时主 Tab 均匀分布 */
.detail-panel.is-fullscreen .main-tabs { justify-content: space-around; }
.detail-panel.is-fullscreen .main-tab { flex: 1; text-align: center; }

.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0);
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.tab-content::-webkit-scrollbar { display: none; }
</style>