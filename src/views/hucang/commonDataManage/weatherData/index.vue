<template>
  <div class="weather-container">
    <!-- 查询页 -->
    <WeatherQuery 
      v-show="!showDownload" 
      @open-download="showDownload = true" 
    />

    <!-- 下载页覆盖层 -->
    <Transition name="slide-fade">
      <WeatherDownload 
        v-if="showDownload" 
        @close="showDownload = false" 
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WeatherQuery from './components/WeatherQuery.vue'
import WeatherDownload from './components/WeatherDownload.vue'

const showDownload = ref(false)
</script>

<style scoped>
.weather-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.slide-fade-enter-active { transition: all 0.2s ease-out; }
.slide-fade-leave-active { transition: all 0.15s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>