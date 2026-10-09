<!-- components/area-panel/EditToolbar.vue -->
<!-- 顶部四个编辑入口 + 选中“编辑场区”后出现的绘制/编辑小浮框。
     风机 / 升压站 / 不可用区域三个入口目前只做占位（disabled + 提示），
     对应功能接入时把 disabled 条件和 @click 换成真实逻辑即可。 -->
<template>
  <div class="edit-toolbar">
    <div class="tool-tabs">
      <button
        type="button"
        class="tool-tab"
        :class="{ active: activeTool === 'area' }"
        @click="handleToolClick('area')"
      >
        编辑场区
      </button>
      <button
        type="button"
        class="tool-tab"
        disabled
        title="敬请期待"
        @click="handleToolClick('turbine')"
      >
        编辑风机
      </button>
      <button
        type="button"
        class="tool-tab"
        disabled
        title="敬请期待"
        @click="handleToolClick('substation')"
      >
        编辑升压站
      </button>
      <button
        type="button"
        class="tool-tab"
        disabled
        title="敬请期待"
        @click="handleToolClick('restricted')"
      >
        设置不可用区域
      </button>
    </div>

    <!-- 场区编辑浮框：绘制中 / 新区域待命名 / 已选区域编辑 / 默认引导 -->
    <div v-if="activeTool === 'area'" class="area-editor-box">
      <template v-if="isDrawing || newAreaFeatureId">
        <div class="box-hint">
          <span v-if="isDrawing">正在绘制：单击地图添加点，双击结束绘制</span>
          <span v-else>多边形已完成，请输入名称后保存</span>
        </div>

        <label class="field-label" for="new-area-name">区域名称</label>
        <input
          id="new-area-name"
          class="box-input"
          type="text"
          maxlength="100"
          placeholder="请输入区域名称"
          :value="newAreaName"
          :disabled="actionLoading"
          @input="$emit('update:newAreaName', $event.target.value.trim())"
        />

        <div class="box-actions">
          <button
            type="button"
            class="box-btn primary"
            :disabled="!newAreaFeatureId || !newAreaName || actionLoading"
            @click="$emit('save-new')"
          >
            {{ actionLoading ? '保存中...' : '保存' }}
          </button>
          <button type="button" class="box-btn" :disabled="actionLoading" @click="$emit('cancel-new')">
            取消
          </button>
        </div>
      </template>

      <template v-else-if="selectedArea">
        <div class="box-hint">已选择 {{ selectedAreaFeatures.length }} 个区域</div>

        <label class="field-label" for="edit-area-name">区域名称</label>
        <input
          id="edit-area-name"
          class="box-input"
          type="text"
          maxlength="100"
          :value="editAreaName"
          :disabled="selectedAreaFeatures.length !== 1 || actionLoading"
          @input="$emit('update:editAreaName', $event.target.value.trim())"
        />

        <div class="box-actions">
          <button
            type="button"
            class="box-btn primary"
            :disabled="selectedAreaFeatures.length !== 1 || actionLoading || !editAreaName"
            @click="$emit('save-selected')"
          >
            {{ actionLoading ? '保存中...' : '保存' }}
          </button>
          <button type="button" class="box-btn" :disabled="actionLoading" @click="$emit('cancel-selected')">
            取消
          </button>
          <button type="button" class="box-btn danger" :disabled="actionLoading" @click="$emit('open-delete-confirm')">
            删除
          </button>
        </div>
      </template>

      <template v-else>
        <div class="box-hint">点击已有区域可编辑；也可以绘制新的多边形区域。</div>
        <button type="button" class="box-btn draw-btn" :disabled="actionLoading" @click="$emit('start-draw')">
          多边形绘制
        </button>
      </template>

      <div v-if="panelMessage" class="box-message">{{ panelMessage }}</div>
    </div>

    <!-- 删除确认 -->
    <div v-if="deleteConfirmVisible" class="confirm-mask" @click.self="$emit('close-delete-confirm')">
      <div class="confirm-box">
        <div class="confirm-title">确定删除？</div>
        <div class="confirm-text">
          将删除已选择的 {{ selectedAreaFeatures.length }} 个区域，此操作不可撤销。
        </div>
        <div class="box-actions">
          <button type="button" class="box-btn danger" :disabled="actionLoading" @click="$emit('confirm-delete')">
            {{ actionLoading ? '删除中...' : '确定' }}
          </button>
          <button type="button" class="box-btn" :disabled="actionLoading" @click="$emit('close-delete-confirm')">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activeTool: { type: String, default: '' }, // '' | 'area' | 'turbine' | 'substation' | 'restricted'
  isDrawing: { type: Boolean, default: false },
  newAreaFeatureId: { type: [String, Number], default: null },
  newAreaName: { type: String, default: '' },
  selectedArea: { type: Object, default: null },
  selectedAreaFeatures: { type: Array, default: () => [] },
  editAreaName: { type: String, default: '' },
  actionLoading: { type: Boolean, default: false },
  panelMessage: { type: String, default: '' },
  deleteConfirmVisible: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:activeTool',
  'update:newAreaName',
  'update:editAreaName',
  'start-draw',
  'save-new',
  'cancel-new',
  'save-selected',
  'cancel-selected',
  'open-delete-confirm',
  'close-delete-confirm',
  'confirm-delete',
])

