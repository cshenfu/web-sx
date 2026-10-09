<!-- components/shared/FileListItem.vue -->
<!-- 通用文件条目：类型标签 + 文件名/描述 + 可选缩略图 + 元信息行 + 操作按钮。
     点击卡片触发 click 事件，底部按钮和缩略图区不冒泡。 -->
     <template>
      <div class="file-item" @click="onClick">
        <div class="file-item-tags">
          <span v-if="file.tag" class="tag">{{ file.tag }}</span>
          <span v-if="file.tag2" class="tag tag-secondary">{{ file.tag2 }}</span>
          <span v-if="file.org" class="meta-inline">{{ file.org }}</span>
          <span v-if="file.docNo" class="meta-inline">| {{ file.docNo }}</span>
          <span v-if="file.date" class="meta-inline muted">| {{ file.date }}</span>
        </div>
    
        <div v-if="file.name" class="file-item-name" :title="file.name">
          {{ file.name }}
        </div>
    
        <div v-if="file.description" class="file-item-desc">
          {{ file.description }}
        </div>
    
        <!-- 缩略图区域：点击只预览，不冒泡到卡片 -->
        <div
          v-if="previewList.length"
          class="file-item-thumbs"
          @click.stop
        >
          <el-image
            v-for="(src, idx) in previewList"
            :key="idx"
            class="thumb"
            :src="src"
            :preview-src-list="previewList"
            :initial-index="idx"
            fit="cover"
            preview-teleported
            hide-on-click-modal
          >
            <template #error>
              <div class="thumb-error">图片加载失败</div>
            </template>
          </el-image>
        </div>
    
        <div class="file-item-footer">
          <span class="footer-meta">
            <span v-if="file.updatedAt" class="footer-time">
              <svg viewBox="0 0 16 16" class="icon-clock"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.6V8l2.4 1.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              {{ file.updatedAt }}
            </span>
            <span v-if="file.operator" class="footer-operator">
              <svg viewBox="0 0 16 16" class="icon-user"><circle cx="8" cy="5.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M3.2 13c0-2.4 2.1-4 4.8-4s4.8 1.6 4.8 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
              {{ file.operator }}
            </span>
          </span>
    
          <span v-if="actionsToShow.length" class="footer-actions" @click.stop>
            <button
              v-for="action in actionsToShow"
              :key="action"
              type="button"
              class="action-link"
              :class="`action-${action}`"
              @click="$emit('action', action, file)"
            >
              {{ actionLabels[action] || action }}
            </button>
          </span>
        </div>
      </div>
    </template>
    
    <script setup>
    import { computed } from 'vue'
    
    const props = defineProps({
      file: {
        type: Object,
        required: true,
      },
    })
    
    const emit = defineEmits(['action', 'click'])
    
    const actionLabels = {
      download: '下载',
      addImage: '追加图片',
      edit: '编辑',
      delete: '删除',
    }
    function onClick() {
      console.log('[FileListItem] 卡片被点击', props.file)
      emit('click', props.file)
    }
    // 未显式指定 actions 时，默认不展示任何操作按钮
    const actionsToShow = computed(() => props.file.actions || [])
    
    // 缩略图预览列表：兼容 imageList 里 image.filePath 或直接字符串
    const previewList = computed(() => {
      const list = props.file.imageList || []
      return list
        .map((img) => (typeof img === 'string' ? img : img?.filePath))
        .filter(Boolean)
    })
    </script>
    
    <style scoped>
    .file-item {
      padding: 12px 8px;
      margin: 0 -8px;
      border-bottom: 1px solid rgba(118, 213, 255, 0.12);
      border-radius: 4px;
      color: #d9f5ff;
      cursor: pointer;
      transition: background 0.15s;
    }
    
    .file-item:hover {
      background: rgba(82, 190, 245, 0.08);
    }
    
    .file-item:last-child {
      border-bottom: none;
    }
    
    .file-item-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      font-size: 12px;
    }
    
    .tag {
      padding: 1px 6px;
      border-radius: 3px;
      color: #9bdfff;
      background: rgba(43, 130, 179, 0.35);
      font-size: 11px;
      line-height: 1.6;
      white-space: nowrap;
    }
    
    .tag-secondary {
      color: #bcecff;
      background: rgba(255, 255, 255, 0.08);
    }
    
    .meta-inline {
      color: #8fb9cc;
      font-size: 12px;
    }
    
    .meta-inline.muted {
      color: #6f93a6;
    }
    
    .file-item-name {
      overflow: hidden;
      margin-top: 6px;
      color: #effbff;
      font-size: 13px;
      line-height: 1.5;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-item-desc {
      margin-top: 6px;
      color: #9bdfff;
      font-size: 12px;
      line-height: 1.6;
    }
    
    /* 缩略图行 */
    .file-item-thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      cursor: default;
    }
    
    .thumb {
      box-sizing: border-box;
      width: 64px;
      height: 64px;
      border: 1px solid rgba(118, 213, 255, 0.35);
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
      transition: border-color 0.15s;
    }
    
    .thumb:hover {
      border-color: #52c1ff;
    }
    
    .thumb :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .thumb-error {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #7fa8bb;
      font-size: 10px;
      background: rgba(0, 18, 39, 0.6);
    }
    
    .file-item-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }
    
    .footer-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #7fa8bb;
      font-size: 11px;
    }
    
    .footer-time,
    .footer-operator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .icon-clock,
    .icon-user {
      width: 12px;
      height: 12px;
    }
    
    .footer-actions {
      display: flex;
      gap: 12px;
      cursor: default;
    }
    
    .action-link {
      padding: 0;
      border: none;
      background: none;
      color: #52c1ff;
      font-size: 12px;
      cursor: pointer;
    }
    
    .action-link.action-delete {
      color: #ff7e7e;
    }
    
    .action-link:hover {
      text-decoration: underline;
    }
    </style>