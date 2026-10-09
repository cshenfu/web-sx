<!-- components/report-wizard/shared/UploadBox.vue -->
<!-- 简单的原生文件上传框：点击选择/拖拽上传，展示已选文件名+删除。
     TODO：接口就绪后，在 handleFiles 里把文件传给真实的上传接口，
     upload 事件把 File 对象往外抛，父组件负责发请求。 -->
     <template>
        <div
          class="upload-box"
          :class="{ dragover: isDragOver }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerSelect"
        >
          <input
            ref="inputRef"
            type="file"
            class="hidden-input"
            :accept="accept"
            @change="handleChange"
          />
          <template v-if="!files.length">
            <span class="upload-btn">上传数据</span>
            <p v-if="tip" class="upload-tip">{{ tip }}</p>
          </template>
          <ul v-else class="file-list" @click.stop>
            <li v-for="(file, idx) in files" :key="idx">
              <a class="file-name" href="javascript:void(0)">{{ file.name }}</a>
              <button type="button" class="remove-btn" @click="removeFile(idx)">×</button>
            </li>
          </ul>
        </div>
      </template>
      
      <script setup>
      import { ref } from 'vue'
      
      const props = defineProps({
        accept: { type: String, default: '.docx' },
        tip: { type: String, default: '' },
        maxCount: { type: Number, default: 1 },
      })
      
      const emit = defineEmits(['upload', 'remove'])
      
      const inputRef = ref(null)
      const isDragOver = ref(false)
      const files = ref([])
      
      function triggerSelect() {
        if (files.value.length >= props.maxCount) return
        inputRef.value?.click()
      }
      
      function handleChange(e) {
        const list = Array.from(e.target.files || [])
        addFiles(list)
        e.target.value = ''
      }
      
      function handleDrop(e) {
        isDragOver.value = false
        addFiles(Array.from(e.dataTransfer.files || []))
      }
      
      function addFiles(list) {
        if (!list.length) return
        const next = list.slice(0, props.maxCount - files.value.length)
        files.value.push(...next)
        next.forEach((file) => emit('upload', file))
      }
      
      function removeFile(idx) {
        const [removed] = files.value.splice(idx, 1)
        emit('remove', removed)
      }
      </script>
      
      <style scoped>
      .upload-box {
        padding: 10px 0;
        cursor: pointer;
      }
      
      .hidden-input {
        display: none;
      }
      
      .upload-btn {
        display: inline-block;
        padding: 6px 16px;
        border: 1px solid #2f8dff;
        border-radius: 4px;
        color: #2f8dff;
        font-size: 12.5px;
      }
      
      .upload-box.dragover .upload-btn {
        background: rgba(47, 141, 255, 0.08);
      }
      
      .upload-tip {
        margin-top: 8px;
        color: #9ca3af;
        font-size: 12px;
        line-height: 1.6;
      }
      
      .file-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .file-list li {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .file-name {
        color: #2f8dff;
        font-size: 12.5px;
        text-decoration: none;
      }
      
      .remove-btn {
        border: none;
        background: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
      }
      
      .remove-btn:hover {
        color: #ff6b6b;
      }
      </style>