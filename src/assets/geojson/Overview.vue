<script setup>
import { ref } from 'vue'
import MapGL from '@/components/MapGL.vue'
import shaanxiBoundary from '@/assets/geojson/shanxi.json'

const mapRef = ref(null)

// 这里可以直接继续使用你原来的 satelliteStyle。
const satelliteStyle =
  'https://api.maptiler.com/maps/satellite/style.json?key=HsnG823RN0nfHHfNnNGp'

// 根据你的 GeoJSON 实际 level 值自动匹配常见写法。
const provinceFilter = [
  'any',
  ['==', ['get', 'level'], 'province'],
  ['==', ['get', 'level'], '省'],
  ['==', ['get', 'level'], 'Province']
]

const cityFilter = [
  'any',
  ['==', ['get', 'level'], 'city'],
  ['==', ['get', 'level'], '市'],
  ['==', ['get', 'level'], 'City']
]

// 临时测试用的矩形。
// 它不依赖 shaanxi.json，用来确认 fill-extrusion 本身是否生效。
const testExtrusionGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'test-extrusion',
      properties: {
        name: '测试挤出图层'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [108.2, 34.6],
          [109.0, 34.6],
          [109.0, 35.3],
          [108.2, 35.3],
          [108.2, 34.6]
        ]]
      }
    }
  ]
}

function onMapReady() {
  const api = mapRef.value

  console.log(
    'features 数量:',
    shaanxiBoundary.features.length
  )

  console.log(
    '所有 level 值:',
    [
      ...new Set(
        shaanxiBoundary.features.map(
          feature => feature.properties?.level
        )
      )
    ]
  )

  console.log(
    '第一个 feature 的 level:',
    shaanxiBoundary.features[0]?.properties?.level
  )

  console.log(
    '第一个 feature 的 name:',
    shaanxiBoundary.features[0]?.properties?.name
  )

  // 你的日志显示当前 GeoJSON 只有 level === 'city'，
  // 因此这个省级过滤暂时不会匹配任何要素。
  // 如果以后补充省级 feature，这个图层会自动显示。
  api.addPolygon({
    id: 'shaanxi',
    sourceId: 'shaanxi',
    layerId: 'province-extrusion',
    geojson: shaanxiBoundary,
    filter: provinceFilter,
    color: '#277eb8',
    hoverColor: '#51d7ff',
    selectedColor: '#ff9e00',
    opacity: 0.95,
    outlineColor: '#c4f7ff',
    height: 250000
  })

  // 当前 GeoJSON 中的 10 个市级 feature。
  // 地球投影下高度需要按官网示例使用较大的米数，
  // 3500 米在地球尺度下基本看不出厚度。
  api.addPolygon({
    id: 'shaanxi',
    sourceId: 'shaanxi',
    layerId: 'city-extrusion',
    geojson: shaanxiBoundary,
    filter: cityFilter,
    color: '#5fc5ec',
    hoverColor: '#ffe066',
    selectedColor: '#ff9800',
    opacity: 0.92,
    outlineColor: '#eafcff',
    height: 150000
  })

  // 临时测试：如果这个紫色矩形能显示并且有明显高度，
  // 说明 MapLibre 的 fill-extrusion 工作正常，问题就在原始 GeoJSON
  // 的过滤条件、几何范围或高度数据上。
  api.addPolygon({
    id: 'test-extrusion-source',
    sourceId: 'test-extrusion-source',
    layerId: 'test-extrusion-layer',
    geojson: testExtrusionGeoJSON,
    color: '#ff00ff',
    hoverColor: '#ffff00',
    selectedColor: '#ffffff',
    opacity: 1,
    outlineColor: '#ffffff',
    height: 450000
  })

  api.addLabels({
    id: 'test-extrusion-label',
    sourceId: 'test-extrusion-source',
    geojson: testExtrusionGeoJSON,
    textField: 'name',
    textColor: '#ffffff',
    textSize: 14
  })

  // 市区名称。
  api.addLabels({
    id: 'city-labels',
    sourceId: 'shaanxi',
    geojson: shaanxiBoundary,
    filter: cityFilter,
    textField: 'name',
    textColor: '#ffffff',
    textSize: 12
  })

  // 鼠标移动和点击效果。
  api.bindFeatureInteraction({
    layerId: 'city-extrusion',
    sourceId: 'shaanxi',
    idProperty: 'name',

    onClick(feature) {
      if (!feature) return

      console.log(
        '点击城市:',
        feature.properties
      )
    }
  })

  const map = api.getMap()

  console.log(
    'source 存在:',
    Boolean(map.getSource('shaanxi'))
  )

  map.once('idle', () => {
    console.log(
      '省级图层存在:',
      Boolean(map.getLayer('province-extrusion'))
    )
    console.log(
      '市级图层存在:',
      Boolean(map.getLayer('city-extrusion'))
    )
  })
}
</script>

<template>
  <div class="page-wrapper">
    <MapGL
      ref="mapRef"
      :style="satelliteStyle"
      @ready="onMapReady"
    />

    <div class="panel-left">
      <ProjectSummary />
      <AnnualTarget />
      <ProgressAlert />
    </div>

    <div class="panel-right">
      <InvestOverview />
      <StrategyPlan />
      <PolicyNews />
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.panel-left,
.panel-right {
  position: absolute;
  z-index: 10;
  top: 80px;
}

.panel-left {
  left: 32px;
}

.panel-right {
  right: 32px;
}
</style>