<!--
  财务评价 - 项目预览页
  路由: /financeEval/preview
  文件位置: src/pages/financeEval/preview/FinancePreview.vue
-->
<template>
    <div class="fp-page">
      <!-- 顶部栏 -->
      <!-- <div class="fp-header">
        <a-button class="fp-back-btn" @click="goBack">
          <template #icon>
            <left-outlined />
          </template>
          返回
        </a-button>
        <h2 class="fp-title">{{ projectName || '项目预览' }}</h2>
        <div class="fp-header-right" />
      </div> -->
      <p class="title-fin">
        <span class="fspan" @click="goBack">财务评价</span>
        <span>/</span>
        <span class="sspan">预览</span>
      </p>
  
      <!-- 加载中 -->
      <div v-if="loading" class="fp-loading">
        <a-spin size="large" tip="加载中…" />
      </div>
  
      <!-- 无计算结果 -->
      <div v-else-if="!resultParam" class="fp-empty">
        <div class="fp-empty-icon">📊</div>
        <p class="fp-empty-text">该项目暂无计算结果，请先在编辑页完成计算后再预览</p>
        <a-button type="primary" @click="goBack">返回编辑</a-button>
      </div>
  
      <!-- 有结果：复用 CalculationTab -->
      <div v-else class="fp-content">
        <CalculationTab :result="resultParam" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { message } from 'ant-design-vue'
  import { LeftOutlined } from '@ant-design/icons-vue'
  
  import CalculationTab from '@/views/yanping/finance/financeEval/create/tabs/CalculationTab.vue'
  import { getProjectIfnoById } from '@/api/modules/pric.js'
  
  const router = useRouter()
  const route  = useRoute()
  
  const loading     = ref(false)
  const resultParam = ref(null)
  const projectName = ref('')
  
  onMounted(async () => {
    // 与 Create.vue 保持一致：用 route.query.id 查项目
    const id = route.query.id
    if (!id) {
      message.warning('缺少项目参数，请从项目列表进入')
      return
    }
  
    loading.value = true
    try {
      const res = await getProjectIfnoById(id)
      if (res && res.code === 200 && res.data) {
        projectName.value = res.data.projectName || ''
        // resultParam 是 JSON 字符串，需先解析；为空时保持 null，显示空状态提示
        if (res.data.resultParam) {
          try {
            resultParam.value = JSON.parse(res.data.resultParam)
          } catch {
            message.error('计算结果数据格式异常，无法解析')
          }
        }
      } else {
        message.error(res?.msg || '加载项目数据失败')
      }
    } catch {
      message.error('加载项目数据失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
  
  function goBack() {
    router.back()
  }
  </script>
  
  <style scoped>
  .fp-page {
    padding: 16px 24px 30px 24px;
    margin: 8px 0 0 16px;
    height: 100%;
    background-color: #fff;
    border-radius: 12px 0 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  /* ── 顶部栏 ───────────────────────────────────────────── */
  .fp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-shrink: 0;
  }
  
  .fp-back-btn {
    width: 80px;
  }
  
  .fp-title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    color: #222;
    margin: 0;
    /* 防止长项目名把右侧占位挤没 */
    padding: 0 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* 右侧占位，保证标题水平居中 */
  .fp-header-right {
    width: 80px;
  }
  
  /* ── 加载中 ────────────────────────────────────────────── */
  .fp-loading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* ── 无结果空状态 ───────────────────────────────────────── */
  .fp-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #aaa;
  }
  
  .fp-empty-icon {
    font-size: 56px;
  }
  
  .fp-empty-text {
    font-size: 15px;
    color: #999;
    margin: 0;
  }
  
  /* ── 内容区（交给 CalculationTab 自己撑满） ──────────────── */
  .fp-content {
    flex: 1;
    overflow: auto;
    min-height: 0;
  }

  .title-fin{
    font-size: 14px;
    margin-bottom: 20px;
  }

  .title-fin span{
    cursor: pointer;
    margin-right: 10px;
  }

  .fspan{
    color: #999;
  }

  .sspan{
    color: #0389ea;
  }
  </style>
  