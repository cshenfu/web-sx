import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import ElementPlus, { ElMessageBox } from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/element-plus-overrides.css'

// 集中包装所有 Element Plus confirm：只统一删除/移除类提示
const originalConfirm = ElMessageBox.confirm.bind(ElMessageBox)

ElMessageBox.confirm = (message, title, options = {}) => {
  const text = typeof message === 'string' ? message : ''

  if (!/(删除|移除|delete)/i.test(text)) {
    return originalConfirm(message, title, options)
  }

  // 用 Vue VNode 显示文本，不把动态内容拼进 HTML
  const content = h('div', { class: 'global-delete-confirm-content' }, [
    h('div', { class: 'global-delete-confirm-question' }, text),
    ...(text.includes('删除后不可恢复')
      ? []
      : [h('div', { class: 'global-delete-confirm-note' }, '删除后不可恢复')]),
  ])

  const nextOptions = { ...options }
  const existingClass = nextOptions.customClass

  // 移除 warning 图标，匹配截图中没有图标的布局
  delete nextOptions.type

  return originalConfirm(content, '删除提示', {
    ...nextOptions,
    showCancelButton: true,
    cancelButtonText: '取消',
    confirmButtonText: '确认删除',
    cancelButtonClass: 'global-delete-confirm-cancel',
    confirmButtonClass: 'global-delete-confirm-submit',
    customClass: [existingClass, 'global-delete-confirm-box']
      .filter(Boolean)
      .join(' '),
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Antd)
app.use(ElementPlus)

app.mount('#app')