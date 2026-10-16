<template>
  <SiteMapPage
    stage="PRELIMINARY_SELECTION"
    summary-title="项目通道概况"
    status-column="verify"
    :card-actions="['share', 'reserve', 'verify', 'edit', 'delete']"
    :row-actions="['assign', 'reserve', 'verify', 'edit', 'delete']"
    :show-config-page="true"
    :show-verify-panel-flag="true"
  />
</template>

<script setup>
import SiteMapPage from './components/SiteMapPage.vue'
</script>