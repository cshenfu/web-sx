<!-- ResizableSplitter.vue -->
<template>
    <div class="resizable-splitter">
      <div class="resizer" @mousedown="startResize" :style="{ left: `${leftWidth}px` }"></div>
      <div class="left-box" :style="{ width: `${leftWidth}px` }">
        <slot name="left"></slot>
      </div>
      <div class="right-box">
        <slot name="right"></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  const props  = defineProps({
    defaultLeftWidth: {
        type: Number
    }
  })
  const leftWidth = ref(props.defaultLeftWidth);
      const startX = ref(0);
      let initialWidth = 0;
  
      const startResize = (event) => {
        startX.value = event.clientX;
        initialWidth = leftWidth.value;
  
        const onMouseMove = (moveEvent) => {
          const newWidth = Math.max(300, Math.min(window.innerWidth - 100, initialWidth + (moveEvent.clientX - startX.value)));
          leftWidth.value = newWidth;
        };
  
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
  
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
  
      onMounted(() => {
        // 可以在这里添加额外的初始化代码
      });
  
      onUnmounted(() => {
        window.removeEventListener('mousemove', startResize);
        window.removeEventListener('mouseup', startResize);
      });
  </script>
  
  <style scoped lang="scss">
    @import '../variableRegion.scss';
  </style>