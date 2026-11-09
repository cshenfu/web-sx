<!-- components/report-wizard/ReportWizard.vue -->
<template>
  <div class="report-wizard-container">
    <!-- 左侧面板 -->
    <div class="left-panel" :class="{ 'is-collapsed': isCollapsed }">
      <div class="panel-header">
        <div class="title-area" v-show="!isCollapsed">
          <el-icon class="back-btn" @click="$emit('close')"><Back /></el-icon>
          <span class="title">{{ titleText }}</span>
        </div>
      </div>

      <div class="step-component" v-show="!isCollapsed">
        <div
          v-for="(step, index) in visibleSteps"
          :key="step.key"
          class="step-item"
          :class="[
            index === 0 ? (currentStep === 0 ? 'step-one-active' : '') : '',
            index === 1 ? (currentStep === 1 ? 'step-two-active' : 'step-two') : '',
            index === 2 ? (currentStep === 2 ? 'step-three-active' : 'step-three') : ''
          ]"
          @click="currentStep = index"
        >
          <span>{{ index + 1 }}.</span>{{ step.label }}
        </div>
      </div>

      <div class="panel-body" v-show="!isCollapsed">
        <el-scrollbar>
          <div class="form-wrapper">
            <StepOne
              v-if="currentStep === 0"
              :create-project-mode="createProjectMode"
              :initial-project-name="resolvedProjectName"
              :project="workingProject"
              @map-data-updated="renderMapLayers"
              @save-draft="(payload) => handleSaveDraft(0, payload)"
              @next="(payload) => handleNext(0, payload)"
            />
            <StepTwo
              v-else-if="currentStep === 1"
              :create-project-mode="createProjectMode"
              :project="workingProject"
              @prev="currentStep = 0"
              @save-draft="(data) => handleSaveDraft(1, data)"
              @next="(data) => handleNext(1, data)"
            />
            <StepThree
              v-else-if="currentStep === 2 && maxStep >= 2"
              :create-project-mode="createProjectMode"
              :project="workingProject"
              @prev="currentStep = 1"
              @save-draft="(data) => handleSaveDraft(2, data)"
              @submit="handleSubmit"
            />
          </div>
        </el-scrollbar>
      </div>

      <div class="collapse-trigger" @click="toggleCollapse">
        <el-icon>
          <ArrowLeft v-if="!isCollapsed" />
          <ArrowRight v-else />
        </el-icon>
      </div>
    </div>

    <!-- 右侧地图 -->
    <div class="right-map-area">
      <MapGL 
        ref="mapRef" 
        :is-dashboard="false" 
        :fly-to-on-load="false" 
        :view-controls="true"
        view-controls-position="bottom-left"
        :style="emptyMapStyle" 
        @ready="onMapReady"
      />
      
      <LayerChipPanel
        :visible-ids="layerVisibleIds"
        :inputs="layerInputs"
        @toggle="onLayerToggle"
        @input-change="onLayerInputChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, reactive, onUnmounted, nextTick } from 'vue'
import { Back, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import StepOne from './steps/StepOne.vue'
import StepTwo from './steps/StepTwo.vue'
import StepThree from './steps/StepThree.vue'
import { PACKAGE_TYPE } from '../../js/Reportwizardmockdata'

import MapGL from '@/components/MapGL.vue'
import LayerChipPanel from '@/components/site-map/LayerChipPanel.vue'
import { WHLN_LAYER_IDS, DEFAULT_VISIBLE } from '@/components/site-map/layerPanelConfig'
import { attachSxLayers } from '@/components/site-map/attachSxLayers'

import { ICON_SIZE_WIND, ICON_SIZE_BOOSTER } from '@/components/site-map/iconSize.js'
import fengjiIcon from '@/assets/img/mapIcon/fengji.png'
import fengjiBxIcon from '@/assets/img/mapIcon/fengji-bx.png'
import shengyazhanIcon from '@/assets/img/mapIcon/syz.png'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  projectName: { type: String, default: '' },
  project: { type: Object, default: () => null },
  title: { type: String, default: '' },
  maxStep: { type: Number, default: 2 },
})

const emit = defineEmits(['close', 'save-draft', 'submit'])

