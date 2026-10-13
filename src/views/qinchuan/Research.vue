<template>
  <SiteMapPage
    stage="FEASIBILITY_REVIEW"
    summary-title="可研概况"
    status-column="approval"
    :card-actions="['share', 'verify', 'edit', 'delete']"
    :row-actions="['researchReview', 'investMaterial', 'edit', 'assign', 'delete']"
    :show-verify-panel-flag="true"
  />
</template>

<script setup>
import SiteMapPage from './components/SiteMapPage.vue'
</script>