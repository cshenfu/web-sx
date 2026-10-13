<template>
  <SiteMapPage
    stage="INVESTMENT_DECISION"
    summary-title="投资决策概况"
    status-column="approval"
    :card-actions="['share', 'edit', 'delete']"
    :row-actions="['investMeeting', 'edit', 'assign', 'delete']"
  />
</template>

<script setup>
import SiteMapPage from './components/SiteMapPage.vue'
</script>