const steps = [
  { key: 'basic', label: '项目基本信息' },
  { key: 'condition', label: '项目建设条件' },
  { key: 'invest', label: '项目投资设置' },
]

const visibleSteps = computed(() => steps.slice(0, Math.min(props.maxStep, steps.length - 1) + 1))
const currentStep = ref(0)
const collectedData = ref({})

function resolveSxProjectId(project) {
  if (!project) return 0
  const raw = project.sxProjectId ?? project.id
  console.log(raw,"rawrawrawrawrawraw")
  if (raw === '' || raw === null || raw === undefined) return 0
  return String(raw)
}

const ENTRY_SX_PROJECT_ID = resolveSxProjectId(props.project)

const workingProject = ref({
  ...(props.project || {}),
  id: props.project?.id ? String(props.project.id) : undefined,
  sxProjectId: ENTRY_SX_PROJECT_ID,
})

watch(
  () => props.project,
  (value) => {
    if (!value) return
    const { id: _id, sxProjectId: _sx, ...rest } = value
    workingProject.value = {
      ...workingProject.value,
      ...rest,
    }
  },
  { deep: true }
)

const resolvedProjectName = computed(
  () => props.projectName || props.project?.name || props.project?.projectName || ''
)

const modeLabel = computed(() => {
  if (props.createProjectMode === PACKAGE_TYPE.distributedDefault) return '分散式'
  if (props.createProjectMode === PACKAGE_TYPE.baseDefault) return '基地项目'
  return '集中式'
})

const titleText = computed(() => {
  if (props.title) return props.title
  return `一键生成风电场可行性研究报告（${modeLabel.value}）`
})

// ================== 💡 地图渲染逻辑 ==================
const isCollapsed = ref(false)
const mapRef = ref(null)
let whlnPlugin = null

const emptyMapStyle = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#0c1b33' } }]
}

const layerVisibleIds = ref([...DEFAULT_VISIBLE])
const layerInputs = reactive({})

const LAYER_WIND_NORMAL = 'proj-wind-all'
const LAYER_WIND_RESERVE = 'proj-wind-bx-all'
const LAYER_BOOSTER = 'proj-booster-all'

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  setTimeout(() => {
    if (mapRef.value?.getMap()) mapRef.value.getMap().resize()
  }, 320)
}

const onMapReady = () => {
  const map = mapRef.value?.getMap?.()
  window.__map = map
  if (!map) return

  setTimeout(() => map.resize(), 100)
  setTimeout(() => map.resize(), 500) 

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

  // 💡 初始化画图：当 MapGL 准备好后，主动根据当前引用的项目数据渲染一次
  if (props.project) {
    const fieldPoints = props.project.coordinate || props.project.rawProject?.coordinate || []
    const fanPoints = props.project.windTurbinePoints || props.project.rawProject?.windTurbinePoints || []
    const boosterPoints = props.project.boosterStationLocations || props.project.rawProject?.boosterStationLocations || []
    console.log('[onMapReady 补渲染] fan =', fanPoints.length, 'at', Date.now())
    if (fieldPoints.length || fanPoints.length || boosterPoints.length) {
      renderMapLayers({
        coordinate: Array.isArray(fieldPoints) ? fieldPoints : [],
        windTurbinePoints: Array.isArray(fanPoints) ? fanPoints : [],
        boosterStationLocations: Array.isArray(boosterPoints) ? boosterPoints : []
      })
    }
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
    whlnPlugin?.setVisibleIds?.(layerVisibleIds.value.filter((id) => WHLN_LAYER_IDS.includes(id)))
    return
  }

  const layerMap = {
    'area': ['proj-boundary'],
    'wind': [LAYER_WIND_NORMAL, LAYER_WIND_RESERVE],
    'booster': [LAYER_BOOSTER]
  }

  const layerIds = layerMap[item.id] || []
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', nextOn ? 'visible' : 'none')
    }
  })
}

const onLayerInputChange = ({ id, value }) => {
  layerInputs[id] = value
}

