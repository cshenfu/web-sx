<template>
    <div class="geology-page">
  
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 子模块 Tab（后续可加更多） -->
          <span class="module-tab active">地勘数据库</span>
        </div>
        <div class="toolbar-center">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="map">
              <el-icon><MapLocation /></el-icon> 地图模式
            </el-radio-button>
            <el-radio-button value="list">
              <el-icon><List /></el-icon> 列表模式
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <template v-if="viewMode === 'map'">
            <el-select v-model="filterCity" placeholder="市/区" size="small" style="width:100px" clearable>
              <el-option v-for="c in cities" :key="c" :label="c" :value="c" />
            </el-select>
            <el-input v-model="filterName" placeholder="数据名称" size="small" style="width:140px">
              <template #suffix><el-icon><Search /></el-icon></template>
            </el-input>
          </template>
          <template v-if="viewMode === 'list'">
            <el-button type="primary" size="small" @click="showAddDialog = true">添加数据</el-button>
          </template>
        </div>
      </div>
  
      <!-- 地图模式 -->
      <div v-show="viewMode === 'map'" class="map-wrapper">
        <MapGL ref="mapRef" :style="satelliteStyle" />
  
        <!-- 数据情况浮动卡片 -->
        <div class="map-info-card">
          <div class="card-header">
            数据情况
            <el-icon><Operation /></el-icon>
          </div>
          <div class="card-body">
            <el-icon color="#f56c6c"><Location /></el-icon>
            陕西省 共{{ totalCount }}条地勘数据
          </div>
        </div>
      </div>
  
      <!-- 列表模式 -->
      <div v-show="viewMode === 'list'" class="list-wrapper">
        <GeologyTable />
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import MapGL from '@/components/MapGL.vue'
  import GeologyTable from './components/GeologyTable.vue'
  import { MapLocation, List, Search, Operation, Location } from '@element-plus/icons-vue'
  
  const viewMode = ref('map')
  const filterCity = ref('')
  const filterName = ref('')
  const totalCount = ref(200)
  const showAddDialog = ref(false)
  const mapRef = ref(null)
  
  const satelliteStyle = 'https://api.maptiler.com/maps/satellite/style.json?key=YOUR_KEY'
  
  const cities = ['榆林市','延安市','铜川市','咸阳市','渭南市','宝鸡市','西安市','商洛市','汉中市','安康市']
  
  onMounted(() => {
    // 加载完后在地图上打点
    // mapRef.value.addPoints({ id: 'geology-points', geojson: pointsData, color: '#f56c6c' })
  })
  </script>
  
  <style scoped>
  .geology-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #111827;
  }
  
  .toolbar {
    height: 44px;
    background: rgba(15, 25, 50, 0.95);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    gap: 12px;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  
  .module-tab {
    color: rgba(255,255,255,0.5);
    font-size: 14px;
    padding: 4px 12px;
    cursor: pointer;
    border-radius: 4px;
  }
  .module-tab.active {
    color: #4fc3ff;
    background: rgba(79,195,255,0.1);
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .map-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  
  .map-info-card {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(10, 22, 50, 0.9);
    border: 1px solid rgba(79,195,255,0.3);
    border-radius: 6px;
    padding: 10px 14px;
    color: #fff;
    min-width: 200px;
    backdrop-filter: blur(4px);
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    margin-bottom: 8px;
  }
  
  .card-body {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }
  
  .list-wrapper {
    flex: 1;
    overflow: hidden;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  </style>