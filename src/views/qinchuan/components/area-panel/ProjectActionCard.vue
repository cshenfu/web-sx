<template>
  <div
    v-if="project"
    class="project-action-card"
    :class="{ 'is-hover': hoverMode }"
    :style="cardStyle"
    @click.stop
  >
    <div class="tooltip-header">
      <button
        class="tooltip-title"
        :class="{ 'title-link': titleClickable }"
        type="button"
        @click.stop="onTitleClick"
      >{{ project.projectName || '-' }}</button>
      <div class="tooltip-status">
        <span class="status-dot" :style="{ background: statusColor }" />
        <span class="status-text" :style="{ color: statusColor }">{{ statusLabel }}</span>
      </div>
    </div>

    <div class="tooltip-grid">
      <div class="grid-item border-right border-bottom">
        <div class="grid-label">装机容量</div>
        <div class="grid-value">
          {{ project.currentProjectCapacity ?? '-' }} <span class="unit">MW</span>
        </div>
      </div>
      <div class="grid-item border-bottom">
        <div class="grid-label">风机数量</div>
        <div class="grid-value text-blue">
          {{ windCount }} <span class="unit">台</span>
          <span v-if="altCount > 0" class="sub-text">（备选{{ altCount }}台）</span>
        </div>
      </div>
      <div class="grid-item border-right">
        <div class="grid-label">推荐机型</div>
        <div class="grid-value">
          <span class="bold">{{ project.deviceModel || 'MySE5.0-200' }}</span>
        </div>
      </div>
      <div class="grid-item">
        <div class="grid-label">资本金IRR</div>
        <div class="grid-value text-red">
          {{ project.capitalFinancialRate != null ? project.capitalFinancialRate : '5.96' }} <span class="unit">%</span>
        </div>
      </div>
    </div>

    <!-- ★ hover 模式也显示 footer，操作与固定卡片完全一致 -->
    <div v-if="showFooter" class="tooltip-footer" @click.stop>
      <button
        v-for="action in visibleActions"
        :key="action"
        type="button"
        class="footer-action"
        :class="{ danger: action === 'delete' }"
        @click.stop="emitAction(action)"
      >
        {{ ACTION_LABELS[action] || action }}
      </button>
      <div v-if="overflowActions.length" class="action-menu-wrap">
        <button
          type="button"
          class="action-menu-button"
          aria-label="更多操作"
          title="更多操作"
          @click.stop="actionMenuOpen = !actionMenuOpen"
        >
          <el-icon><MoreFilled /></el-icon>
        </button>
        <div v-if="actionMenuOpen" class="action-menu">
          <button
            v-for="action in overflowActions"
            :key="action"
            type="button"
            :class="{ danger: action === 'delete' }"
            @click.stop="emitAction(action)"
          >
            {{ ACTION_LABELS[action] || action }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'

const props = defineProps({
  project:        { type: Object, required: true },
  hoverMode:      { type: Boolean, default: false },
  position:       { type: Object, default: () => ({ x: 0, y: 0 }) }, // hover 模式：卡片左上角的像素坐标
  showFooter:     { type: Boolean, default: true },
  stageMap:       { type: Object, default: () => ({}) },             // code -> 中文，用于状态文案
  actions:        { type: Array,  default: null },                   // 传入则覆盖 STAGE_ACTIONS
})
const emit = defineEmits(['open-detail', 'action'])

const actionMenuOpen = ref(false)

const STAGE_ACTIONS = {
  PRELIMINARY_SELECTION: ['assign', 'verify', 'reserve', 'edit', 'delete'],
  PROJECT_RESERVE:       ['material', 'edit', 'assign', 'delete'],
  PROJECT_INITIATION:    ['establishMeeting', 'edit', 'assign', 'delete'],
  FEASIBILITY_REVIEW:    ['researchMaterial', 'researchReview', 'investMaterial', 'edit', 'assign', 'delete'],
  INVESTMENT_DECISION:   ['investMeeting', 'edit', 'assign', 'delete'],
}
const ACTION_LABELS = {
  material: '立项准备', researchMaterial: '可研材料', investMaterial: '投决准备',
  establishMeeting: '立项上会', researchReview: '可研审查', investMeeting: '投决上会',
  assign: '分配', verify: '核查', reserve: '储备', edit: '编辑', delete: '删除',
}
const STAGE_GROUP = {
  PRELIMINARY_SELECTION: 'selection', PROJECT_RESERVE: 'reserved',
  PROJECT_INITIATION: 'planning', FEASIBILITY_REVIEW: 'planning', INVESTMENT_DECISION: 'planning',
  PROJECT_CONSTRUCTION: 'construction', PROJECT_OPERATION: 'operating',
}
const GROUP_AREA_STYLE = {
  selection:    { outlineColor: '#b37feb' },
  reserved:     { outlineColor: '#f759ab' },
  planning:     { outlineColor: '#ffc069' },
  construction: { outlineColor: '#85a5ff' },
  operating:    { outlineColor: '#d3f261' },
  unknown:      { outlineColor: '#22c55e' },
}

function getGroupKey(projectStage) {
  const g = STAGE_GROUP[projectStage]
  if (g) return g
  const desc = props.stageMap[projectStage] || ''
  if (desc.includes('遴选')) return 'selection'
  if (desc.includes('储备')) return 'reserved'
  if (desc.includes('立项') || desc.includes('可研') || desc.includes('投决')) return 'planning'
  if (desc.includes('施工')) return 'construction'
  if (desc.includes('运营') || desc.includes('投产')) return 'operating'
  return 'unknown'
}

const statusColor = computed(() => (GROUP_AREA_STYLE[getGroupKey(props.project.projectStage)] || GROUP_AREA_STYLE.unknown).outlineColor)
const statusLabel = computed(() => props.stageMap[props.project.projectStage] || '项目')

const windCount = computed(() => (props.project.windTurbinePoints || []).filter((p) => Number(p.isReserve) !== 1).length)
const altCount  = computed(() => (props.project.windTurbinePoints || []).filter((p) => Number(p.isReserve) === 1).length)
// ★ 标题是否可点击：仅初步遴选（selection 分组）不可点，hover 模式也允许点
const titleClickable = computed(() => {
  return getGroupKey(props.project?.projectStage) !== 'selection'
})
const allActions = computed(() => {
  if (props.actions && props.actions.length) return props.actions
  return STAGE_ACTIONS[props.project.projectStage] || STAGE_ACTIONS.PRELIMINARY_SELECTION
})

const orderedActions = computed(() => {
  const displayOrder = ['material','establishMeeting','researchMaterial','researchReview','investMaterial','investMeeting','edit','reserve','verify','assign']
  const acts = allActions.value
  const others = acts.filter((a) => !displayOrder.includes(a) && a !== 'delete')
  const list = [...displayOrder.filter((a) => acts.includes(a)), ...others]
  if (acts.includes('delete')) list.push('delete')
  return list
})

const visibleActions = computed(() => {
  const all = orderedActions.value
  if (all.length <= 5) return all
  const without = all.filter((a) => a !== 'delete')
  return all.includes('delete') ? [...without.slice(0, 4), 'delete'] : without.slice(0, 5)
})
const overflowActions = computed(() => {
  const all = orderedActions.value
  if (all.length <= 5) return []
  const without = all.filter((a) => a !== 'delete')
  return all.includes('delete') ? without.slice(4) : without.slice(5)
})

// ★ hover 模式：卡片左上角 = position 坐标，并 clamp 到视口内
const cardStyle = computed(() => {
  if (!props.hoverMode) return {}

  // 卡片尺寸估计（hover 模式：header 54 + grid 76 + footer 48 ≈ 178，留余量）
  const MARGIN = 12
  const CARD_W = 375
  const CARD_H = 200

  const vw = (typeof window !== 'undefined' ? window.innerWidth  : 1920)
  const vh = (typeof window !== 'undefined' ? window.innerHeight : 1080)

  let x = props.position.x
  let y = props.position.y

  // 右侧 / 底部溢出 → 反向贴边；左侧 / 顶部溢出 → 正向贴边
  if (x + CARD_W + MARGIN > vw) x = vw - CARD_W - MARGIN
  if (y + CARD_H + MARGIN > vh) y = vh - CARD_H - MARGIN
  if (x < MARGIN) x = MARGIN
  if (y < MARGIN) y = MARGIN

  return {
    left: `${x}px`,
    top: `${y}px`,
    right: 'auto',
  }
})

watch(() => props.project?.id, () => { actionMenuOpen.value = false })

function onTitleClick() {
  if (!titleClickable.value) return
  emit('open-detail', props.project)
}
function emitAction(action) {
  actionMenuOpen.value = false
  emit('action', action, props.project)
}
</script>

<style scoped>
.project-action-card {
  position: absolute; z-index: 25; top: 60px; right: 12px;
  width: min(375px, calc(100vw - 24px)); height: 192px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255,255,255,.78) 0%, rgba(235,247,255,.7) 100%);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.5); border-radius: 8px;
  box-shadow: 0 6px 18px rgba(15,23,42,.16);
  display: flex; flex-direction: column; overflow: hidden;
}
.project-action-card.is-hover {
  top: auto; right: auto; height: auto; z-index: 100;
  /* ★ 必须 auto：否则 mouseenter / mouseleave 无法触发，父组件的延迟隐藏逻辑会失效 */
  pointer-events: auto;
  box-shadow: 0 8px 24px rgba(15,23,42,.22);
}
.tooltip-header {
  display: flex; flex: 0 0 66px; box-sizing: border-box;
  align-items: center; justify-content: space-between; gap: 8px;
  padding: 10px 12px; background: rgba(222,225,228,.72);
  border-bottom: 1px solid rgba(255,255,255,.5);
}
.is-hover .tooltip-header { flex: 0 0 54px; padding: 8px 12px; }
.tooltip-status { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; font-size: 12px; white-space: nowrap; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 0 3px rgba(146,84,222,.14); }
.tooltip-title {
  display: block; min-width: 0; padding: 0; color: #172033;
  font-size: 16px; font-weight: 700; line-height: 22px; text-align: left;
  background: transparent; border: 0;
}
.title-link { cursor: pointer; }
.title-link:hover { color: #1677ff; }
.tooltip-grid { display: grid; flex: 0 0 76px; height: 76px; grid-template-columns: 1fr 1fr; }
.is-hover .tooltip-grid { flex: 0 0 auto; height: auto; }
.grid-item {
  display: flex; align-items: center; justify-content: space-between;
  box-sizing: border-box; gap: 6px; height: 38px; min-height: 38px;
  padding: 3px 12px; background: rgba(255,255,255,.24);
}
.border-right  { border-right: 1px solid rgba(255,255,255,.6); }
.border-bottom { border-bottom: 1px solid rgba(255,255,255,.6); }
.grid-label { flex: 0 0 auto; margin: 0; color: #6B7280; font-size: 12px; }
.grid-value { min-width: 0; color: #111827; font-size: 14px; font-weight: 700; text-align: right; }
.unit { font-size: 12px; font-weight: 400; color: #6B7280; margin-left: 2px; }
.text-blue { color: #2563EB; }
.text-red  { color: #DC2626; }
.bold { font-weight: 800; }
.sub-text { font-size: 11px; color: #6B7280; font-weight: 400; margin-left: 2px; }
.tooltip-footer {
  display: flex; flex: 0 0 48px; box-sizing: border-box;
  align-items: center; gap: 4px; min-height: 48px; padding: 6px 12px;
  transition: background .2s;
}
.footer-action {
  flex: 1 1 0; min-width: 0; padding: 6px 4px; color: #172033;
  font-size: 12px; white-space: nowrap; background: transparent;
  border: 0; border-radius: 5px; cursor: pointer;
}
.footer-action:hover { color: #1677ff; }
.footer-action.danger { flex: 0 0 auto; padding: 6px 10px; color: #e5484d; }
.footer-action.danger:hover { color: #d9363e; }
.action-menu-wrap { position: relative; flex: 0 0 auto; margin-left: 4px; }
.action-menu-button {
  display: grid; place-items: center; width: 32px; height: 32px;
  color: #101828; font-size: 16px; background: rgba(255,255,255,.24);
  border: 0; border-radius: 6px; cursor: pointer;
}
.action-menu-button:hover { background: rgba(255,255,255,.6); }
.action-menu {
  position: absolute; z-index: 35; right: 0; bottom: calc(100% + 8px);
  display: flex; flex-direction: column; min-width: 170px; padding: 6px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15,23,42,.18);
}
.action-menu button {
  padding: 9px 10px; color: #273443; text-align: left;
  background: transparent; border: 0; border-radius: 5px; cursor: pointer;
}
.action-menu button.danger { color: #d9363e; }
.action-menu button:hover { color: #1677ff; background: #eff6ff; }
@media (max-width: 760px) {
  .project-action-card:not(.is-hover) { top: 56px; right: 8px; }
}
</style>