// 💡 接收 StepOne 传来的数据并绘图
const renderMapLayers = async (data) => {
   console.log('[renderMapLayers] fan =', data?.windTurbinePoints?.length, 'at', Date.now())
  if (!mapRef.value) return
  const map = mapRef.value

  // 清除旧图层
  map.removeLayer('proj-boundary')
  map.removeLayer(LAYER_WIND_NORMAL)
  map.removeLayer(LAYER_WIND_RESERVE)
  map.removeLayer(LAYER_BOOSTER)

  const { coordinate = [], windTurbinePoints = [], boosterStationLocations = [] } = data || {}

  try {
    await Promise.all([
      map.ensureImage('icon-fengji', fengjiIcon),
      map.ensureImage('icon-fengji-bx', fengjiBxIcon),
      map.ensureImage('icon-shengyazhan', shengyazhanIcon),
    ])
  } catch (err) {
    console.warn('地图图标加载失败:', err)
  }

  // 1. 场区 (面)
  if (coordinate.length > 0) {
    const coords = coordinate.map(item => [Number(item.longitude), Number(item.latitude)])
      .filter(c => Number.isFinite(c[0]) && Number.isFinite(c[1]))
      
    if (coords.length >= 3) {
      if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0])
      }
      map.addPolygon({
        id: 'proj-boundary',
        geojson: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} },
        color: '#2A9FFF', opacity: 0.2, outlineColor: '#2A9FFF', outlineWidth: 2
      })
      // 飞行到中心点
      let lng = 0, lat = 0
      coords.forEach(c => { lng += c[0]; lat += c[1] })
      if (map.getMap()) map.getMap().flyTo({ center: [lng / coords.length, lat / coords.length], zoom: 11, pitch: 0, duration: 1500 })
    }
  }

  // 2. 风机
  if (windTurbinePoints.length > 0) {
    const normalFeatures = []
    const reserveFeatures = []

    windTurbinePoints.forEach((pt, index) => {
      const lng = Number(pt.longitude ?? pt.lng ?? pt.x)
      const lat = Number(pt.latitude ?? pt.lat ?? pt.y)
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
      
      const isReserve = Number(pt.isReserve) === 1
      const feature = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { index, isReserve: isReserve ? 1 : 0 }
      }
      
      if (isReserve) reserveFeatures.push(feature)
      else normalFeatures.push(feature)
    })

    if (normalFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_WIND_NORMAL, geojson: { type: 'FeatureCollection', features: normalFeatures }, iconId: 'icon-fengji', iconUrl: fengjiIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom' })
    }
    if (reserveFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_WIND_RESERVE, geojson: { type: 'FeatureCollection', features: reserveFeatures }, iconId: 'icon-fengji-bx', iconUrl: fengjiBxIcon, iconSize: ICON_SIZE_WIND, iconAnchor: 'bottom' })
    }
  }

  // 3. 升压站
  if (boosterStationLocations.length > 0) {
    const bestFeatures = boosterStationLocations
      .filter(pt => pt.isBest === true || Number(pt.isBest) === 1)
      .map((pt, index) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [Number(pt.lng ?? pt.longitude ?? pt.x), Number(pt.lat ?? pt.latitude ?? pt.y)] },
        properties: { index, isBest: 1 }
      }))
      .filter((feature) => feature.geometry.coordinates.every(Number.isFinite))

    if (bestFeatures.length > 0) {
      await map.addImagePoints({ id: LAYER_BOOSTER, geojson: { type: 'FeatureCollection', features: bestFeatures }, iconId: 'icon-shengyazhan', iconUrl: shengyazhanIcon, iconSize: ICON_SIZE_BOOSTER, iconAnchor: 'bottom' })
    }
  }

  // 恢复显隐
  const layerMap = {
    'area': ['proj-boundary'],
    'wind-gh': [LAYER_WIND_NORMAL, LAYER_WIND_RESERVE],
    'booster': [LAYER_BOOSTER]
  }
  
  Object.keys(layerMap).forEach(key => {
    const layerIds = layerMap[key]
    const visible = layerVisibleIds.value.includes(key)
    if (map.getMap()) {
      layerIds.forEach(layerId => {
        if (map.getMap().getLayer(layerId)) {
          map.getMap().setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
        }
      })
    }
  })
}

onUnmounted(() => {
  whlnPlugin?.destroy?.()
  whlnPlugin = null
})

