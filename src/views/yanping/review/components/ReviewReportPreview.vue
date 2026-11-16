<template>
  <div v-if="visible" class="report-preview-container">
    <!-- 左侧地图区域 -->
    <div class="left-map-panel" :class="{ 'is-collapsed': isCollapsed }">
      <!-- 💡 传入空底图样式并监听 ready 事件 -->
      <MapGL 
        ref="mapRef" 
        :is-dashboard="false" 
        :fly-to-on-load="false" 
        :style="emptyMapStyle" 
        @ready="onMapReady" 
      />
      
      <!-- 💡 图层控制面板 -->
      <LayerChipPanel
        :visible-ids="layerVisibleIds"
        :inputs="layerInputs"
        @toggle="onLayerToggle"
        @input-change="onLayerInputChange"
      />

      <!-- 折叠按钮 -->
      <div class="collapse-trigger" @click="toggleCollapse">
        <el-icon>
          <ArrowLeft v-if="!isCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </div>
    </div>

    <!-- 右侧报告区域 -->
    <div class="right-report-panel">
      <!-- 顶部 Header -->
      <div class="report-header">
        <div class="header-left">
          <el-button link class="back-btn" @click="handleClose">
            <el-icon><Back /></el-icon>
          </el-button>
          <span class="report-title">文件预览</span>
        </div>
        <div class="header-right">
          <el-button link type="primary" :disabled="!hasGenerated" @click="handlePrint">
            打印
          </el-button>
          <el-button link type="primary" :disabled="!hasGenerated" @click="handleDownload">
            下载所有文件
          </el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="report-body" v-loading="loading" element-loading-text="正在生成报告预览...">
        <div v-if="!hasGenerated && !loading" class="empty-tip">
          暂无报告数据
        </div>
        <div class="word-wrapper" v-show="hasGenerated">
          <div ref="wordContainer" class="docx-preview-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue'
import { Back, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { renderAsync } from 'docx-preview'

import MapGL from '@/components/MapGL.vue'
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'

// 💡 引入查询接口
import { getIntelligentReviewReportCalc } from '@/api/modules/report' 

const props = defineProps({
  visible: { type: Boolean, default: false },
  projectRow: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const mapRef = ref(null)
const wordContainer = ref(null)
const isCollapsed = ref(false)
const loading = ref(false)
const hasGenerated = ref(false)
let generatedBlob = null // 保存 Blob 用于下载

// ================== 💡 地图与图层控制逻辑 ==================
const emptyMapStyle = {
  version: 8,
  sources: {},
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#0c1b33' } }
  ]
}

const layerVisibleIds = ref([...DEFAULT_VISIBLE])
const layerInputs = reactive({})
let whlnPlugin = null

const onMapReady = () => {
  const map = mapRef.value?.getMap?.()
  if (!map) return

  try {
    whlnPlugin = attachSxLayers(map, { 
      initialVisibleIds: layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)) 
    })
    whlnPlugin.subscribe?.((ids) => { 
      layerVisibleIds.value = [
        ...layerVisibleIds.value.filter((id) => !WHLN_LAYER_IDS.includes(id)), 
        ...ids
      ] 
    })
  } catch (err) {
    console.warn('[whln] 图层控制挂载失败:', err)
  }
}

const onLayerToggle = (item) => {
  const isOn = layerVisibleIds.value.includes(item.id)
  const nextOn = !isOn

  if (isOn) {
    layerVisibleIds.value = layerVisibleIds.value.filter((id) => id !== item.id)
  } else {
    layerVisibleIds.value = [...layerVisibleIds.value, item.id]
  }

  const map = mapRef.value?.getMap()
  if (!map) return

  if (item.type === 'whln') {
    whlnPlugin?.setVisibleIds?.(
      layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id))
    )
    return
  }
}

const onLayerInputChange = ({ id, value }) => {
  layerInputs[id] = value
}

// ================== 报告预览核心逻辑 ==================
const fetchAndRenderReport = async () => {
  loading.value = true
  hasGenerated.value = false
  try {
    // 使用列表原始数据中的两个业务 ID 获取报告模板填充参数
    const aiProjectId = props.projectRow?.aiProjectId
    const reviewProjectId = props.projectRow?.reviewProjectId

    if (!aiProjectId || !reviewProjectId) {
      throw new Error('缺少 aiProjectId 或 reviewProjectId，无法获取智能评审报告参数')
    }

    const res = await getIntelligentReviewReportCalc({
      aiProjectId,
      reviewProjectId,
    })

    if (res?.code !== 200 && res?.code !== 0) {
      throw new Error(res?.msg || '获取智能评审报告参数失败')
    }

    // 新接口 data 本身就是模板变量对应的填充对象，无需再解析 reportParamResult
    const fillData = res?.data && typeof res.data === 'object' ? res.data : {}

    // 模板渲染
    await renderTemplate(fillData)

  } catch (error) {
    console.error('获取或渲染报告失败:', error)
    ElMessage.error(error?.message || '获取报告数据失败')
  } finally {
    loading.value = false
  }
}

