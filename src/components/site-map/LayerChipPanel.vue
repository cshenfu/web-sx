<template>
    <div class="layer-panel" :class="{ expanded: !collapsed }" :style="panelStyle">
      <!-- ★ 小按钮：始终显示，点击切换展开/收起 -->
      <button
        class="layer-toggle"
        type="button"
        :title="collapsed ? '展开图层' : '收起图层'"
        @click="collapsed = !collapsed"
      >
        <el-icon><Files /></el-icon>
        <span v-if="activeCount" class="layer-toggle-badge">{{ activeCount }}</span>
      </button>
  
      <!-- 展开面板 -->
      <div v-show="!collapsed" class="layer-body">
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
              <span
                v-if="item.color"
                class="layer-chip-dot"
                :style="{ background: item.color }"
              />
              <el-icon v-else-if="item.icon && ICON_MAP[item.icon]" class="layer-chip-icon">
                <component :is="ICON_MAP[item.icon]" />
              </el-icon>
  
              <span class="layer-chip-name">{{ item.name }}</span>
  
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
    Bell,
    Camera,
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
    Sunny,
    WindPower,
  } from '@element-plus/icons-vue'
  import { PANEL_GROUPS } from './layerPanelConfig'
  
  const ICON_MAP = {
    MapLocation, Compass, Camera, Grid, Guide, Odometer, Picture,
    Lightning, Connection, Share, Bell,
    WindPower, Sunny,
  }
  
  const props = defineProps({
    visibleIds: { type: Array, default: () => [] },
    inputs: { type: Object, default: () => ({}) },
    offset: { type: Object, default: null },
    zIndex: { type: [Number, String], default: null },
  })
  const emit = defineEmits(['toggle', 'input-change'])
  
  const groups = PANEL_GROUPS
  const collapsed = ref(true)
  
  const panelStyle = computed(() => buildPanelStyle(props.offset, props.zIndex))
  
  const activeCount = computed(() =>
    groups.flatMap(g => g.items).filter(it => props.visibleIds.includes(it.id)).length
  )
  
  /**
   * 把可选定位转成内联样式；未传时沿用默认左下。
   *
   * @param {{left?: string|number, bottom?: string|number}|null} offset 偏移
   * @param {number|string|null} zIndex 叠放层级
   * @returns {Record<string, string|number>} 样式对象
   */
  function buildPanelStyle(offset, zIndex) {
    const style = {}
    if (offset?.left != null && offset.left !== '') {
      style.left = typeof offset.left === 'number' ? `${offset.left}px` : offset.left
    }
    if (offset?.bottom != null && offset.bottom !== '') {
      style.bottom = typeof offset.bottom === 'number' ? `${offset.bottom}px` : offset.bottom
    }
    if (zIndex != null && zIndex !== '') style.zIndex = zIndex
    return style
  }
  
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
  /* ★ 外层用 flex 横排，按钮在左，面板在右 */
  .layer-panel {
    position: absolute;
    left: 16px;
    bottom: 24px;
    z-index: 6;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    font-family: inherit;
    pointer-events: auto;
  }
  
  /* ---------- 小按钮：始终显示 ---------- */
  .layer-toggle {
    position: relative;
    flex: 0 0 auto;
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
    transition: color 0.15s, transform 0.15s, box-shadow 0.15s;
  }
  .layer-toggle:hover {
    color: #1677ff;
    transform: translateY(-1px);
  }
  .layer-panel.expanded .layer-toggle {
    color: #1677ff;
    box-shadow: 0 6px 20px rgba(22, 119, 255, 0.25);
  }
  
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
    pointer-events: none;
  }
  
  /* ---------- 展开面板 ---------- */
  .layer-body {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: max-content;
    max-width: min(680px, calc(100vw - 100px));
    padding: 14px 18px;
    background: rgba(245, 247, 250, 0.94);
    border-radius: 16px;
    box-shadow: 0 10px 36px rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(14px);
    /* 让面板底部和小按钮对齐 */
    margin-bottom: 0;
  }
  
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