// ================== 原有向导逻辑 ==================
function handleSaveDraft(stepIndex, data) {
  collectedData.value[stepIndex] = data
  updateWorkingProject(data)
  emit('save-draft', { step: stepIndex, data: { ...collectedData.value }, project: workingProject.value })
}

function handleNext(stepIndex, data) {
  collectedData.value[stepIndex] = data
  updateWorkingProject(data)

  const lastStepIndex = Math.min(props.maxStep, steps.length - 1)
  if (stepIndex >= lastStepIndex) {
    emit('submit', { data: { ...collectedData.value }, project: workingProject.value })
    return
  }
  currentStep.value = Math.min(stepIndex + 1, steps.length - 1)
}

function handleSubmit(data) {
  collectedData.value[currentStep.value] = data
  updateWorkingProject(data)
  emit('submit', { data: { ...collectedData.value }, project: workingProject.value })
}

function updateWorkingProject(data) {
  if (!data) return
  const { savedProjectId, form } = data
  const preservedSxProjectId = workingProject.value.sxProjectId

  workingProject.value = {
    ...workingProject.value,
    ...(form && typeof form === 'object' ? form : {}),
    ...(savedProjectId ? { id: savedProjectId } : {}),
    sxProjectId: preservedSxProjectId,
  }
}
</script>

<style scoped>
/* 样式与上一版完全一致，没有任何改动 */
.report-wizard-container { position: fixed; top: 65px; left: 0; right: 0; bottom: 0; z-index: 2000; display: flex; background-color: #f5f7fa; overflow: hidden; }
.left-panel { position: relative; width: 40%; height: 100%; background: #fff; display: flex; flex-direction: column; box-shadow: 2px 0 8px rgba(0,0,0,0.05); z-index: 10; transition: width 0.3s ease; }
.left-panel.is-collapsed { width: 0; border-right: none; box-shadow: none; }
.left-panel.is-collapsed .panel-header, .left-panel.is-collapsed .step-component, .left-panel.is-collapsed .panel-body { display: none !important; }
.panel-header { display: flex; align-items: center; padding: 16px; border-bottom: 1px solid #ebeef5; white-space: nowrap; height: 64px; box-sizing: border-box; }
.title-area { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.back-btn { font-size: 20px; cursor: pointer; color: #2f8dff; flex-shrink: 0; }
.title { font-size: 16px; font-weight: 600; color: #303133; }
.panel-body { flex: 1; overflow: hidden; }
.form-wrapper { padding: 24px; }
.collapse-trigger { position: absolute; top: 50%; right: -24px; transform: translateY(-50%); width: 24px; height: 48px; background: #fff; border: 1px solid #ebeef5; border-left: none; border-radius: 0 6px 6px 0; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 2px 0 8px rgba(0,0,0,0.05); z-index: 11; color: #909399; transition: all 0.3s; }
.collapse-trigger:hover { color: #2f8dff; background: #f7faff; }
.step-component { display: flex; align-items: center; justify-content: center; margin: 16px 0 24px 0; zoom: 0.9; }
.step-component .step-item { max-width: 285px; min-width: 236px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #5c6170; margin-left: -18px; font-weight: bold; }
.step-component .step-item:first-child { margin-left: 0; }
.step-component .step-item span { margin: 0 8px; }
.step-component .step-one-active { background: url(@/assets/img/step/step-one-active.png) no-repeat; background-size: 100% 100%; color: #ffffff; cursor: pointer; }
.step-component .step-two { background: url(@/assets/img/step/step-two.png) no-repeat; background-size: 100% 100%; margin-left: -12px; }
.step-component .step-two-active { background: url(@/assets/img/step/step-two-active.png) no-repeat; background-size: 100% 100%; color: #ffffff; margin-left: -12px; cursor: pointer; }
.step-component .step-three { background: url(@/assets/img/step/step-three.png) no-repeat; background-size: 100% 100%; margin-left: -12px; }
.step-component .step-three-active { background: url(@/assets/img/step/step-three-active.png) no-repeat; background-size: 100% 100%; color: #ffffff; margin-left: -12px; cursor: pointer; }
.right-map-area { flex: 1; height: 100%; position: relative; background: #0c1b33; }
:deep(.maplibregl-ctrl-bottom-left) { display: block !important; left: 16px !important; bottom: 80px !important; z-index: 20 !important; }
</style>