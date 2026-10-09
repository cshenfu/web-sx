<!-- components/area-panel/MapModeSwitch.vue -->
<template>
  <div class="mode-switch">
    <button
      type="button"
      class="mode-btn"
      :class="{ active: modelValue === 'map' }"
      @click="$emit('update:modelValue', 'map')"
    >
      <svg viewBox="0 0 16 16" class="mode-icon"><path d="M2 4l4-1.5 4 1.5 4-1.5v9.5l-4 1.5-4-1.5-4 1.5V4z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
      地图模式
    </button>
    <button
      type="button"
      class="mode-btn"
      :class="{ active: modelValue === 'list' }"
      @click="$emit('update:modelValue', 'list')"
    >
      <svg viewBox="0 0 16 16" class="mode-icon"><path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      项目列表
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'map' }, // 'map' | 'list'
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.mode-switch {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid rgba(90, 201, 255, 0.5);
  border-radius: 6px;
  background: rgba(3, 22, 48, 0.85);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border: none;
  cursor: pointer;
  color: #9bdfff;
  background: transparent;
  font-size: 12px;
  white-space: nowrap;
}

.mode-btn.active {
  color: #fff;
  background: #2f8dff;
}

.mode-icon {
  width: 13px;
  height: 13px;
}
</style>
