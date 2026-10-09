<template>
    <ProjectStageMapPage :tabs="tabs" action-label="开始立项" :projects="projects" />
  </template>
  
  <script setup>
  import ProjectStageMapPage from './components/ProjectStageMapPage.vue'
  import MainInfoTab from './components/tabs/MainInfoTab.vue'
  import MaterialsTab from './components/tabs/MaterialsTab.vue'
  import MeetingTab from './components/tabs/MeetingTab.vue'
  
  const tabs = [
    { key: 'main-info', label: '主要信息', component: MainInfoTab },
    { key: 'materials', label: '决策材料', component: MaterialsTab },
    { key: 'meeting', label: '投决上会', component: MeetingTab }
  ]
  
  const projects = []
  </script>