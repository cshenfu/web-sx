<template>
  <SiteMapPage
    stage="PROJECT_RESERVE"
    summary-title="项目储备概况"
    status-column="verify"
    :card-actions="['share', 'establish', 'verify', 'edit', 'delete']"
    :row-actions="['material', 'edit', 'assign', 'delete']"
    :show-verify-panel-flag="true"
  />
</template>

<script setup>
import SiteMapPage from './components/SiteMapPage.vue'
</script>