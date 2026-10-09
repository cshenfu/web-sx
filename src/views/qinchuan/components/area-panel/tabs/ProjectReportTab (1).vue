<!-- components/area-panel/tabs/ProjectReportTab.vue -->
<template>
  <div class="project-report-tab">
    <div class="sub-tabs">
      <button
        v-for="tab in data.subTabs"
        :key="tab.key"
        type="button"
        class="sub-tab"
        :class="{ active: activeSubTab === tab.key }"
        @click="activeSubTab = tab.key"
      >
        {{ tab.label }}
        <span class="count">({{ tab.count }})</span>
      </button>
    </div>

    <div class="table-wrap">
      <table class="report-table">
        <thead>
          <tr>
            <th v-for="col in data.columns" :key="col">{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in data.rows" :key="idx">
            <td>{{ row.id }}</td>
            <td>{{ row.calcType }}</td>
            <td>{{ row.fileType }}</td>
            <td class="ellipsis" :title="row.unit">{{ row.unit }}</td>
            <td>{{ row.capacity }}</td>
            <td>
              <span class="status-tag" :class="`status-${row.statusType}`">{{ row.status }}</span>
            </td>
            <td>{{ row.remark }}</td>
            <td>{{ row.createdAt }}</td>
            <td>
              <button type="button" class="row-action" @click="$emit('row-action', row)">···</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

defineEmits(['row-action'])

const activeSubTab = ref(
  props.data.subTabs.find((t) => t.active)?.key || props.data.subTabs[0]?.key
)
</script>

<style scoped>
.project-report-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  overflow: hidden;
}

.sub-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sub-tab {
  padding: 6px 12px;
  border: 1px solid rgba(118, 213, 255, 0.25);
  border-radius: 4px;
  cursor: pointer;
  color: #9bdfff;
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
  white-space: nowrap;
}

.sub-tab.active {
  border-color: #49d5ff;
  color: #fff;
  background: rgba(12, 130, 178, 0.8);
}

.count {
  margin-left: 2px;
  opacity: 0.8;
}

.table-wrap {
  flex: 1;
  min-height: 0;
  margin-top: 12px;
  overflow: auto;
}

.report-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 12px;
}

.report-table th {
  position: sticky;
  top: 0;
  padding: 8px 6px;
  color: #7fa8bb;
  text-align: left;
  font-weight: 400;
  background: #0a2c4d;
  border-bottom: 1px solid rgba(118, 213, 255, 0.18);
  white-space: nowrap;
}

.report-table td {
  max-width: 160px;
  padding: 8px 6px;
  color: #d9f5ff;
  border-bottom: 1px solid rgba(118, 213, 255, 0.08);
  white-space: nowrap;
}

.report-table td.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  font-size: 12px;
}

.status-success {
  color: #52d78a;
}

.status-info {
  color: #52b8ff;
}

.status-warning {
  color: #ffab52;
}

.status-danger {
  color: #ff6b6b;
}

.row-action {
  padding: 0 4px;
  border: none;
  background: none;
  color: #9bdfff;
  cursor: pointer;
}
</style>
