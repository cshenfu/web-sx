<template>
  <div class="dashboard-head-wrapper">
    <!-- 头部背景图 -->
    <img
      class="dashboard-head-img"
      :src="headImage"
      :alt="alt"
    />
    <!-- 标题：改为动态字符串，样式类保持 -->
    <div class="head-title">{{ title }}</div>
    
    <!-- 右侧操作区：日期 + 全屏按钮 -->
    <div class="head-right-info">
      <span class="date-text">{{ currentDate }}，{{ currentDay }}</span>
      
      <div 
        class="fullscreen-btn" 
        :title="isFullScreen ? '退出全屏' : '进入全屏'"
        @click="toggleFullScreen"
      >
        <!-- 保持你原来的 svg 不变 -->
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_dd_715_13239)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 10V15.5H10V13.5H13.5V10H15.5ZM24.5 10V13.5H28V15.5H22.5V10H24.5ZM13.5 28V24.5H10V22.5H15.5V28H13.5ZM22.5 28V22.5H27.9498V24.5H24.5V28H22.5Z" fill="#D8F0FF"/>
          </g>
          <defs>
            <filter id="filter0_dd_715_13239" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
              <feFlood flood-opacity="0" result="BackgroundImageFix"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="5"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.567635 0 0 0 0 1 0 0 0 1 0"/>
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_715_13239"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="2"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.568627 0 0 0 0 1 0 0 0 1 0"/>
              <feBlend mode="normal" in2="effect1_dropShadow_715_13239" result="effect2_dropShadow_715_13239"/>
              <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_715_13239" result="shape"/>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import headImage from '@/assets/img/qinchuan/dashbord/head.png'

const props = defineProps({
  // 新增标题字段，接收外部传入的字符串
  title: {
    type: String,
    default: '华勤智策数据全景图',
  },
  alt: {
    type: String,
    default: '规划部业务数据全景图',
  },
})

// 全屏状态
const isFullScreen = ref(!!document.fullscreenElement)

// 获取日期和星期
const currentDate = computed(() => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
})

const currentDay = computed(() => {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return days[new Date().getDay()]
})

// 切换全屏
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    const docEl = document.documentElement
    if (docEl.requestFullscreen) docEl.requestFullscreen()
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen()
  } else {
    if (document.exitFullscreen) document.exitFullscreen()
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
  }
}

// 监听全屏变化（用于同步图标状态）
const handleFullscreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.dashboard-head-wrapper {
  position: relative;
  width: 100%;
}

.dashboard-head-img {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none;
}

/* 核心标题样式 */
.head-title {
  /* 其他属性保持不变 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  
  /* 应用字体，保留兜底字体 */
  font-family: 'Alimama FangYuanTi VF';
  
  /* 这个字体是可变字体（VF），直接写数字字重即可 */
  font-weight: 600; 
  font-size: 30px; 
  line-height: 1;
  letter-spacing: 5px;
  text-align: center;
  white-space: nowrap;
  color: #ffffff;
  text-indent: 5px;

  /* 多层发光效果 */
  text-shadow: 
    0 0 2px rgba(255, 255, 255, 0.9),
    0 0 8px rgba(0, 145, 255, 0.9),
    0 0 16px rgba(0, 145, 255, 0.7),
    0 0 30px rgba(0, 145, 255, 0.5),
    0 0 50px rgba(0, 145, 255, 0.3);
}

/* 右侧信息区域（日期 + 全屏按钮） */
.head-right-info {
  position: absolute;
  right: clamp(24px, 2.5vw, 48px);
  top: 40%;
  transform: translateY(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 日期文字样式 */
.date-text {
  color: #d8f0ff;
  font-size: 14px;
  font-family: 'DIN Alternate', 'Roboto', sans-serif;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(0, 200, 255, 0.6);
  white-space: nowrap;
}

/* 全屏按钮 */
.fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  filter: drop-shadow(0 0 5px rgba(0, 200, 255, 0.5));
}

.fullscreen-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 12px rgba(0, 200, 255, 0.9));
}
</style>