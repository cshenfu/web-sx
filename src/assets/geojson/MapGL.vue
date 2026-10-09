<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const emit = defineEmits([
  'ready',
  'feature-hover',
  'feature-click'
])

const props = defineProps({
  style: {
    type: String,
    required: true
  },

  // 直接接收你的 shanxi.json
  geojson: {
    type: Object,
    required: true
  }
})

const mapContainer = ref(null)
let map = null

let hoveredId = null
let selectedId = null

const CITY_LAYER = 'admin-city-extrusion'
const CITY_OUTLINE_LAYER = 'admin-city-outline'
const CITY_LABEL_LAYER = 'admin-city-labels'
const PROVINCE_LAYER = 'admin-province-extrusion'
const PROVINCE_OUTLINE_LAYER = 'admin-province-outline'
const SOURCE_ID = 'administrative-boundaries'

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: props.style,
    center: [0, 20],
    zoom: 1.5,
    projection: 'globe',
    antialias: true
  })

  map.on('error', event => {
    console.error('[MapLibre]', event.error)
  })

  // 按官网示例，在 style.load 阶段设置 globe。
  map.on('style.load', () => {
    map.setProjection({
      type: 'globe'
    })
  })

  map.on('load', () => {
    addAdministrativeLayers()

    // 保留原来飞到陕西的功能。
    map.flyTo({
      center: [108.9, 35.2],
      zoom: 6.5,
      pitch: 35,
      bearing: 0,
      duration: 3000,
      essential: true
    })

    emit('ready', map)
  })
})

onUnmounted(() => {
  map?.remove()
  map = null
})

function getPreparedGeoJSON() {
  const features = Array.isArray(props.geojson?.features)
    ? props.geojson.features
    : []

  return {
    type: 'FeatureCollection',
    features: features.map((feature, index) => {
      const properties = {
        ...(feature.properties || {})
      }

      // 确保每个 feature 都有稳定且唯一的 feature-state ID。
      const featureId =
        properties.adcode ??
        properties.code ??
        properties.name ??
        index

      properties.__map_id = String(featureId)

      const level = String(
        properties.level ?? ''
      ).toLowerCase()

      // 地球投影下使用和官网示例相同量级的高度。
      const defaultHeight =
        level === 'province' ||
        level === '省' ||
        level === 'provincelevel'
          ? 250000
          : 150000

      const customHeight = Number(properties.height)

      properties.height = Number.isFinite(customHeight)
        ? customHeight
        : defaultHeight

      return {
        ...feature,
        id: properties.__map_id,
        properties
      }
    })
  }
}

function findLevel(features, values) {
  const feature = features.find(item =>
    values.includes(
      String(item.properties?.level ?? '')
    )
  )

  return feature?.properties?.level
}

function addAdministrativeLayers() {
  const data = getPreparedGeoJSON()
  const features = data.features

  const provinceLevel = findLevel(features, [
    'province',
    '省',
    'Province'
  ])

  const cityLevel = findLevel(features, [
    'city',
    '市',
    'City'
  ])

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data,
    promoteId: '__map_id'
  })

  // 你的当前数据只有 city，因此这里不会强行添加不存在的省级要素。
  if (provinceLevel !== undefined) {
    addExtrusionLayer({
      layerId: PROVINCE_LAYER,
      outlineLayerId: PROVINCE_OUTLINE_LAYER,
      filter: ['==', ['get', 'level'], provinceLevel],
      color: '#2c83bd',
      hoverColor: '#52dcff',
      selectedColor: '#ff9d00',
      outlineColor: '#c7f8ff',
      height: 250000
    })
  }

  // 如果存在 city level，就只显示市级；否则显示全部 feature。
  const cityFilter = cityLevel === undefined
    ? null
    : ['==', ['get', 'level'], cityLevel]

  addExtrusionLayer({
    layerId: CITY_LAYER,
    outlineLayerId: CITY_OUTLINE_LAYER,
    filter: cityFilter,
    color: '#5fc5ec',
    hoverColor: '#ffe066',
    selectedColor: '#ff9800',
    outlineColor: '#efffff',
    height: 150000
  })

  map.addLayer({
    id: CITY_LABEL_LAYER,
    type: 'symbol',
    source: SOURCE_ID,
    ...(cityFilter ? { filter: cityFilter } : {}),
    layout: {
      // 有 label 时显示 label，没有时显示 name。
      'text-field': [
        'coalesce',
        ['get', 'label'],
        ['get', 'name']
      ],
      'text-size': 12,
      'text-anchor': 'center',
      'text-keep-upright': true,
      'text-allow-overlap': false
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#08213d',
      'text-halo-width': 1.5
    }
  })

  bindCityInteraction()
}

function addExtrusionLayer({
  layerId,
  outlineLayerId,
  filter,
  color,
  hoverColor,
  selectedColor,
  outlineColor,
  height
}) {
  map.addLayer({
    id: layerId,
    type: 'fill-extrusion',
    source: SOURCE_ID,
    ...(filter ? { filter } : {}),
    paint: {
      // fill-extrusion-opacity 不使用 feature-state，
      // 避免旧版 MapLibre 的 data expressions 报错。
      'fill-extrusion-opacity': 1,
      'fill-extrusion-height': [
        'coalesce',
        ['get', 'height'],
        height
      ],
      'fill-extrusion-base': 0,
      'fill-extrusion-color': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        selectedColor,
        ['boolean', ['feature-state', 'hover'], false],
        hoverColor,
        color
      ],
      'fill-extrusion-vertical-gradient': true
    }
  })

  map.addLayer({
    id: outlineLayerId,
    type: 'line',
    source: SOURCE_ID,
    ...(filter ? { filter } : {}),
    paint: {
      'line-color': outlineColor,
      'line-width': 1.5,
      'line-opacity': 1
    }
  })
}

function bindCityInteraction() {
  map.on('mousemove', CITY_LAYER, event => {
    const feature = event.features?.[0]
    if (!feature) return

    const id = feature.id

    if (
      hoveredId !== null &&
      hoveredId !== id
    ) {
      map.setFeatureState(
        {
          source: SOURCE_ID,
          id: hoveredId
        },
        { hover: false }
      )
    }

    hoveredId = id

    map.setFeatureState(
      {
        source: SOURCE_ID,
        id: hoveredId
      },
      { hover: true }
    )

    map.getCanvas().style.cursor = 'pointer'
    emit('feature-hover', feature.properties, event)
  })

  map.on('mouseleave', CITY_LAYER, () => {
    if (hoveredId !== null) {
      map.setFeatureState(
        {
          source: SOURCE_ID,
          id: hoveredId
        },
        { hover: false }
      )
    }

    hoveredId = null
    map.getCanvas().style.cursor = ''
    emit('feature-hover', null, null)
  })

  map.on('click', CITY_LAYER, event => {
    const feature = event.features?.[0]
    if (!feature) return

    const id = feature.id

    if (
      selectedId !== null &&
      selectedId !== id
    ) {
      map.setFeatureState(
        {
          source: SOURCE_ID,
          id: selectedId
        },
        { selected: false }
      )
    }

    if (selectedId === id) {
      map.setFeatureState(
        {
          source: SOURCE_ID,
          id: selectedId
        },
        { selected: false }
      )
      selectedId = null
    } else {
      selectedId = id

      map.setFeatureState(
        {
          source: SOURCE_ID,
          id: selectedId
        },
        { selected: true }
      )
    }

    emit('feature-click', feature.properties, event)
  })
}

defineExpose({
  getMap: () => map
})
</script>

<style scoped>
.map-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>