<script setup>
import MapGL from '@/components/MapGL.vue'
import shaanxiBoundary from '@/assets/geojson/shanxi.json'

// 继续使用你原来的地图样式。
const satelliteStyle =
  'https://api.maptiler.com/maps/satellite/style.json?key=HsnG823RN0nfHHfNnNGp'

function onMapReady(map) {
  console.log('MapLibre globe ready', map)
  console.log(
    '陕西 GeoJSON features:',
    shaanxiBoundary.features?.length ?? 0
  )
}

function onFeatureHover(properties) {
  if (properties) {
    console.log('鼠标移入:', properties.name, properties)
  }
}

function onFeatureClick(properties) {
  if (properties) {
    console.log('点击区域:', properties.name, properties)
  }
}
</script>

<template>
  <div class="overview">
    <MapGL
      :style="satelliteStyle"
      :geojson="shaanxiBoundary"
      @ready="onMapReady"
      @feature-hover="onFeatureHover"
      @feature-click="onFeatureClick"
    />
  </div>
</template>

<style scoped>
.overview {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>