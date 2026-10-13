<template>
  <SiteMapPage
    stage="PROJECT_INITIATION"
    summary-title="立项概况"
    status-column="approval"
    :card-actions="['share', 'verify', 'edit', 'delete']"
    :row-actions="['establishMeeting', 'researchMaterial', 'edit', 'assign', 'delete']"
    :show-verify-panel-flag="true"
  />
</template>

<script setup>
import SiteMapPage from './components/SiteMapPage.vue'
</script>