// 接口返回的键名形如 "${reportName}"，而 docxtemplater 的 tag 名为 "reportName"。
// 因此在渲染前去掉接口键名外围的模板分隔符，避免键名不匹配导致占位符原样显示。
const normalizeTemplateData = (data = {}) => {
  return Object.entries(data).reduce((result, [key, value]) => {
    const normalizedKey = key.startsWith('${') && key.endsWith('}')
      ? key.slice(2, -1)
      : key

    result[normalizedKey] = value ?? ''
    return result
  }, {})
}

const renderTemplate = async (data) => {
  // 读取 public 目录下的模板文件
  const res = await fetch('/templates/feasibility-review.docx')
  if (!res.ok) throw new Error('报告模板加载失败，请检查 feasibility-review.docx 是否存在')

  const buf = await res.arrayBuffer()
  const zip = new PizZip(buf)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '${', end: '}' },
    nullGetter: () => '',
  })

  // 将接口的 "${变量名}" 转成 docxtemplater 实际使用的变量名
  const templateData = normalizeTemplateData(data)
  console.log('[智能评审报告] 模板填充字段：', Object.keys(templateData))
  doc.render(templateData)

  // 生成 blob
  generatedBlob = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

  // 预览
  await nextTick()
  if (!wordContainer.value) throw new Error('报告预览容器尚未准备完成')

  wordContainer.value.innerHTML = ''
  await renderAsync(generatedBlob, wordContainer.value, null, {
    className: 'docx-preview',
    inWrapper: true,
    ignoreWidth: false,
    breakPages: true,
  })
  hasGenerated.value = true
}

// ================== 监听与交互 ==================
watch(
  () => props.visible,
  async (val) => {
    if (val && props.projectRow) {
      // 延迟一下等待地图容器和DOM渲染完成
      setTimeout(() => {
        if (mapRef.value?.getMap()) mapRef.value.getMap().resize()
      }, 300)
      await fetchAndRenderReport()
    }
  },
  { immediate: true }
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  setTimeout(() => {
    if (mapRef.value?.getMap()) mapRef.value.getMap().resize()
  }, 320)
}

const handleClose = () => {
  emit('close')
}

const handlePrint = () => {
  const style = document.createElement('style')
  style.innerHTML = `
    @media print {
      body * { visibility: hidden; }
      .right-report-panel, .right-report-panel * { visibility: visible; }
      .right-report-panel { position: absolute; left: 0; top: 0; width: 100%; }
      .report-header { display: none !important; }
      .report-body { overflow: visible !important; }
    }
  `
  document.head.appendChild(style)
  window.print()
  document.head.removeChild(style)
}

const handleDownload = () => {
  if (!generatedBlob) return ElMessage.warning('暂无文件可下载')
  const url = URL.createObjectURL(generatedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `可研审查报告_${props.projectRow.projectName || '项目'}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

onUnmounted(() => {
  whlnPlugin?.destroy?.()
  whlnPlugin = null
  generatedBlob = null
})
</script>

<style scoped>
.report-preview-container {
  position: absolute; /* 💡 基于 .log-root 绝对定位 */
  inset: 0;           /* 💡 铺满当前父容器 */
  z-index: 10;        /* 💡 盖住同级的背景层 */
  display: flex;
  background: #fff;
  overflow: hidden;
}

/* ===== 左侧地图 ===== */
.left-map-panel {
  position: relative;
  width: 50%;
  height: 100%;
  transition: width 0.3s ease;
  background: #0c1b33;
  z-index: 10;
}
.left-map-panel.is-collapsed {
  width: 0;
}

/* ======== 💡 修复地图视图控件位置（2D/3D 等按钮） ======== */
:deep(.maplibregl-ctrl-bottom-left) {
  display: block !important;
  left: 16px !important;
  bottom: 80px !important; /* 抬高按钮，避开底部的图层面板 */
  z-index: 20 !important;
}

.collapse-trigger {
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-left: none;
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  z-index: 11;
  color: #909399;
  transition: all 0.3s;
}
.collapse-trigger:hover {
  color: #2f8dff;
  background: #f7faff;
}

/* ===== 右侧报告 ===== */
.right-report-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #f5f7fa;
}

.report-header {
  height: 48px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  font-size: 18px;
}
.report-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 16px;
}

.report-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
  position: relative;
}

.empty-tip {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.word-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.docx-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f7fa;
}

/* docx-preview 样式覆盖 */
:deep(.docx-wrapper) {
  background: #f5f7fa !important;
  padding: 20px 0 !important;
}
:deep(.docx-wrapper > section.docx) {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px !important;
  background: #fff;
}
</style>