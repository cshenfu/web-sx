<!-- components/report-wizard/ReportWizard.vue -->
<template>
  <div class="report-wizard">
    <button type="button" class="back-btn" title="返回" @click="$emit('close')">
      <svg viewBox="0 0 16 16">
        <path d="M10 3l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <div class="wizard-title">{{ titleText }}</div>

    <div class="step-indicator">
      <div
        v-for="(step, index) in visibleSteps"
        :key="step.key"
        class="step-node"
        :class="{ active: currentStep === index, done: currentStep > index }"
      >
        <span class="step-num">{{ index + 1 }}.</span>{{ step.label }}
        <span v-if="index < visibleSteps.length - 1" class="step-arrow">›</span>
      </div>
    </div>

    <div class="wizard-body">
      <StepOne
        v-if="currentStep === 0"
        :create-project-mode="createProjectMode"
        :initial-project-name="resolvedProjectName"
        :project="workingProject"
        @save-draft="(payload) => handleSaveDraft(0, payload)"
        @next="(payload) => handleNext(0, payload)"
      />
      <StepTwo
        v-else-if="currentStep === 1"
        :create-project-mode="createProjectMode"
        :project="workingProject"
        @save-draft="(data) => handleSaveDraft(1, data)"
        @next="(data) => handleNext(1, data)"
      />
      <StepThree
        v-else-if="currentStep === 2 && maxStep >= 2"
        :create-project-mode="createProjectMode"
        :project="workingProject"
        @save-draft="(data) => handleSaveDraft(2, data)"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import StepOne from './steps/StepOne.vue'
import StepTwo from './steps/StepTwo.vue'
import StepThree from './steps/StepThree.vue'
import { PACKAGE_TYPE } from '../../js/Reportwizardmockdata'

const props = defineProps({
  createProjectMode: { type: Number, default: PACKAGE_TYPE.default },
  projectName: { type: String, default: '' },
  project: { type: Object, default: () => null },
  // ★ 新增：标题（未传则走原来的"一键生成风电场可行性研究报告（集中式）"）
  title: { type: String, default: '' },
  // ★ 新增：最多显示到第几步（0-based，默认 2 = 完整三步；项目建议书传 1 = 只用前两步）
  maxStep: { type: Number, default: 2 },
})

const emit = defineEmits(['close', 'save-draft', 'submit'])

const steps = [
  { key: 'basic', label: '项目基本信息' },
  { key: 'condition', label: '项目建设条件' },
  { key: 'invest', label: '项目投资设置' },
]

// ★ 按 maxStep 截取可视步骤（用于 step-indicator 显示）
const visibleSteps = computed(() => steps.slice(0, Math.min(props.maxStep, steps.length - 1) + 1))

const currentStep = ref(0)
const collectedData = ref({})

function resolveSxProjectId(project) {
  if (!project) return 0
  const raw = project.sxProjectId ?? project.id
  if (raw === '' || raw === null || raw === undefined) return 0
  return String(raw)
}

const ENTRY_SX_PROJECT_ID = resolveSxProjectId(props.project)

const workingProject = ref({
  ...(props.project || {}),
  id: props.project?.id ? String(props.project.id) : undefined,
  sxProjectId: ENTRY_SX_PROJECT_ID,
})

watch(
  () => props.project,
  (value) => {
    if (!value) return
    const { id: _id, sxProjectId: _sx, ...rest } = value
    workingProject.value = {
      ...workingProject.value,
      ...rest,
    }
  },
  { deep: true }
)

const resolvedProjectName = computed(
  () =>
    props.projectName ||
    props.project?.name ||
    props.project?.projectName ||
    ''
)

const modeLabel = computed(() => {
  if (props.createProjectMode === PACKAGE_TYPE.distributedDefault) return '分散式'
  if (props.createProjectMode === PACKAGE_TYPE.baseDefault) return '基地项目'
  return '集中式'
})

// ★ 标题：外部传了用外部；没传保留原来的可研标题
const titleText = computed(() => {
  if (props.title) return props.title
  return `一键生成风电场可行性研究报告（${modeLabel.value}）`
})

function handleSaveDraft(stepIndex, data) {
  collectedData.value[stepIndex] = data
  updateWorkingProject(data)
  emit('save-draft', {
    step: stepIndex,
    data: { ...collectedData.value },
    project: workingProject.value,
  })
}

function handleNext(stepIndex, data) {
  collectedData.value[stepIndex] = data
  updateWorkingProject(data)

  // ★ 判断当前是不是最后一步（按 maxStep 算）
  const lastStepIndex = Math.min(props.maxStep, steps.length - 1)
  if (stepIndex >= lastStepIndex) {
    // 直接走提交
    emit('submit', {
      data: { ...collectedData.value },
      project: workingProject.value,
    })
    return
  }

  currentStep.value = Math.min(stepIndex + 1, steps.length - 1)
}

function handleSubmit(data) {
  collectedData.value[currentStep.value] = data
  updateWorkingProject(data)
  emit('submit', {
    data: { ...collectedData.value },
    project: workingProject.value,
  })
}

function updateWorkingProject(data) {
  if (!data) return

  const { savedProjectId, form } = data
  const preservedSxProjectId = workingProject.value.sxProjectId

  workingProject.value = {
    ...workingProject.value,
    ...(form && typeof form === 'object' ? form : {}),
    ...(savedProjectId ? { id: savedProjectId } : {}),
    sxProjectId: preservedSxProjectId,
  }
}
</script>

<style scoped>
.report-wizard {
  position: relative;
  box-sizing: border-box;
  width: clamp(420px, 30vw, 520px);
  height: 90%;
  padding: 24px 28px 20px;
  overflow-y: auto;
  color: #1f2937;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}
.back-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; margin-bottom: 6px;
  border: none; border-radius: 50%; cursor: pointer;
  color: #2f8dff; background: #f0f6ff;
}
.back-btn svg { width: 14px; height: 14px; }
.wizard-title {
  margin: 12px 0 20px; color: #1f2937;
  font-size: 19px; font-weight: 600; text-align: center;
}
.step-indicator {
  display: flex; justify-content: center; gap: 6px;
  margin-bottom: 24px; color: #b5bac3; font-size: 13px;
}
.step-node { display: inline-flex; align-items: center; gap: 6px; }
.step-node.active, .step-node.done { color: #2f8dff; }
.step-num { font-weight: 600; }
.step-arrow { margin-left: 6px; color: #d1d5db; }
.wizard-body { padding-bottom: 8px; }
@media (max-width: 700px) {
  .report-wizard { width: 100%; padding: 20px 18px; }
  .wizard-title { font-size: 17px; }
  .step-indicator { gap: 2px; font-size: 11px; }
}
</style>