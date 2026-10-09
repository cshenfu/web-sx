<template>
    <img
      class="dashboard-head"
      :src="headImage"
      :alt="alt"
    />
  </template>
  
  <script setup>
  import headImage from '@/assets/img/qinchuan/dashbord/head.png'
  
  defineProps({
    alt: {
      type: String,
      default: '规划部业务数据全景图',
    },
  })
  </script>
  
  <style scoped>
  .dashboard-head {
    display: block;
    width: 100%;
    height: auto;
    user-select: none;
    pointer-events: none;
  }
  </style>