<template>
    <ProjectStageMapPage :tabs="tabs" action-label="开始立项" :projects="projects" />
  </template>
  
  <script setup>
  import ProjectStageMapPage from './components/ProjectStageMapPage.vue'
  import MainInfoTab from './components/tabs/MainInfoTab.vue'
  import MaterialsTab from './components/tabs/MaterialsTab.vue'
  
  const tabs = [
    { key: 'main-info', label: '主要信息', component: MainInfoTab },
    { key: 'materials', label: '立项材料', component: MaterialsTab }
  ]
  
  // TODO: 接入项目储备阶段的项目列表接口
  const projects = []
  </script>