function handleToolClick(tool) {
  // 未实现的工具直接短路（disabled 已经挡住了点击，这里是双保险）
  if (tool !== 'area') return
  emit('update:activeTool', props.activeTool === tool ? '' : tool)
}
</script>

<style scoped>
.edit-toolbar {
  position: relative;
}

.tool-tabs {
  display: flex;
  gap: 6px;
  padding: 10px;
  border: 1px solid rgba(90, 201, 255, 0.7);
  border-radius: 6px;
  background:
    linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
    rgba(3, 22, 48, 0.95);
}

.tool-tab {
  flex: 1;
  padding: 8px 6px;
  border: 1px solid rgba(125, 213, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  color: #c8efff;
  background: rgba(8, 66, 104, 0.5);
  font-size: 12px;
  white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}

.tool-tab:hover:not(:disabled) {
  border-color: #8de4ff;
  background: rgba(17, 105, 153, 0.85);
}

.tool-tab.active {
  border-color: #49d5ff;
  color: #fff;
  background: rgba(12, 130, 178, 0.85);
}

.tool-tab:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.area-editor-box {
  box-sizing: border-box;
  padding: 14px;
  margin-top: 8px;
  border: 1px solid rgba(90, 201, 255, 0.7);
  border-radius: 6px;
  color: #d9f5ff;
  background:
    linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
    rgba(3, 22, 48, 0.95);
}

.box-hint {
  color: #9bdfff;
  font-size: 13px;
  line-height: 1.6;
}

.field-label {
  display: block;
  margin: 10px 0 6px;
  color: #bcecff;
  font-size: 13px;
}

.box-input {
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(101, 195, 238, 0.55);
  border-radius: 3px;
  outline: none;
  color: #effbff;
  background: rgba(0, 18, 39, 0.72);
  font-size: 13px;
}

.box-input:focus {
  border-color: #5bd6ff;
  box-shadow: 0 0 0 2px rgba(91, 214, 255, 0.15);
}

.box-input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.box-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.box-btn {
  min-width: 68px;
  padding: 7px 13px;
  border: 1px solid rgba(125, 213, 255, 0.55);
  border-radius: 3px;
  cursor: pointer;
  color: #c8efff;
  background: rgba(8, 66, 104, 0.72);
  font-size: 13px;
  transition: border-color 0.2s, background 0.2s, opacity 0.2s;
}

.box-btn:hover:not(:disabled) {
  border-color: #8de4ff;
  background: rgba(17, 105, 153, 0.9);
}

.box-btn.primary {
  border-color: #49d5ff;
  color: #fff;
  background: rgba(12, 130, 178, 0.82);
}

.box-btn.danger {
  border-color: rgba(255, 126, 126, 0.8);
  color: #ffdede;
  background: rgba(132, 39, 55, 0.78);
}

.box-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.draw-btn {
  width: 100%;
  height: 38px;
  margin-top: 12px;
}

.box-message {
  margin-top: 14px;
  color: #8de7b0;
  font-size: 12px;
  line-height: 1.5;
}

.confirm-mask {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 8, 20, 0.58);
}

.confirm-box {
  width: min(280px, calc(100vw - 40px));
  padding: 18px;
  border: 1px solid rgba(255, 126, 126, 0.65);
  border-radius: 5px;
  background: #082744;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.45);
}

.confirm-title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.confirm-text {
  margin-top: 10px;
  color: #c6e5f2;
  font-size: 13px;
  line-height: 1.6;
}
</style>
