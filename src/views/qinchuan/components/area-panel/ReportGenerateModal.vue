<!-- components/area-panel/ReportGenerateModal.vue -->
<template>
  <div v-if="visible" class="modal-mask" @click.self="$emit('close')">
    <div class="modal-box">
      <header class="modal-header">
        <span class="modal-title">
          <svg viewBox="0 0 16 16" class="title-icon">
            <rect x="3" y="2" width="10" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.2" />
            <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1" stroke-linecap="round" />
          </svg>
          生成报告/函件
        </span>
        <button type="button" class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 16 16">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </svg>
        </button>
      </header>

      <div class="modal-body">
        <div class="section-title">请选择需生成的报告类型</div>

        <div class="option-grid">
          <button
            v-for="option in options"
            :key="option.key"
            type="button"
            class="option-card"
            :class="{ selected: selectedKey === option.key }"
            @click="selectedKey = option.key"
          >
            <span v-if="selectedKey === option.key" class="selected-badge">
              <svg viewBox="0 0 16 16">
                <path d="M4 8.5l2.5 2.5L12 5.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="option-icon" :style="{ color: option.iconColor, background: `${option.iconColor}22` }">
              <svg viewBox="0 0 20 20">
                <rect x="4" y="3" width="12" height="14" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3" />
                <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
              </svg>
            </span>
            <span class="option-label">{{ option.label }}</span>
            <span v-if="option.sub" class="option-sub">{{ option.sub }}</span>
          </button>
        </div>
      </div>

      <footer class="modal-footer">
        <button type="button" class="footer-btn" @click="$emit('add-report')">
          添加项目报告
        </button>
        <button type="button" class="footer-btn primary" :disabled="!selectedKey" @click="handleConfirm">
          添加请示文件
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { reportTypeOptions } from '../../js/areaPanelMockData'

const props = defineProps({
  visible: { type: Boolean, default: false },
  defaultKey: { type: String, default: 'feasibility-centralized' },
  // 由首页传入当前项目。组件本身不读取项目字段，只在确认时一并传回。
  project: { type: Object, default: () => null },
})

const emit = defineEmits(['close', 'add-report', 'confirm'])

const options = reportTypeOptions
const selectedKey = ref(props.defaultKey)

watch(
  () => props.visible,
  (value) => {
    if (value) selectedKey.value = props.defaultKey
  }
)

function handleConfirm() {
  const option = options.find((item) => item.key === selectedKey.value)
  if (!option) return

  emit('confirm', {
    option,
    project: props.project,
  })
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 8, 20, 0.5);
}

.modal-box {
  width: min(600px, calc(100vw - 40px));
  overflow: hidden;
  border-radius: 8px;
  background: #eef1f4;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #e4e8ec;
}

.modal-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.title-icon,
.close-btn svg {
  width: 14px;
  height: 14px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  background: none;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.modal-body {
  padding: 20px 24px;
}

.section-title {
  color: #374151;
  font-size: 13px;
  text-align: center;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.option-card:hover {
  border-color: #93c5fd;
}

.option-card.selected {
  border-color: #2f8dff;
  box-shadow: 0 0 0 1px #2f8dff;
}

.selected-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2f8dff;
}

.selected-badge svg {
  width: 11px;
  height: 11px;
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
}

.option-icon svg {
  width: 18px;
  height: 18px;
}

.option-label {
  color: #1f2937;
  font-size: 12.5px;
  line-height: 1.4;
  text-align: center;
}

.option-sub {
  color: #9ca3af;
  font-size: 11px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px 22px;
}

.footer-btn {
  padding: 8px 18px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  cursor: pointer;
  color: #374151;
  background: #fff;
  font-size: 13px;
}

.footer-btn.primary {
  border-color: #2f8dff;
  color: #fff;
  background: #2f8dff;
}

.footer-btn.primary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>