<template>
    <div class="yanping-page">
      <!-- 渐变背景 -->
      <div class="bg-gradient" />
  
      <!-- 卡片区域 -->
      <div class="card-container">
        <div
          v-for="item in modules"
          :key="item.key"
          class="module-card"
        >
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.desc }}</p>
          <el-button type="primary" @click="enter(item)">开始使用</el-button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // 后续增加子系统，只需往这里加一项
  const modules = [
    {
      key: 'review',
      title: '智能评审',
      desc: '目前支持对风电、光伏项目可行性研究报告（word版本）进行一键智能评审，可智能评审项目中发电量、技经概算、财务等指标，定位异常数据，并给出合理建议值。',
      path: '/yanping/review'
    },
    {
      key: 'budget',
      title: '技经概算',
      desc: '风电、光伏项目技经概算工具。',
      path: '/yanping/budget'
    },
    {
      key: 'finance',
      title: '财务评价',
      desc: '风电、光伏项目财务评价工具。',
      path: '/yanping/finance'
    }
  ]
  
  function enter(item) {
    router.push(item.path)
  }
  </script>
  
  <style scoped>
  .yanping-page {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  
  /* 浅紫渐变背景 */
  .bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(200, 210, 255, 0.5) 0%,
      rgba(220, 225, 255, 0.3) 30%,
      rgba(255, 255, 255, 0) 65%
    );
    pointer-events: none;
  }
  
  /* 三卡片横排 */
  .card-container {
    display: flex;
    gap: 32px;
    padding: 0 60px;
    z-index: 1;
    align-items: flex-start;
  }
  
  .module-card {
    flex: 1;
    max-width: 320px;
    background: #fff;
    border-radius: 12px;
    padding: 40px 32px 36px;
    box-shadow: 0 2px 16px rgba(100, 120, 200, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  
  .module-card:hover {
    box-shadow: 0 6px 28px rgba(100, 120, 200, 0.2);
    transform: translateY(-4px);
  }
  
  .card-title {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0;
  }
  
  .card-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin: 0;
    min-height: 80px; /* 保持三卡片对齐 */
  }
  
  /* 按钮宽度统一 */
  .el-button {
    width: 120px;
    border-radius: 6px;
  }
  </style>