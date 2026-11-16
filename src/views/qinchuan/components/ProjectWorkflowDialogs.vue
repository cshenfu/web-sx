<template>
  <VerifyPanel
    v-if="verifyMounted"
    :visible="visibility.verify"
    :project="verifyProject"
    @close="$emit('close-verify')"
    @saved="$emit('verify-saved', $event)"
  />

  <AssignDialog
    :model-value="visibility.assign"
    :project="assignProject"
    @update:model-value="$emit('update:assign', $event)"
    @success="$emit('assign-success', $event)"
  />

  <ReserveApprovalDialog
    :model-value="visibility.reserve"
    :project="reserveProject"
    @update:model-value="$emit('update:reserve', $event)"
    @saved="$emit('reserve-saved', $event)"
  />

  <AddReportPanel
    :visible="visibility.addReport"
    :project="reportProject"
    @close="$emit('close-add-report')"
    @success="$emit('report-success', $event)"
  />

  <ConfirmReportPanel
    :visible="visibility.confirm"
    :report-id="reportId"
    @close="$emit('close-confirm')"
    @success="$emit('confirm-success', $event)"
  />
</template>

<script setup>
import VerifyPanel from './VerifyPanel.vue'
import AssignDialog from './AssignDialog.vue'
import ReserveApprovalDialog from './ReserveApprovalDialog.vue'
import AddReportPanel from './area-panel/AddReportPanel.vue'
import ConfirmReportPanel from './area-panel/ConfirmReportPanel.vue'

defineProps({
  visibility: {
    type: Object,
    default: () => ({
      verify: false,
      assign: false,
      reserve: false,
      addReport: false,
      confirm: false,
    }),
  },
  verifyProject: { type: Object, default: null },
  assignProject: { type: Object, default: null },
  reserveProject: { type: Object, default: null },
  reportProject: { type: Object, default: null },
  reportId: { type: [String, Number], default: null },
  verifyMounted: { type: Boolean, default: true },
})

defineEmits([
  'close-verify',
  'verify-saved',
  'update:assign',
  'assign-success',
  'update:reserve',
  'reserve-saved',
  'close-add-report',
  'report-success',
  'close-confirm',
  'confirm-success',
])
</script>
