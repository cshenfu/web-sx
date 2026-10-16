<template>
    <div class="layer-panel" :class="{ expanded: !collapsed }">
      <!-- 收起态按钮 -->
      <button
        v-show="collapsed"
        class="layer-toggle"
        type="button"
        title="图层"
        @click="collapsed = false"
      >
        <el-icon><Files /></el-icon>
        <span v-if="activeCount" class="layer-toggle-badge">{{ activeCount }}</span>
      </button>
  
      <!-- 展开面板 -->
      <div v-show="!collapsed" class="layer-body">
        <button class="layer-collapse" type="button" title="收起" @click="collapsed = true">
          <el-icon><ArrowLeft /></el-icon>
        </button>
  
        <div
          v-for="(group, gi) in groups"
          :key="gi"
          class="layer-group"
        >
          <div class="layer-group-label">{{ group.label }}</div>
  
          <div class="layer-chips">
            <div
              v-for="item in group.items"
              :key="item.id"
              class="layer-chip"
              :class="{
                active: isActive(item.id),
                disabled: item.disabled,
              }"
              @click="onChipClick(item)"
            >
              <!-- 色块 or 图标 -->
              <span
                v-if="item.color"
                class="layer-chip-dot"
                :style="{ background: item.color }"
              />
              <el-icon v-else-if="item.icon && ICON_MAP[item.icon]" class="layer-chip-icon">
  <component :is="ICON_MAP[item.icon]" />
</el-icon>
  
              <span class="layer-chip-name">{{ item.name }}</span>
  
              <!-- 内嵌输入 -->
              <span
                v-if="item.input"
                class="layer-chip-input"
                @click.stop
              >
                <input
                  :value="inputs[item.id]"
                  type="number"
                  :min="item.input.min ?? 0"
                  :max="item.input.max"
                  :step="item.input.step ?? 1"
                  @input="onInputChange(item, $event)"
                />
                <em>{{ item.input.unit }}</em>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue'
import {
  ArrowLeft,
  Bell,
  Compass,
  Connection,
  Files,
  Grid,
  Guide,
  Lightning,
  MapLocation,
  Odometer,
  Picture,
  Share,
  Sunny,        // ★ 新增
  WindPower,    // ★ 新增
} from '@element-plus/icons-vue'
import { PANEL_GROUPS } from './layerPanelConfig'

// ★ 图标名 -> 组件 映射
const ICON_MAP = {
  MapLocation, Compass, Grid, Guide, Odometer, Picture,
  Lightning, Connection, Share, Bell, Sunny,        // ★ 新增
  WindPower,    // ★ 新增
}
  
  const props = defineProps({
    // 当前可见的图层 id 数组
    visibleIds: { type: Array, default: () => [] },
    // 输入框的值对象（{ noise: 700 }）
    inputs: { type: Object, default: () => ({}) },
  })
  const emit = defineEmits(['toggle', 'input-change'])
  
  const groups = PANEL_GROUPS
  const collapsed = ref(true)
  
  const activeCount = computed(() =>
    groups.flatMap(g => g.items).filter(it => props.visibleIds.includes(it.id)).length
  )
  
  function isActive(id) {
    return props.visibleIds.includes(id)
  }
  
  function onChipClick(item) {
    if (item.disabled) return
    emit('toggle', item)
  }
  
  function onInputChange(item, e) {
    const raw = e.target.value
    const num = raw === '' ? '' : Number(raw)
    emit('input-change', { id: item.id, value: num, item })
  }
  </script>
  
  <style scoped>
  .layer-panel {
    position: absolute;
    left: 16px;
    bottom: 24px;
    z-index: 6;
    font-family: inherit;
    pointer-events: auto;
  }
  
  /* ---------- 收起态按钮 ---------- */
  .layer-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: #4b5563;
    font-size: 20px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    cursor: pointer;
    transition: color 0.15s, transform 0.15s;
  }
  .layer-toggle:hover { color: #1677ff; transform: translateY(-1px); }
  
  .layer-toggle-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    color: #fff;
    font-size: 10px;
    line-height: 16px;
    text-align: center;
    background: #1677ff;
    border-radius: 8px;
  }
  
  /* ---------- 展开面板 ---------- */
  .layer-body {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: max-content;
    max-width: min(680px, calc(100vw - 32px));
    padding: 14px 18px;
    background: rgba(245, 247, 250, 0.94);
    border-radius: 16px;
    box-shadow: 0 10px 36px rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(14px);
  }
  
  .layer-collapse {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    background: transparent;
    border: 0;
    border-radius: 4px;
    cursor: pointer;
  }
  .layer-collapse:hover { color: #1677ff; background: #eef2f7; }
  
  /* ---------- 分组 ---------- */
  .layer-group {
    display: grid;
    grid-template-columns: 64px 1fr;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
  }
  .layer-group + .layer-group {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
  .layer-group-label {
    color: #909399;
    font-size: 13px;
    line-height: 1.3;
    text-align: center;
    word-break: break-all;
    user-select: none;
  }
  
  /* ---------- chip 流 ---------- */
  .layer-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  /* ---------- chip ---------- */
  .layer-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    color: #374151;
    font-size: 13px;
    background: #fff;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    user-select: none;
  }
  .layer-chip:hover {
    color: #1677ff;
    border-color: #93c5fd;
  }
  .layer-chip.active {
    color: #1677ff;
    background: #e8f2ff;
    border-color: #1677ff;
  }
  .layer-chip.disabled {
    color: #c0c4cc;
    background: #f5f7fa;
    border-color: #ebeef5;
    cursor: not-allowed;
  }
  .layer-chip.disabled:hover {
    color: #c0c4cc;
    border-color: #ebeef5;
  }
  
  .layer-chip-icon { font-size: 15px; }
  .layer-chip-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex: 0 0 10px;
  }
  .layer-chip-name { line-height: 1; }
  
  /* ---------- chip 内嵌输入 ---------- */
  .layer-chip-input {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    margin-left: 4px;
    padding-left: 8px;
    border-left: 1px solid #e5e7eb;
  }
  .layer-chip.active .layer-chip-input { border-left-color: #bfdbfe; }
  .layer-chip-input input {
    width: 46px;
    padding: 0;
    color: inherit;
    font: inherit;
    text-align: right;
    background: transparent;
    border: 0;
    outline: none;
    -moz-appearance: textfield;
  }
  .layer-chip-input input::-webkit-outer-spin-button,
  .layer-chip-input input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .layer-chip-input em {
    color: #909399;
    font-size: 12px;
    font-style: normal;
  }
  </style>