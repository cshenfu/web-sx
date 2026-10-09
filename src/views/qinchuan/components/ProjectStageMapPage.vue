<template>
    <div class="stage-map-page">
      <div class="view-toolbar">
        <div class="view-tabs">
          <button
            class="view-tab"
            :class="{ active: viewMode === 'map' }"
            @click="viewMode = 'map'"
          >
            <el-icon><MapLocation /></el-icon>
            地图模式
          </button>
          <button
            class="view-tab"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
            项目列表
          </button>
        </div>
      </div>
  
      <section v-if="viewMode === 'map'" class="map-view">
        <MapGL ref="mapRef" :style="satelliteStyle" @ready="onMapReady" />
  
        <!-- 默认视图：项目通道概况 -->
        <div v-if="!isAreaView" class="map-summary">
          <div class="summary-title">
            <span>项目通道概况</span>
            <el-icon><Fold /></el-icon>
          </div>
          <div class="summary-location">
            <el-icon><LocationFilled /></el-icon>
            <span>陕西省</span>
            <strong>800/200</strong>
            <small>总容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot wind" />风电项目</span>
            <b>500/155</b>
            <small>容量/数量</small>
          </div>
          <div class="summary-row">
            <span><i class="dot solar" />光伏项目</span>
            <b>300/45</b>
            <small>容量/数量</small>
          </div>
        </div>
  
        <!-- 区域视图：未选中任何区域时的提示 -->
        <div v-else-if="!selectedAreaInfo" class="area-hint-panel">
          <div class="panel-title">区域信息</div>
          <div class="panel-hint">
            当前视野内共 {{ provinceAreaGeoJSON?.features?.length || 0 }} 个区域，点击区域查看详情
          </div>
        </div>
  
        <!-- 区域视图：选中区域后的详情面板（主要信息 / 材料 / 上会） -->
        <AreaDetailPanel
          v-else
          class="area-detail-layer"
          :area="selectedAreaInfo"
          :tabs="tabs"
          :action-label="actionLabel"
          @start-approval="$emit('start-approval', $event)"
        />
  
        <button
          v-if="!isAreaView"
          class="expand-button"
          title="打开项目列表"
          @click="viewMode = 'list'"
        >
          <el-icon><ArrowRight /></el-icon>
        </button>
      </section>
  
      <section v-else class="project-list-view">
        <div class="list-heading">
          <div class="list-title">
            <el-icon><List /></el-icon>
            项目列表
          </div>
        </div>
  
        <SearchBar @search="handleSearch" @reset="handleReset">
          <el-select
            v-model="filters.region"
            placeholder="所属区域"
            size="small"
            clearable
            style="width: 112px"
          >
            <el-option label="陕西省" value="陕西省" />
            <el-option label="西安市" value="西安市" />
            <el-option label="榆林市" value="榆林市" />
            <el-option label="延安市" value="延安市" />
          </el-select>
  
          <el-select
            v-model="filters.type"
            placeholder="项目类型"
            size="small"
            clearable
            style="width: 112px"
          >
            <el-option label="风电项目" value="风电项目" />
            <el-option label="光伏项目" value="光伏项目" />
          </el-select>
  
          <el-input
            v-model="filters.projectNo"
            placeholder="项目编号"
            size="small"
            clearable
            style="width: 145px"
          />
  
          <el-input
            v-model="filters.projectName"
            placeholder="项目名称"
            size="small"
            clearable
            style="width: 145px"
          />
        </SearchBar>
  
        <el-table
          :data="filteredProjects"
          size="small"
          stripe
          class="project-table"
          @row-click="onRowClick"
        >
          <el-table-column prop="projectNo" label="项目编号" min-width="125" />
          <el-table-column prop="projectName" label="项目名称" min-width="205" />
          <el-table-column prop="region" label="项目区域" min-width="150" />
          <el-table-column prop="capacity" label="装机容量MW" width="115" />
          <el-table-column prop="stage" label="阶段" width="100" />
          <el-table-column prop="createdAt" label="创建时间" width="135" />
        </el-table>
  
        <div class="pagination-row">
          <span>共{{ filteredProjects.length }}条</span>
          <el-pagination
            v-model:current-page="currentPage"
            small
            background
            layout="prev, pager, next"
            :page-size="10"
            :total="filteredProjects.length"
          />
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
  import { ArrowRight, Fold, List, LocationFilled, MapLocation } from '@element-plus/icons-vue'
  import MapGL from '@/components/MapGL.vue'
  import SearchBar from '@/components/common/SearchBar.vue'
  import AreaDetailPanel from './AreaDetailPanel.vue'
  import { satelliteStyle, shaanxiBoundary } from '../js/mapConfig'
  import { useProvinceAreaData } from '../js/useProvinceAreaData'
  import { useZoomThresholdSwitch } from '../js/useZoomThresholdSwitch'
  
  const props = defineProps({
    tabs: { type: Array, required: true }, // [{ key, label, component }]，右侧详情面板的 tab 配置
    actionLabel: { type: String, default: '开始立项' },
    // 项目列表 mock 数据，先占位，后续各阶段接自己的接口
    projects: { type: Array, default: () => [] }
  })
  
  defineEmits(['start-approval'])
  
  const AREA_DISPLAY_LAYER_ID = 'stage-map-areas'
  
  const mapRef = ref(null)
  const viewMode = ref('map')
  const currentPage = ref(1)
  const selectedAreaInfo = ref(null)
  
  const filters = reactive({
    region: '',
    type: '',
    projectNo: '',
    projectName: ''
  })
  
  const filteredProjects = computed(() => {
    return props.projects.filter((project) => {
      return (
        (!filters.region || project.region?.includes(filters.region)) &&
        (!filters.type ||
          (filters.type === '风电项目' && project.projectNo?.startsWith('FD')) ||
          (filters.type === '光伏项目' && project.projectNo?.startsWith('GF'))) &&
        (!filters.projectNo || project.projectNo?.includes(filters.projectNo)) &&
        (!filters.projectName || project.projectName?.includes(filters.projectName))
      )
    })
  })
  
  // ---- 区域数据（复用首页/选址页同款分页拉取逻辑）----
  const { provinceAreaGeoJSON, fetchAllProvinceAreaData } = useProvinceAreaData(shaanxiBoundary)
  
  // ---- 缩放阈值切换：放大到阈值后叠加只读区域面 ----
  const { isAreaView, syncByZoom, bindZoomListener, unbindZoomListener } = useZoomThresholdSwitch({
    mapRef,
    onEnter: () => {
      if (provinceAreaGeoJSON.value?.features?.length) {
        mapRef.value.addPolygon({
          id: AREA_DISPLAY_LAYER_ID,
          geojson: provinceAreaGeoJSON.value,
          color: '#2A9FFF',
          opacity: 0.35,
          outlineColor: '#5bd6ff'
        })
      }
    },
    onExit: () => {
      mapRef.value?.removeLayer(AREA_DISPLAY_LAYER_ID)
      selectedAreaInfo.value = null
    }
  })
  
  function onAreaFeatureClick(feature) {
    selectedAreaInfo.value = {
      name: feature.properties?.name || '未命名区域',
      guid: feature.properties?.guid || feature.id || '',
      ...feature.properties
    }
  }
  
  function onMapReady() {
    mapRef.value.addPolygon({
      id: 'stage-shaanxi',
      geojson: shaanxiBoundary,
      color: '#d000ff',
      opacity: 0.22,
      outlineColor: '#ef7bff'
    })
  
    // 图层此时可能还没创建，先绑定，等区域图层出现后自然生效
    mapRef.value.onClick(`${AREA_DISPLAY_LAYER_ID}-fill`, onAreaFeatureClick)
  
    bindZoomListener()
    syncByZoom()
  }
  
  function handleSearch() {
    currentPage.value = 1
  }
  
  function handleReset() {
    Object.assign(filters, { region: '', type: '', projectNo: '', projectName: '' })
    currentPage.value = 1
  }
  
  function onRowClick(row) {
    // 列表模式点击行时先直接打开详情，后续可以改成联动定位到地图上的对应区域
    selectedAreaInfo.value = { ...row }
    viewMode.value = 'map'
  }
  
  onMounted(() => {
    fetchAllProvinceAreaData()
  })
  
  onUnmounted(() => {
    unbindZoomListener()
  })
  </script>
  
  <style scoped>
  .stage-map-page {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f5f7fa;
  }
  
  .view-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
    height: 42px;
    display: flex;
    align-items: center;
    padding: 0 18px;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1px solid #e5e7eb;
  }
  
  .view-tabs {
    display: flex;
    height: 100%;
    gap: 18px;
  }
  
  .view-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0 4px;
    color: #444;
    font-size: 12px;
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  
  .view-tab.active {
    color: #1677ff;
  }
  
  .view-tab.active::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    background: #1677ff;
  }
  
  .map-view {
    position: absolute;
    inset: 42px 0 0;
    overflow: hidden;
  }
  
  .map-summary {
    position: absolute;
    top: 18px;
    left: 18px;
    z-index: 2;
    width: 175px;
    padding: 12px;
    color: #303133;
    background: rgba(255, 255, 255, 0.94);
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  }
  
  .summary-title {
    display: flex;
    justify-content: space-between;
    padding-bottom: 9px;
    margin-bottom: 7px;
    font-size: 12px;
    font-weight: 600;
    border-bottom: 1px solid #eee;
  }
  
  .summary-location,
  .summary-row {
    display: flex;
    align-items: center;
    min-height: 31px;
    font-size: 11px;
  }
  
  .summary-location {
    gap: 4px;
  }
  
  .summary-location strong,
  .summary-row b {
    margin-left: auto;
    font-size: 11px;
    font-weight: 500;
  }
  
  .summary-location small,
  .summary-row small {
    width: 46px;
    color: #999;
    font-size: 9px;
    text-align: right;
  }
  
  .summary-row {
    border-top: 1px solid #f0f0f0;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    margin-right: 6px;
    border-radius: 50%;
  }
  
  .dot.wind {
    background: #4f9cff;
  }
  
  .dot.solar {
    background: #f0c83e;
  }
  
  .expand-button {
    position: absolute;
    top: 50%;
    right: 0;
    z-index: 3;
    width: 25px;
    height: 54px;
    color: #fff;
    background: rgba(30, 30, 30, 0.4);
    border: 0;
    border-radius: 5px 0 0 5px;
    cursor: pointer;
  }
  
  /* ---- 区域视图：未选中时的提示面板 ---- */
  .area-hint-panel {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
    box-sizing: border-box;
    width: 220px;
    padding: 14px;
    color: #d9f5ff;
    background:
      linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
      rgba(3, 22, 48, 0.95);
    border: 1px solid rgba(90, 201, 255, 0.7);
    border-radius: 6px;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  }
  
  .panel-title {
    padding-bottom: 10px;
    margin-bottom: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid rgba(118, 213, 255, 0.3);
  }
  
  .panel-hint {
    color: #9bdfff;
    font-size: 12px;
    line-height: 1.6;
  }
  
  /* ---- 区域视图：选中区域后的详情面板 ---- */
  .area-detail-layer {
    position: absolute;
    top: 18px;
    right: 18px;
    bottom: 18px;
    z-index: 2;
    width: clamp(300px, 22vw, 380px);
  }
  
  .project-list-view {
    height: 100%;
    padding: 52px 20px 12px;
    overflow: auto;
    box-sizing: border-box;
    background: #fff;
  }
  
  .list-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .list-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #333;
    font-size: 13px;
    font-weight: 600;
  }
  
  .project-table {
    width: 100%;
    margin-top: 2px;
    cursor: pointer;
  }
  
  .pagination-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 18px;
    padding-top: 14px;
    color: #666;
    font-size: 12px;
  }
  
  @media (max-width: 1100px) {
    .view-toolbar {
      padding: 0 10px;
    }
  
    .project-list-view {
      padding-right: 10px;
      padding-left: 10px;
    }
  
    .area-detail-layer {
      width: calc(100vw - 36px);
    }
  }
  </style>